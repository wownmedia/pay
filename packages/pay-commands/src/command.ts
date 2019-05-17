// import { logger } from "@cryptology.hk/pay-logger";
import { AmountCurrency } from "@cryptology.hk/pay-currency";
import { logger } from "@cryptology.hk/pay-logger";
import { Username } from "@cryptology.hk/pay-user";
import BigNumber from "bignumber.js";
import { Balance, Deposit, Help, Send, Stickers, Tip, Withdraw } from "./commands";

export const COMMANDS = ["BALANCE", "DEPOSIT", "WITHDRAW", "SEND", "HELP", "ADDRESS", "STICKERS", "TIP"];

/**
 * Command parsed from a parsed mention/command and it's value in Arktoshi
 */
export interface Command {
    command: string;
    commandSender?: Username;
    commandReplyTo?: Username;
    transfer?: Transfer;
    smallFooter?: boolean;
    token?: string;
}

export interface Transfer {
    sender?: Username;
    receiver?: Username;
    command: string;
    address?: string;
    arkToshiValue?: BigNumber;
    token?: string;
    check?: AmountCurrency;
}

export interface CommandResult {
    command: string;
    success: boolean;
    sender: Username;
    transaction?: Transaction;
    message?: string;
    receiverMessage?: string;
    commentReply?: string;
}

export interface Transaction {
    sender: Username;
    receiver: Username;
    transactionId: string;
    arkToshiValue?: BigNumber;
    currency?: string;
}

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
}
