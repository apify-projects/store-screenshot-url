const _ = require('lodash');
const url = require('url');
const { crash } = require('./utils');

function parseInput(input) {
    if (!input) crash('Did not receive input. Please make sure that INPUT is stored in Key-Value store');
    const parsedInput = {};

    // Process url
    if (!input.url) crash('Input is missing url field');
    parsedInput.url = input.url.startsWith('http') ? input.url : `http://${input.url}`;
    try {
        url.parse(parsedInput.url);
    } catch (error) {
        crash(`Provided url "${parsedInput.url}" is not valid.`);
    }

    // Process waitUntil
    const waitUntilOptions = ['load', 'domcontentloaded', 'networkidle2', 'networkidle0'];
    if (!waitUntilOptions.includes(input.waitUntil)) {
        crash(`Value in parameter waitUntil - "${input.waitUntil}" - is not one of
allowed values: "${waitUntilOptions.join('", "')}"`);
    }
    parsedInput.waitUntil = input.waitUntil;

    // Process viewportWidth
    if (!_.isNumber(input.viewportWidth)) crash(`Viewport width "${input.viewportWidth}" is not a number.`);
    if (input.viewportWidth < 100) crash(`Viewport width "${input.viewportWidth}" is too small, it must be atleast 100px.`);
    if (input.viewportWidth > 3840) crash(`Viewport width "${input.viewportWidth}" is too large, maximum is 3840px.`);
    parsedInput.width = input.viewportWidth;

    // Process delay
    if (!_.isNumber(input.delay)) crash(`Delay "${input.delay}" is not a number.`);
    if (input.delay < 0) crash(`Delay "${input.delay}" is negative.`);
    if (input.delay > 3600000) crash(`Delay "${input.delay}" is too large, maximum is 3600000ms.`);
    parsedInput.delay = input.delay;

    parsedInput.useApifyProxy = !!input.useApifyProxy;

    return parsedInput;
}

module.exports = parseInput;
