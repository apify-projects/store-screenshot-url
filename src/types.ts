import { ProxyConfigurationOptions } from "crawlee";

export const FORMATS = ['png', 'pdf'] as const

export type Format = typeof FORMATS[number]

export type Input = {
    url: string;
    urls: string[];
    format: Format;
    waitUntil: string;
    viewportWidth: number;
    delay: number;
    scrollToBottom: boolean;
    delayAfterScrolling: number;
    waitUntilNetworkIdleAfterScrollTimeout: number;
    waitUntilNetworkIdleAfterScroll: boolean;
    proxy: (ProxyConfigurationOptions & {
        useApifyProxy?: boolean | undefined;
    }) | undefined;
    selectorsToHide?: string;
};
