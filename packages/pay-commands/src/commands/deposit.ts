import { logger } from "@cryptology.hk/pay-logger";
import { Reply } from "@cryptology.hk/pay-messenger";
import { User, Username } from "@cryptology.hk/pay-user";
import { Command } from "../";
import { BaseCommand } from "./baseCommand";

export class Deposit extends BaseCommand {
    public static async getDeposit(command: Command): Promise<Reply> {
        return null;
    }

    protected static async __getWallet(user: Username, token: string): Promise<string> {
        return await User.getWalletAddress(user, token);
    }
}
