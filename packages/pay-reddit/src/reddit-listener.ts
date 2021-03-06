import { Core, Services } from "@cryptology.hk/pay-framework";
import { PlatformReddit } from "./platform-reddit";

/**
 * @dev The time to wait before emitting a next poll event
 */
const waitTime: number = 5000; // Poll Reddit every 5 seconds

export class RedditListener {
    private readonly poller: Services.Poller;

    constructor() {
        this.poller = new Services.Poller(waitTime);
    }

    /**
     * @dev Poll for new direct messages and mentions on Reddit
     */
    public async listener() {
        try {
            const platformReddit: PlatformReddit = new PlatformReddit();
            const isoNow: string = new Date().toISOString();
            Core.logger.info(`Reddit Listener started - ${isoNow}`);
            await platformReddit.notifyAdmin();

            this.poller.onPoll(async () => {
                await platformReddit.redditPolling();
                this.poller.poll(); // Go for the next poll
            });

            // Initial start
            this.poller.poll();
        } catch (e) {
            Core.logger.error(e.message);
        }
    }
}
