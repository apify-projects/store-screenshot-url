import crypto from 'node:crypto';

const sanitizeFileName = (name: string) => name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

export const generateScreenshotName = (url: string) => (
    `screenshot_${sanitizeFileName(url.slice(0, 100))}_${crypto.createHash('md5').update(url).digest('hex')}`
);

export const calculateRequestHandlerTimeoutSecs = (
    scrollToBottom: boolean,
    waitUntilNetworkIdleAfterScroll: boolean,
    waitUntilNetworkIdleAfterScrollTimeout: number,
    delayAfterScrolling: number,
    delay: number
): number => {
    const REQUEST_HANDLER_TIMEOUT_SECS_BASE = 60;

    const delaySeconds = delay / 1000;

    if (!scrollToBottom) {
        return REQUEST_HANDLER_TIMEOUT_SECS_BASE + delaySeconds;
    }

    if (waitUntilNetworkIdleAfterScroll) {
        return REQUEST_HANDLER_TIMEOUT_SECS_BASE + (waitUntilNetworkIdleAfterScrollTimeout / 1000) + delaySeconds;
    }

    return REQUEST_HANDLER_TIMEOUT_SECS_BASE + (delayAfterScrolling / 1000) + delaySeconds;
};
