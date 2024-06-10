import { Actor, ProxyConfigurationOptions, log } from "apify";

import type { PuppeteerLifeCycleEvent } from "puppeteer";
import { RequestList, Request } from "crawlee";

import { FORMATS, type Format, type Input } from "./types.js";

const crash = async (errorMessage: string) => {
    log.error(errorMessage);
    await Actor.fail(errorMessage);
};

export async function parseInput(input: Input): Promise<{
    urls: string[];
    format: Format;
    waitUntil: PuppeteerLifeCycleEvent;
    width: number;
    delay: number;
    scrollToBottom: boolean;
    delayAfterScrolling: number;
    waitUntilNetworkIdleAfterScroll: boolean;
    waitUntilNetworkIdleAfterScrollTimeout: number;
    proxy: (ProxyConfigurationOptions & {
        useApifyProxy?: boolean | undefined;
    }) | undefined;
    selectorsToHide: string;
}> {
    if (!input) {
        await crash("Did not receive input. Please make sure that INPUT is stored in Key-Value store");
    }

    const parsedInput: {
        urls: string[];
        format: Format;
        waitUntil: PuppeteerLifeCycleEvent;
        width: number;
        delay: number;
        scrollToBottom: boolean;
        delayAfterScrolling: number;
        waitUntilNetworkIdleAfterScroll: boolean;
        waitUntilNetworkIdleAfterScrollTimeout: number;
        proxy: (ProxyConfigurationOptions & {
            useApifyProxy?: boolean | undefined;
        }) | undefined;
        selectorsToHide: string;
    } = {
        urls: [],
        format: 'png',
        waitUntil: "load",
        width: 0,
        delay: 0,
        scrollToBottom: false,
        delayAfterScrolling: 0,
        waitUntilNetworkIdleAfterScroll: false,
        waitUntilNetworkIdleAfterScrollTimeout: 30,
        proxy: input.proxy || { useApifyProxy: true },
        selectorsToHide: input.selectorsToHide?.trim() || "",
    };

    // Process url
    if (!input.url && !input.urls?.length) crash("Input is missing url field");

    const startUrls = [];
    if (input.url) startUrls.push(input.url);
    if (input.urls?.length) startUrls.push(...input.urls);

    const requestList = await RequestList.open('START_URLS', startUrls || []);

    let req: Request | null = await requestList.fetchNextRequest();

    while (req !== null) {
        parsedInput.urls.push(req.url);

        req = await requestList.fetchNextRequest();
    }

    parsedInput.urls = parsedInput.urls.flatMap((u) => {
        let url = u.trim();

        if (!url.startsWith("http")) {
            url = `http://${url}`;
        }

        try {
            new URL(url);
        } catch (error) {
            crash(`Skipping url "${url}" because it is not valid.`);
            return [];
        }

        return [url];
    });

    if (input.format) {
        if (FORMATS.includes(input.format)) {
            parsedInput.format = input.format;
        } else {
            log.warning(
                'Unsupported input format, using default',
                { format: input.format, defaultFormat: parsedInput.format }
            );
        }
    }

    // Process waitUntil
    const waitUntilOptions: PuppeteerLifeCycleEvent[] = ["load", "domcontentloaded", "networkidle2", "networkidle0"];

    function isWaitUntilOption(option: string): option is PuppeteerLifeCycleEvent {
        return waitUntilOptions.includes(option as PuppeteerLifeCycleEvent);
    }

    if (!isWaitUntilOption(input.waitUntil)) {
        await crash(
            `Value in parameter waitUntil - "${input.waitUntil
            }" - is not one of the allowed values: "${waitUntilOptions.join('", "')}"`
        );
    }

    parsedInput.waitUntil = input.waitUntil as PuppeteerLifeCycleEvent;

    // Process viewportWidth
    if (!input.viewportWidth && typeof input.viewportWidth !== "number") {
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
    if (!input.delay && typeof input.delay !== "number") {
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
    parsedInput.waitUntilNetworkIdleAfterScrollTimeout = input.waitUntilNetworkIdleAfterScrollTimeout || 30;

    if (!parsedInput.urls.length) {
        await crash("No valid urls found.");
    }

    return parsedInput;
}
