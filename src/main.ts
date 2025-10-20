import { Actor, log } from "apify";
import { sleep, PuppeteerCrawler, RequestList } from "crawlee";

import { isWaitUntilOption, type Input, WAIT_UNTIL_OPTIONS, isFormat, FORMATS } from "./types.js";
import { calculateRequestHandlerTimeoutSecs, generateScreenshotName } from "./utils.js";

const NAVIGATION_TIMEOUT_SECS = 3600;
const TIMEOUT_MS = 3_600_000;

await Actor.init();
const input = await Actor.getInput<Input>() ?? {} as Input;

const {
    urls = [],
    format = 'png',
    viewportWidth,
    scrollToBottom = false,
    delayAfterScrolling = 0,
    delay,
    waitUntil,
    waitUntilNetworkIdleAfterScroll = false,
    waitUntilNetworkIdleAfterScrollTimeout = 30,
    proxy = { useApifyProxy: true },
    selectorsToHide,
} = input;

if (!isFormat(format)) {
    throw await Actor.fail(`Format must be one of: ${FORMATS.join(', ')}.`)
}

if (viewportWidth === undefined || viewportWidth < 100 || viewportWidth > 3840) {
    throw await Actor.fail(`Viewport must be defined and inside range 100-3840 (px). Received: ${viewportWidth}`)
}

if (delay === undefined || delay < 0 || delay > 3_600_000) {
    throw await Actor.fail(`Delay must be defined and inside range 0-3,600,000 (ms). Received: ${delay}`)
}

if (waitUntil === undefined || !isWaitUntilOption(waitUntil)) {
    throw await Actor.fail(`WaitUntil must be defined and one of: ${WAIT_UNTIL_OPTIONS.join(', ')}. Received: ${waitUntil}`)
}

const validUrls = urls.filter(({ url }) => {
    try {
        const { hostname } = new URL(url);
        if (!hostname) { return false; }
        return true;
    } catch (error) {
        log.error(`Skipping invalid URL.`, { url });
        return false;
    }
})

const requestList = await RequestList.open('START_URLS', validUrls);

const requestHandlerTimeoutSecs = calculateRequestHandlerTimeoutSecs(
    scrollToBottom,
    waitUntilNetworkIdleAfterScroll,
    waitUntilNetworkIdleAfterScrollTimeout,
    delayAfterScrolling,
    delay,
);

const puppeteerCrawler = new PuppeteerCrawler({
    launchContext: {
        useChrome: false,
    },
    proxyConfiguration: await Actor.createProxyConfiguration(proxy),
    navigationTimeoutSecs: NAVIGATION_TIMEOUT_SECS,
    requestHandlerTimeoutSecs,
    headless: Actor.isAtHome(),
    requestList,
    preNavigationHooks: [
        async ({ page }, goToOptions) => {
            goToOptions!.waitUntil = waitUntil;
            goToOptions!.timeout = TIMEOUT_MS;

            await page.setViewport({ width: viewportWidth, height: 1080 });
        },
    ],
    requestHandler: async ({ page, request }) => {
        const { url } = request;

        if (delay > 0) {
            log.info(`Waiting ${delay}ms as specified in input`);
            await sleep(delay);
        }

        if (scrollToBottom) {
            log.info("Scrolling to bottom of the page");
            try {
                await page.evaluate(async () => {
                    let i = 0;
                    while (i < document.body.scrollHeight) {
                        i += 250;
                        await new Promise((resolve) => setTimeout(resolve, 50));
                        window.scrollTo(0, i);
                    }
                });
                if (waitUntilNetworkIdleAfterScroll) {
                    log.info("Waiting until network is idle");
                    await page.waitForNetworkIdle({ timeout: waitUntilNetworkIdleAfterScrollTimeout }).catch(() => {
                        log.warning("Waiting until network is idle after scroll failed!");
                    });
                }
                if (delayAfterScrolling > 0) {
                    log.info(`Waiting ${delayAfterScrolling}ms after scroll as specified in input`);
                    await sleep(delayAfterScrolling);
                }
            } catch (error) {
                log.warning("Scrolling to bottom of the page failed!");
            }
        }

        if (selectorsToHide?.length) {
            await page.$$eval(selectorsToHide, (elements) => {
                for (const element of elements) {
                    (element as HTMLElement).style.display = "none";
                }
            });
        }

        log.info("Saving screenshot...");
        const screenshotKey = generateScreenshotName(url);

        let screenshotBuffer: Uint8Array;
        let contentType: string

        switch (format) {
            case 'png':
                screenshotBuffer = await page.screenshot({ fullPage: true });
                contentType = 'image/png'
                break;
            case 'pdf':
                // `page.pdf` crashes with puppeteer 22: downgraded to 21
                screenshotBuffer = await page.pdf();
                contentType = 'application/pdf'
                break;
            default:
                throw new Error(`Unsupported format: ${format}`);
        }

        await Actor.setValue(screenshotKey, screenshotBuffer, { contentType });

        const defaultKvStore = await Actor.openKeyValueStore();
        const screenshotUrlObject = new URL(defaultKvStore.getPublicUrl(screenshotKey));
        screenshotUrlObject.searchParams.set('disableRedirect', 'true');

        const screenshotUrl = screenshotUrlObject.toString();

        log.info(`Screenshot saved, you can view it here: \n${screenshotUrl}`);

        await Actor.pushData({
            startUrl: url,
            url: page.url(),
            screenshotUrl,
            screenshotKey,
        });
    },
});

await puppeteerCrawler.run(urls);

await Actor.exit();
