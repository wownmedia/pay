import { Command, Commands, Transfer } from "@cryptology.hk/pay-commands";
import { config } from "@cryptology.hk/pay-config";
import { AmountCurrency, Currency } from "@cryptology.hk/pay-currency";
import { User, Username } from "@cryptology.hk/pay-user";
import BigNumber from "bignumber.js";
import Joi from "joi";

const configuration = config.get("pay-parser");
const USERNAME_PLATFORM_SEPERATOR = configuration.seperator ? configuration.seperator : "@";

// Use a ParserUtils class to be able to add these methods to Unit testing without exposing them to the module
export class ParserUtils {
    /**
     * Parse an amount/currency combination and return it's value in Arktoshi
     * @param leftInput
     * @param rightInput
     *
     * Accepted Input:
     * <amount>
     * <amount><currency>
     * <currency><amount>
     * <amount> <currency>
     * <currency> <amount>
     */
    public static async parseAmount(leftInput: string, rightInput?: string): Promise<AmountCurrency> {
        let amountCurrency: AmountCurrency;
        try {
            // In case we have input like "SEND 10" or "SEND 10USD"
            if (typeof rightInput === "undefined" || rightInput === "") {
                amountCurrency = Currency.parseAmountCurrency(leftInput);
            }

            // In case we have input like "10 u/arktippr" or "10USD u/arktippr"
            else if (typeof leftInput === "undefined" || leftInput === "") {
                amountCurrency = Currency.parseAmountCurrency(rightInput);
            }

            // In case we have input like "SEND 10 USD" or "10 USD u/arktippr" or "SEND USD 10" or "USD 10 u/arktippr"
            else {
                amountCurrency = Currency.parseAmountCurrency(rightInput + leftInput);
            }

            // Convert currency to its current Arktoshi value
            amountCurrency.currency = Currency.currencySymbolsToName(amountCurrency.currency);
            amountCurrency.arkToshiValue = await Currency.getExchangedValue(
                amountCurrency.amount,
                amountCurrency.currency,
            );
            return amountCurrency;
        } catch (e) {
            return null;
        }
    }

    /**
     * Parse a TIP mention command
     * @param bodyParts
     * @param mentionIndex
     *
     * Accepted Input:
     * <amount> u/arktippr => <amount> ARK
     * cool post <amount> u/arktippr => <amount> ARK
     * give you a 10 <amount> u/arktippr => <amount> ARK
     * <amount><currency> u/arktippr => <amount> <currency>
     * <currency><amount> u/arktippr => <amount> <currency>
     * cool post <amount><currency> u/arktippr => <amount> <currency>
     * cool post <currency><amount> u/arktippr => <amount> <currency>
     * give you a 10 <amount><currency> u/arktippr => <amount> <currency>
     * give you a 10 <currency><amount> u/arktippr => <amount> <currency>
     * <amount> <currency> u/arktippr => <amount> <currency>
     * <currency> <amount> u/arktippr => <amount> <currency>
     * cool post <amount> <currency> u/arktippr => <amount> <currency>
     * cool post <currency> <amount> u/arktippr => <amount> <currency>
     * give you a 10 <amount> <currency> u/arktippr => <amount> <currency>
     * give you a 10 <currency> <amount> u/arktippr => <amount> <currency>
     */
    public static async parseTip(bodyParts: string[], mentionIndex: number): Promise<AmountCurrency> {
        let leftInput: string = mentionIndex >= 2 ? bodyParts[mentionIndex - 2].toUpperCase() : "";
        const rightInput: string = mentionIndex >= 1 ? bodyParts[mentionIndex - 1].toUpperCase() : "";

        // We could have a valid input (numerical or combined currency/value) preceded by random text.
        if (!ParserUtils.isValidLeftInput(leftInput, rightInput)) {
            leftInput = "";
        }
        const amountCurrency: AmountCurrency = await ParserUtils.parseAmount(leftInput, rightInput);

        if (amountCurrency !== null && amountCurrency.arkToshiValue.gt(0)) {
            return amountCurrency;
        }
        return null;
    }

    /**
     * Check if the leftInput isn't part of the message the TIP is mentioned within
     * @param leftInput
     * @param rightInput
     *
     * Valid input is a valid currency or a number where the right input isn't a number as well.
     */
    public static isValidLeftInput(leftInput: string, rightInput: string): boolean {
        return (
            Currency.isValidCurrency(leftInput) ||
            (Currency.isNumericalInput(leftInput) && !Currency.isNumericalInput(rightInput))
        );
    }

    /**
     * Check if a user is valid on the platform
     * @param user
     *
     * A username can never be a valid currency or a number (that would parse badly)
     */
    public static async isValidUser(user: Username): Promise<boolean> {
        // A user can never be a currency or a number
        if (Currency.isValidCurrency(user.username) || !new BigNumber(user.username).isNaN()) {
            return false;
        }

        const checkValidUser = new User(user.username, user.platform);
        return await checkValidUser.isValidUser();
    }

    /**
     * Find where the mentioned username is in the message, username can't be in the first position
     * @param mentionedUser
     * @param mentionParts
     */
    public static findMentionedArkPayUser(mentionedUser: string, mentionParts: string[]): number {
        mentionedUser = mentionedUser.toUpperCase();
        const index: number = mentionParts.indexOf(mentionedUser);

        if (index === 0) {
            throw TypeError("Mentioned user as first entry in the message: where is the command?");
        }

        if (index === -1) {
            // Really? I know it is there, we got triggered by a mention after all, try uppercase...
            for (const item in mentionParts) {
                if (typeof mentionParts !== "undefined") {
                    const checkForUser: string = mentionParts[item].toUpperCase();
                    if (checkForUser.includes(mentionedUser) && parseInt(item, 10) > 0) {
                        return parseInt(item, 10);
                    }
                }
            }
            throw TypeError("Could not find the mentioned user");
        }
        return index;
    }

    /**
     * Split up a message into separate parts for parsing.
     * @param message
     * @param noUpperCase
     */
    public static splitMessageToParts(message: string, noUpperCase?: boolean): string[] {
        if (!noUpperCase) {
            message = message.toUpperCase();
        }
        return message.trim().split(/\s+/);
    }

    /**
     * Parse a username
     * @param username
     * @param platform
     */
    public static parseUsername(username: string, platform: string): Username {
        // Remove the Reddit user u/ and Twitter @
        const userNameReplace: RegExp = new RegExp("(^@|u/)");
        username = username.replace(userNameReplace, "");

        // Split up the username and platform if any (eg. cryptology@twitter)
        const usernameParts: string[] = username.split(USERNAME_PLATFORM_SEPERATOR);
        if (usernameParts.length === 2) {
            username = usernameParts[0];
            platform = usernameParts[1];
        }
        return { username, platform };
    }

    /**
     * Check if a command is valid and if it needs to be parsed for input arguments.
     * @param command
     * @param commandArguments
     * @param platform
     */
    public static async checkCommand(command: string, commandArguments: string[], platform: string): Promise<Command> {
        command = command.toUpperCase();
        if (!Commands.isValidCommand(command)) {
            return null;
        }

        if (Commands.hasArguments(command)) {
            return await ParserUtils.parseCommand(command, commandArguments, platform);
        }
        return { command };
    }

    /**
     * Parse a command
     * @param command
     * @param commandArguments
     * @param platform
     */
    public static async parseCommand(command: string, commandArguments: string[], platform: string): Promise<Command> {
        command = command.toUpperCase();
        if (!Commands.isValidCommand(command)) {
            return null;
        }

        // Determine which are the optional arguments for this command
        const commandIndex = ParserUtils.commandIndex(command, commandArguments);
        const arg1: string = commandArguments[commandIndex + 1];

        // We have a request for HELP on the command
        if (typeof arg1 === "undefined") {
            return { command };
        }

        const arg2: string =
            typeof commandArguments[commandIndex + 2] !== "undefined" ? commandArguments[commandIndex + 2] : "";
        const arg3: string =
            typeof commandArguments[commandIndex + 3] !== "undefined" ? commandArguments[commandIndex + 3] : "";

        switch (command) {
            case "SEND":
                return await ParserUtils.parseSEND(arg1, arg2, arg3, platform);
            case "STICKERS":
                return await ParserUtils.parseSTICKERS(arg1, platform);
            case "WITHDRAW":
                return await ParserUtils.parseWITHDRAW(arg1, arg2, arg3);
            default:
                return { command };
        }
    }

    /**
     * Check if an address is valid
     * @param address
     * @param token
     */
    public static async isValidAddress(address: string, token: string): Promise<boolean> {
        try {
            switch (token) {
                case "ARK":
                    const arkSchema = {
                        address: Joi.string()
                            .regex(/^A/)
                            .token()
                            .length(34)
                            .required(),
                    };
                    await Joi.attempt({ address }, arkSchema);
                    return true;

                case "DARK":
                    const darkSchema = {
                        address: Joi.string()
                            .regex(/^D/)
                            .token()
                            .length(34)
                            .required(),
                    };
                    await Joi.attempt({ address }, darkSchema);
                    return true;

                default:
                    return false;
            }
        } catch (e) {
            return false;
        }
    }

    /**
     * @dev Find the needle in the array and return it's index
     * @param {string} needle Reddit username
     * @param {array[string]} stack Split up body all caps
     * @returns index or -1
     */
    public static commandIndex(needle: string, stack: string[]): number {
        needle = needle.toUpperCase();
        const index = stack.indexOf(needle);

        if (index < 0) {
            // We know it's there, but maybe wasn't in uppercase
            for (const item in stack) {
                if (typeof stack[item] !== "undefined") {
                    const haystack = stack[item].toUpperCase();
                    if (haystack.includes(needle)) {
                        return parseInt(item, 10);
                    }
                }
            }
        }
        return index;
    }

    /**
     * Parse a SEND command
     * @param arg1
     * @param arg2
     * @param arg3
     * @param platform
     */
    public static async parseSEND(arg1: string, arg2: string, arg3: string, platform: string): Promise<Command> {
        const command = "SEND";
        const user: Username = ParserUtils.parseUsername(arg1, platform);
        if (await ParserUtils.isValidUser(user)) {
            const amountCurrency: AmountCurrency = await ParserUtils.parseAmount(arg2, arg3);
            if (amountCurrency !== null && amountCurrency.arkToshiValue.gt(0)) {
                const transfer: Transfer = {
                    user,
                    command: "SEND",
                    arkToshiValue: amountCurrency.arkToshiValue,
                    check: amountCurrency,
                };
                return { command, transfers: [transfer] };
            }
        }
        return { command };
    }

    /**
     * Parse a STICKERS command
     * @param arg1
     * @param platform
     */
    public static async parseSTICKERS(arg1: string, platform: string): Promise<Command> {
        const command = "STICKERS";
        const user: Username = ParserUtils.parseUsername(arg1, platform);
        if ((await ParserUtils.isValidUser(user)) === false) {
            return { command };
        }
        return { command, user };
    }

    /**
     * Parse a WITHDRAW command
     * @param arg1
     * @param arg2
     * @param arg3
     * @param token
     */
    public static async parseWITHDRAW(arg1: string, arg2: string, arg3: string, token?: string): Promise<Command> {
        const command = "WITHDRAW";
        token = typeof token !== "undefined" ? token : "ARK";

        if (await ParserUtils.isValidAddress(arg1, token)) {
            const amountCurrency: AmountCurrency = await ParserUtils.parseAmount(arg2, arg3);
            const arkToshiValue =
                amountCurrency !== null && amountCurrency.arkToshiValue.gt(0) ? amountCurrency.arkToshiValue : null;

            const transfer: Transfer = {
                address: arg1,
                command: "WITHDRAW",
                arkToshiValue,
                check: amountCurrency,
            };
            return { command, transfers: [transfer] };
        }
        return { command };
    }

    /**
     * Parse a mention command
     * @param command
     * @param bodyParts
     * @param mentionBody
     * @param mentionIndex
     * @param platform
     */
    public static async parseMentionCommand(
        command: string,
        bodyParts: string[],
        mentionBody: string,
        mentionIndex: number,
        platform: string,
    ): Promise<Command> {
        const smallFooter: boolean = bodyParts[mentionIndex + 1] === "~";
        switch (command) {
            case "STICKERS":
                return { command, smallFooter };

            case "REWARD":
                const transfers: Transfer[] = await ParserUtils.parseReward(mentionBody, mentionIndex, platform);
                return transfers ? { command, transfers, smallFooter } : null;

            default:
                // Check if we received a TIP command
                const amountCurrency: AmountCurrency = await ParserUtils.parseTip(bodyParts, mentionIndex);
                if (amountCurrency !== null) {
                    return {
                        command: "TIP",
                        arkToshiValue: amountCurrency.arkToshiValue,
                        check: amountCurrency,
                        smallFooter,
                    };
                }
        }
        return null;
    }

    /**
     * Parse a REWARD mention command
     * @param mentionBody
     * @param mentionIndex
     * @param platform
     */
    public static async parseReward(mentionBody: string, mentionIndex: number, platform: string): Promise<Transfer[]> {
        const requestedRewards: Transfer[] = [];
        let bodyParts: string[] = ParserUtils.splitMessageToParts(mentionBody, true);
        bodyParts = bodyParts.slice(mentionIndex + 1);

        for (const item in bodyParts) {
            if (typeof bodyParts[item] !== "undefined") {
                const index: number = parseInt(item, 10);
                if (typeof bodyParts[index - 1] !== "undefined") {
                    const user: Username = ParserUtils.parseUsername(bodyParts[item], platform);
                    if (await ParserUtils.isValidUser(user)) {
                        const command: string = bodyParts[index - 1].toUpperCase();

                        if (command === "STICKERS") {
                            const transfer: Transfer = {
                                user,
                                command: "STICKERS",
                            };
                            requestedRewards.push(transfer);
                        } else {
                            const rightInput: string = bodyParts[index - 1].toUpperCase();
                            const leftInput: string =
                                index >= 2 && ParserUtils.isValidLeftInput(bodyParts[index - 2], rightInput)
                                    ? bodyParts[index - 2].toUpperCase()
                                    : "";
                            const amountCurrency: AmountCurrency = await ParserUtils.parseAmount(leftInput, rightInput);
                            if (amountCurrency !== null && amountCurrency.arkToshiValue.gt(0)) {
                                const transfer: Transfer = {
                                    user,
                                    command: "TIP",
                                    arkToshiValue: amountCurrency.arkToshiValue,
                                    check: amountCurrency,
                                };
                                requestedRewards.push(transfer);
                            }
                        }
                    }
                }
            }
        }
        return requestedRewards.length ? requestedRewards : null;
    }
}
