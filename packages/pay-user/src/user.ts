import { ArkEcosystemWallet, ArkWallet } from "@cryptology.hk/pay-ark";
import { logger } from "@cryptology.hk/pay-logger";
import { SecureStorage, Storage, Wallet } from "@cryptology.hk/pay-storage";

export interface Username {
    username: string;
    platform: string;
}

export class User {
    public static async getWalletAddress(user: Username, token: string): Promise<string> {
        try {
            const wallet: Wallet = await Storage.getWallet(user.username, user.platform, token);
            if (wallet && wallet.hasOwnProperty("address") && wallet.address) {
                return wallet.address;
            }

            // No Wallet found, create a new user
            return await User.__createWallet(user, token);
        } catch (e) {
            logger.error(e.message);
        }

        throw new Error(`Could not find nor create a/an ${token} wallet for ${JSON.stringify(user)}`);
    }

    private static async __createWallet(user: Username, token: string): Promise<string> {
        try {
            // generate wallet for token
            const wallet: ArkEcosystemWallet = ArkWallet.generateWallet(token);

            // Store the wallet
            await Storage.setWallet(user.username, user.platform, token, wallet);
            return wallet.address;
        } catch (e) {
            logger.error(e.message);
        }
        throw new Error(`Could not create a/an ${token} wallet for ${JSON.stringify(user)}`);
    }
    private username: string;
    private platform: string;

    constructor(username: string, platform: string) {
        this.username = username;
        this.platform = platform;
    }

    public async isValidUser(): Promise<boolean> {
        return this.username.startsWith("user") && (this.platform === "reddit" || this.platform === "twitter");
    }
}
