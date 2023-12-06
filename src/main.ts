import { Actor, log } from "apify";
import { sleep, PuppeteerCrawler } from "crawlee";

import { parseInput } from "./parseInput.js";

import type { Input } from "./types.js";

const { APIFY_DEFAULT_KEY_VALUE_STORE_ID } = process.env;

await Actor.init();
const input = (await Actor.getInput()) as Input;

const {
    url,
    waitUntil,
    delay,
    width,
    scrollToBottom,
    delayAfterScrolling,
    waitUntilNetworkIdleAfterScroll,
    waitUntilNetworkIdleAfterScrollTimeout,
} = await parseInput(input);

const { proxy } = (await Actor.getInput()) as any;
const proxyConfiguration = await Actor.createProxyConfiguration(proxy);

const calculateRequestHandlerTimeoutSecs = (
    scrollToBottom: boolean,
    waitUntilNetworkIdleAfterScroll: boolean,
    waitUntilNetworkIdleAfterScrollTimeout: number,
    delayAfterScrolling: number
): number => {
    const delaySeconds  = (delay * 1000);
    
    if (!scrollToBottom) {
        return 60 + delaySeconds;
    }

    if (waitUntilNetworkIdleAfterScroll) {
        return 60 + (waitUntilNetworkIdleAfterScrollTimeout * 1000) + delaySeconds;
    }

    return 60 + (delayAfterScrolling * 1000) + delaySeconds;
};

const requestHandlerTimeoutSecs = calculateRequestHandlerTimeoutSecs(
    scrollToBottom,
    waitUntilNetworkIdleAfterScroll,
    waitUntilNetworkIdleAfterScrollTimeout,
    delayAfterScrolling
);

const puppeteerCrawler = new PuppeteerCrawler({
    launchContext: {
        useChrome: true,
    },
    proxyConfiguration,
    navigationTimeoutSecs: 3600,
    requestHandlerTimeoutSecs,
    preNavigationHooks: [
        async ({ page }, goToOptions) => {
            goToOptions!.waitUntil = waitUntil;
            goToOptions!.timeout = 3600000;

            log.info("Changing viewport width");
            await page.setViewport({ width, height: 1080 });
        },
    ],
    requestHandler: async ({ page }) => {
        log.info("Page is ready for screenshot");
        if (delay > 0) {
            log.info(`Waiting ${delay}ms as specified in input`);
            await sleep(delay);
        }

        if (scrollToBottom) {
            log.info("Scrolling to bottom of the page");
            try {
                await page.evaluate(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                });
                if (waitUntilNetworkIdleAfterScroll) {
                    log.info("Waiting until network is idle");
                    await page.waitForNetworkIdle({ timeout: 30000 }).catch(() => {
                        log.warning("Waiting until network is idle after scroll failed!");
                    });
                } else if (delayAfterScrolling > 0) {
                    log.info(`Waiting ${delayAfterScrolling}ms after scroll as specified in input`);
                    await sleep(delayAfterScrolling);
                }
            } catch (error) {
                log.warning("Scrolling to bottom of the page failed!");
            }
        }

        log.info("Saving screenshot");
        const screenshotBuffer = await page.screenshot({ fullPage: true });
        await Actor.setValue("screenshot", screenshotBuffer, { contentType: "image/png" });
        const screenshotUrl = `https://api.apify.com/v2/key-value-stores/${APIFY_DEFAULT_KEY_VALUE_STORE_ID}/records/screenshot?disableRedirect=true`;
        log.info("Screenshot saved you can view it here:");
        log.info(screenshotUrl);

        await Actor.pushData({
            url: page.url(),
            screenshotUrl,
        });
    },
});

log.info("Launching new page...");
await puppeteerCrawler.run([url]);

await Actor.exit();
