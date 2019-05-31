import { logger } from "../../core";
import { Command, Reply } from "../interfaces";
import { Messenger } from "../messenger";
import { User } from "../user";

export class Deposit {
    /**
     * @dev Retrieve the deposit address for a user on an ArkEcosystem blockchain
     * @param command {Command} The parsed command containing the Username and token of the blockchain
     * @returns {Promise<Reply>} Object containing the reply message to send per direct message to the user
     */
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
