import { logger } from "@cryptology.hk/pay-logger";
import { PlatformReddit } from "./platform-reddit";

const waitTime: number = 5000;

class RedditListener {
    /**
     * @dev Start to poll for new messages and mentions on Reddit
     */
    public async listener() {
        try {
            const platformReddit = new PlatformReddit();
            const isoNow: string = new Date().toISOString();
            logger.info(`Reddit Listener started - ${isoNow}`);
            await platformReddit.notifyAdmin();

            // noinspection InfiniteLoopJS
            while (true) {
                // Prevent chaining of Promises that gobble up memory
                try {
                    await platformReddit.redditPolling();
                } catch (e) {
                    logger.error(e.messenger);
                }
                await this.sleep(waitTime);
            }
        } catch (e) {
            logger.error(e.messenger);
        }
    }

    /**
     * @dev  Wait for <ms> miliseconds
     * @param {number} ms miliseconds
     */
    private async sleep(ms: number) {
        await new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const redditListener = new RedditListener();
