import { Command, Reply } from "../interfaces";
import { Balance, Deposit, Help, Send, Stickers, Withdraw } from "./commands";
import { Messenger } from "./messenger";

export const COMMANDS = ["WITHDRAW", "BALANCE", "DEPOSIT", "SEND", "HELP", "ADDRESS", "STICKERS", "TIP", "REWARD"];

export class Commander {
    /**
     * @dev Check if input is a valid command
     * @param command {string}  The input to check whether or not it is a valid command
     * @returns {boolean} TRUE if the input is a valid command
     */
    public static isValidCommand(command: string): boolean {
        command = command.toUpperCase();
        return COMMANDS.indexOf(command) !== -1;
    }

    /**
     * @dev Check if the command can have optional arguments
     * @param command {string} The command to check
     * @returns TRUE if the command can have additional arguments
     */
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

    /**
     * @dev Execute the command
     * @param command {Command} The command to execute
     * @returns {Promise<Reply>} Object with messages to send to Sender, Receiver, Merchant and comment reply
     */
    public static async executeCommand(command: Command): Promise<Reply> {
        switch (command.command) {
            case "REWARD":
            case "HELP":
                return Help.getHelp(command.command, command.smallFooter);
            case "DEPOSIT":
            case "ADDRESS":
                return await Deposit.getDeposit(command);
            case "BALANCE":
                return await Balance.getBalance(command.commandSender, command.token);
            case "SEND":
            case "TIP":
                // Check if the user requested SEND/TIP help:
                if (!command.hasOwnProperty("commandReplyTo")) {
                    return Help.getHelp(command.command, command.smallFooter);
                }
                const nonce: number = command.hasOwnProperty("nonce") ? command.nonce : 0;
                const parentId: string = command.hasOwnProperty("id") ? command.id : "";
                const vendorField: string = `ARK Pay - SEND: ${command.commandSender.username}@${command.commandSender.platform} >> ${command.transfer.receiver.username}@${command.transfer.receiver.platform} ${parentId}`;
                return await Send.transfer(
                    command.transfer,
                    vendorField,
                    command.smallFooter,
                    command.hasOwnProperty("id"),
                    nonce,
                );
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
