import { Core } from "@cryptology.hk/pay-framework";
import { PlatformTwitter } from "./platform-twitter";

export class TwitterListener {
    public static async listener() {
        try {
            const platformTwitter: PlatformTwitter = new PlatformTwitter();
            await platformTwitter.startWebhookListener();
            const isoNow: string = new Date().toISOString();
            Core.logger.info(`Twitter Account API Webhook Listener started - ${isoNow}`);
        } catch (e) {
            Core.logger.error(e.message);
        }
    }
}
