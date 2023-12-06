import { Actor, log } from "apify";
import _ from "lodash";
import * as url from "url";

import type { PuppeteerLifeCycleEvent } from "puppeteer";

import type { Input } from "./types.js";

const crash = async (errorMessage: string) => {
    log.info(errorMessage);
    await Actor.fail(errorMessage);
};

export async function parseInput(input: Input): Promise<{
    url: string;
    waitUntil: PuppeteerLifeCycleEvent;
    width: number;
    delay: number;
    scrollToBottom: boolean;
    delayAfterScrolling: number;
    waitUntilNetworkIdleAfterScroll: boolean;
    waitUntilNetworkIdleAfterScrollTimeout: number;
}> {
    if (!input) {
        await crash("Did not receive input. Please make sure that INPUT is stored in Key-Value store");
    }
    const parsedInput: {
        url: string;
        waitUntil: PuppeteerLifeCycleEvent;
        width: number;
        delay: number;
        scrollToBottom: boolean;
        delayAfterScrolling: number;
        waitUntilNetworkIdleAfterScroll: boolean;
        waitUntilNetworkIdleAfterScrollTimeout: number;
    } = {
        url: "",
        waitUntil: "networkidle0",
        width: 0,
        delay: 0,
        scrollToBottom: false,
        delayAfterScrolling: 0,
        waitUntilNetworkIdleAfterScroll: false,
        waitUntilNetworkIdleAfterScrollTimeout: 30000,
    };

    // Process url
    if (!input.url) crash("Input is missing url field");
    parsedInput.url = input.url.startsWith("http") ? input.url : `http://${input.url}`;
    try {
        url.parse(parsedInput.url);
    } catch (error) {
        await crash(`Provided url "${parsedInput.url}" is not valid.`);
    }

    // Process waitUntil
    const waitUntilOptions: PuppeteerLifeCycleEvent[] = ["load", "domcontentloaded", "networkidle2", "networkidle0"];

    function isWaitUntilOption(option: string): option is PuppeteerLifeCycleEvent {
        return waitUntilOptions.includes(option as PuppeteerLifeCycleEvent);
    }

    if (!isWaitUntilOption(input.waitUntil)) {
        await crash(
            `Value in parameter waitUntil - "${
                input.waitUntil
            }" - is not one of the allowed values: "${waitUntilOptions.join('", "')}"`
        );
    }

    parsedInput.waitUntil = input.waitUntil as PuppeteerLifeCycleEvent;

    // Process viewportWidth
    if (!_.isNumber(input.viewportWidth)) {
        await crash(`Viewport width "${input.viewportWidth}" is not a number.`);
    }
    if (input.viewportWidth < 100) {
        await crash(`Viewport width "${input.viewportWidth}" is too small, it must be at least 100px.`);
    }
    if (input.viewportWidth > 3840) {
        await crash(`Viewport width "${input.viewportWidth}" is too large, maximum is 3840px.`);
    }

    parsedInput.width = input.viewportWidth;

    // Process delay
    if (!_.isNumber(input.delay)) {
        await crash(`Delay "${input.delay}" is not a number.`);
    }
    if (input.delay < 0) {
        await crash(`Delay "${input.delay}" is negative.`);
    }
    if (input.delay > 3600000) {
        await crash(`Delay "${input.delay}" is too large, maximum is 3600000ms.`);
    }

    parsedInput.delay = input.delay;
    parsedInput.scrollToBottom = input.scrollToBottom || false;
    parsedInput.waitUntilNetworkIdleAfterScroll = input.waitUntilNetworkIdleAfterScroll || false;
    parsedInput.delayAfterScrolling = input.delayAfterScrolling || 0;
    parsedInput.waitUntilNetworkIdleAfterScrollTimeout = input.waitUntilNetworkIdleAfterScrollTimeout || 30000;

    return parsedInput;
}
