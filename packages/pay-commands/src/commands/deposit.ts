import { logger } from "@cryptology.hk/pay-logger";
import { Messenger, Reply } from "@cryptology.hk/pay-messenger";
import { User } from "@cryptology.hk/pay-user";
import { Command } from "../";

export class Deposit {
    public static async getDeposit(command: Command): Promise<Reply> {
        try {
            const address: string = await User.getWalletAddress(command.commandSender, command.token);
            return Messenger.depositMessage(address, command.token, command.commandSender.platform);
        } catch (e) {
            logger.error(e.message);
            return Messenger.errorMessage();
        }
    }
}
