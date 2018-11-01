const Apify = require('apify');

Apify.main(async () => {
    // Load query from input
    const input = await Apify.getValue('INPUT');
});
