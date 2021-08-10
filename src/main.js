const Apify = require('apify');
const parseInput = require('./parseInput');
const { saveScreenshot } = require('./utils');

const { log } = Apify.utils;
const { APIFY_DEFAULT_KEY_VALUE_STORE_ID } = process.env;

Apify.main(async () => {
    // Load query from input
    const input = await Apify.getValue('INPUT');
    const { url, waitUntil, delay, width } = await parseInput(input);

    const { proxy } = await Apify.getInput();
    const proxyConfiguration = await Apify.createProxyConfiguration(proxy);

    let proxyUrl;
    if (proxyConfiguration) proxyUrl = proxyConfiguration.newUrl();
    
    const browser = await Apify.launchPuppeteer({
            useChrome: true,
            proxyUrl,
            launchOptions: {
                headless: true,
            }
        }
    );
    log.info('Launching new page');
    const page = await browser.newPage();
    log.info('Changing viewport width');
    await page.setViewport({ width, height: 1080 });
    log.info('Waiting for the page');
    await page.goto(url, { waitUntil, timeout: 3600000 });
    log.info('Page is ready for screenshot');
    if (delay > 0) {
        log.info(`Waiting ${delay}ms as specified in input`);
        await page.waitFor(delay);
    }
    log.info('Saving screenshot');
    await saveScreenshot(page);
    log.info('Screenshot saved you can view it here:');
    log.info(`https://api.apify.com/v2/key-value-stores/${APIFY_DEFAULT_KEY_VALUE_STORE_ID}/records/OUTPUT?disableRedirect=true`);
    await page.close();
    await browser.close();
});

