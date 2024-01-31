export const generateUrlStoreKey = (urlString: string): string => {
    // Extract domain from URL
    const urlObject = new URL(urlString);
    const domain = urlObject.hostname;
    if (!domain) {
        throw new Error("Invalid URL format");
    }

    // Calculate hash of the URL
    let urlHash = '';
    for (let i = 0; i < urlString.length; i++) {
        urlHash += urlString.charCodeAt(i).toString(16);
    }

    // Calculate available space for the hash in the key
    const availableSpace = 52 - domain.length - 1;  // 1 for the hyphen separator

    // Truncate the hash if necessary to fit within available space
    const truncatedHash = urlHash.substring(0, availableSpace);

    // Create the key using domain and truncated hash
    let key = `${domain}-${truncatedHash}`;

    // Replace dots with hyphens and limit the length to 52 characters
    return `screenshot-${key.replace(/\./g, '-').substring(0, 52)}`;
}

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