import { ProxyConfigurationOptions } from "crawlee";

export type Input = {
    url: string;
    urls: string[];
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
};
