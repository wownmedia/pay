import { transfer } from "@arkecosystem/crypto/dist/transactions/types/schemas";
import { Balance, Command, Commands, Deposit, Help, Send, Stickers, Withdraw } from "@cryptology.hk/pay-commands";
import { logger } from "@cryptology.hk/pay-logger";
import { Messenger, Reply } from "@cryptology.hk/pay-messenger";
import { Parser } from "@cryptology.hk/pay-parser";
import { Username } from "@cryptology.hk/pay-user";
import { RedditMessage } from "./platform-reddit";

export class RedditCommands extends Commands {
    public static async prepareCommand(
        item: RedditMessage,
        sender: Username,
        receiver: Username,
        arkPayUser: string,
    ): Promise<Command[]> {
        try {
            // Do we have a mention or a direct message
            if (item.hasOwnProperty("was_comment") && item.was_comment) {
                const id: string = item.name;
                const parentId: string = item.parent_id;
                // Mention
                logger.info(`Reddit Mention received: ${id} replying to ${parentId}`);
                return await Parser.parseMention(item.body, arkPayUser, "reddit", sender, receiver, parentId);
            } else {
                // Direct Messenger
                logger.info(`Reddit Direct Message received: ${item.id}`);
                return await Parser.parseDirectMessage(item.body, "reddit", sender);
            }
        } catch (e) {
            logger.error(e.messenger);
        }
        return [];
    }

    public static async executeCommand(command: Command): Promise<Reply> {
        switch (command.command) {
            default:
            case "HELP":
                return Help.getHelp(command.command);
            case "DEPOSIT":
            case "ADDRESS":
                return await Deposit.getDeposit(command);
            case "BALANCE":
                return await Balance.getBalance(command.commandSender, command.token);
            case "SEND":
            case "TIP":
                // Check if the user requested SEND/TIP help:
                if (!command.hasOwnProperty("commandReplyTo")) {
                    return Help.getHelp(command.command);
                }
                const parentId: string = command.hasOwnProperty("id") ? command.id : "";
                const vendorField: string = `ARK Pay: SEND: ${command.commandSender.username}@${
                    command.commandSender.platform
                } >> ${command.transfer.receiver.username}@${command.transfer.receiver.platform} ${parentId}`;
                return await Send.transfer(command.transfer, vendorField);
            case "WITHDRAW":
                // Check if the user requested WITHDRAW help:
                if (!command.hasOwnProperty("transfer")) {
                    return Help.getHelp(command.command);
                }
                return await Withdraw.transfer(command.transfer);
            case "STICKERS":
                // Check if the user requested STICKERS help:
                if (!command.hasOwnProperty("commandReplyTo")) {
                    return Help.getHelp(command.command);
                }
                return await Stickers.send(command.commandSender, command.commandReplyTo);
        }
        return Messenger.summonedMessage();
    }
}
