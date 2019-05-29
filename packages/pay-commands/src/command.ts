import { Messenger, Reply } from "@cryptology.hk/pay-messenger";
import { Balance, Deposit, Help, Send, Stickers, Withdraw } from "./commands";
import { Command } from "./interfaces";

export const COMMANDS = ["BALANCE", "DEPOSIT", "WITHDRAW", "SEND", "HELP", "ADDRESS", "STICKERS", "TIP", "REWARD"];

export class Commands {
    /**
     * Check if a string is a valid command
     * @param command
     */
    public static isValidCommand(command: string): boolean {
        command = command.toUpperCase();
        return COMMANDS.indexOf(command) !== -1;
    }

    public static hasArguments(command: string): boolean {
        command = command.toUpperCase();
        switch (command) {
            // Commands that have no arguments
            case "TIP":
            case "HELP":
                return false;

            // Commands that have arguments
            case "REWARD":
            case "BALANCE":
            case "ADDRESS":
            case "DEPOSIT":
            case "SEND":
            case "WITHDRAW":
            case "STICKERS":
                return true;
            default:
                throw TypeError("Not a valid command");
        }
    }

    public static async executeCommand(command: Command): Promise<Reply> {
        switch (command.command) {
            case "REWARD":
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
                const vendorField: string = `ARK Pay - SEND: ${command.commandSender.username}@${
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
