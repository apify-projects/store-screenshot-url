import { ProxyConfiguration } from "crawlee";

export type Input = {
    url: string;
    waitUntil: string;
    viewportWidth: number;
    delay: number;
    scrollToBottom: boolean;
    delayAfterScrolling: number;
    waitUntilNetworkIdleAfterScrollTimeout: number;
    waitUntilNetworkIdleAfterScroll: boolean;
    proxy: ProxyConfiguration;
};
