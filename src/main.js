const Apify = require('apify');
const parseInput = require('./parseInput');
const { saveScreenshot } = require('./utils');

const { APIFY_DEFAULT_KEY_VALUE_STORE_ID } = process.env;

Apify.main(async () => {
    // Load query from input
    const input = await Apify.getValue('INPUT');
    const { url, useApifyProxy, waitUntil, delay, width } = await parseInput(input);

    const browser = await Apify.launchPuppeteer({
        headless: true,
        useApifyProxy,
    });

    console.log('Launching new page');
    const page = await browser.newPage();
    console.log('Changing viewport width');
    await page.setViewport({ width, height: 1080 });
    console.log('Waiting for the page');
    await page.goto(url, { waitUntil, timeout: 3600000 });
    console.log('Page is ready for screenshot');
    if (delay > 0) {
        console.log(`Waiting ${delay}ms as specified in input`);
        await page.waitFor(delay);
    }
    console.log('Saving screenshot');
    await saveScreenshot(page);
    console.log('Screenshot saved you can view it here:');
    console.log(`https://api.apify.com/v2/key-value-stores/${APIFY_DEFAULT_KEY_VALUE_STORE_ID}/records/OUTPUT?disableRedirect=true`);
    await page.close();
    await browser.close();
});
