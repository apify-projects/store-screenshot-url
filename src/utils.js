const Apify = require('apify');

/**
 * Helper function which writes provided message into console log and then
 * exists the process with failure code.
 *
 * @param {String} errorMessage Message to be written into console log
 */
function crash(errorMessage) {
    console.log(errorMessage);
    process.exit(1);
}

/**
 * Store screen from puppeteer page to Apify key-value store
 * @param page - Instance of puppeteer Page class https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page
 * @param [key] - Function stores your screen in Apify key-value store under this key
 * @return {Promise<void>}
 */
const saveScreenshot = async (page, key = 'OUTPUT') => {
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    await Apify.setValue(key, screenshotBuffer, { contentType: 'image/png' });
};

module.exports = {
    crash,
    saveScreenshot,
};
