import { logger } from "../core";
import { Username } from "../interfaces";
import { ArkEcosystemWallet, ArkWallet } from "./";
import { Storage, Wallet } from "./";

export class User {
    public static async getWalletAddress(user: Username, token: string): Promise<string> {
        try {
            const wallet: Wallet = await Storage.getWallet(user.username, user.platform, token);
            if (wallet && wallet.hasOwnProperty("address") && wallet.address) {
                return wallet.address;
            }

            // No Wallet found, create a new user
            return await User.createWallet(user, token);
        } catch (e) {
            logger.error(e.message);
        }

        throw new Error(`Could not find nor create a/an ${token} wallet for ${JSON.stringify(user)}`);
    }

    private static async createWallet(user: Username, token: string): Promise<string> {
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
}
