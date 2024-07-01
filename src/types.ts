import { ProxyConfigurationOptions } from "crawlee";
import { PuppeteerLifeCycleEvent } from "puppeteer";

export const WAIT_UNTIL_OPTIONS: PuppeteerLifeCycleEvent[] = ["load", "domcontentloaded", "networkidle2", "networkidle0"];

export function isWaitUntilOption(option: string): option is PuppeteerLifeCycleEvent {
    return WAIT_UNTIL_OPTIONS.includes(option as PuppeteerLifeCycleEvent);
}

export const FORMATS = ['png', 'pdf'] as const
export type Format = typeof FORMATS[number]

export function isFormat(text: string): text is Format {
    return FORMATS.includes(text as Format);
}

export type Input = {
    urls?: { url: string }[];
    format?: Format;
    waitUntil: PuppeteerLifeCycleEvent;
    delay?: number;
    viewportWidth: number;
    scrollToBottom?: boolean;
    delayAfterScrolling?: number;
    waitUntilNetworkIdleAfterScroll?: boolean;
    waitUntilNetworkIdleAfterScrollTimeout?: number;
    proxy?: (ProxyConfigurationOptions & {
        useApifyProxy?: boolean | undefined;
    }) | undefined;
    selectorsToHide?: string;
};
