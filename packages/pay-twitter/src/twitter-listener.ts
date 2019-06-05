import { Core, Services } from "@cryptology.hk/pay-framework";
import { PlatformTwitter } from "./platform-twitter";

export class TwitterListener {
    public async listener() {
        try {
            const platformTwitter: PlatformTwitter = new PlatformTwitter();
            const isoNow: string = new Date().toISOString();
            Core.logger.info(`Twitter Account API Webhook Listener started - ${isoNow}`);
            await platformTwitter.notifyAdmin();
        } catch (e) {
            Core.logger.error(e.message);
        }
    }
}
