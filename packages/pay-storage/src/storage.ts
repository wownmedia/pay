import { logger } from "@cryptology.hk/pay-logger";
import { payDatabase } from "./database";

export interface Wallet {
    address: string;
    encryptedSeed: string;
    seed?: string;
}

export class Storage {
    public static async getWallet(username: string, platform: string, token: string): Promise<Wallet> {
        token = token.toLowerCase();
        platform = platform.toLowerCase();

        // todo rename users table to ark
        if (token === "ark") {
            token = "users";
        }

        const query = `SELECT * FROM ${token} WHERE username = $1 AND platform = $2 LIMIT 1`;
        const result = await payDatabase.query(query, [username, platform]);
        let user = result.rows[0];

        // User does not exist, try lowercase version of the username (previously users were not stored in Lowercase)
        if (typeof user === "undefined") {
            const result = await payDatabase.query(query, [username, platform]);
            user = result.rows[0];
        }

        if (typeof user === "undefined" || !user.hasOwnProperty("address") || !user.hasOwnProperty("seed")) {
            return null; // no wallet found
        }

        return {
            address: user.address,
            encryptedSeed: user.seed,
        };
    }

    public static async setWallet(username: string, platform: string, token: string, wallet: Wallet): Promise<boolean> {
        return true; // todo
    }
}
