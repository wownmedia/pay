import { Command, Commands, Transfer } from "@cryptology.hk/pay-commands";
import { config } from "@cryptology.hk/pay-config";
import { AmountCurrency, BaseCurrency, Currency, CurrencySymbol } from "@cryptology.hk/pay-currency";
import { Username } from "@cryptology.hk/pay-user";
import BigNumber from "bignumber.js";
import Joi from "joi";

const configuration = config.get("parser");
const USERNAME_PLATFORM_SEPERATOR = configuration.seperator ? configuration.seperator : "@";
const baseCurrencyConfig = config.get("parser");
const ARKTOSHI = new BigNumber(Math.pow(10, 8));
const baseCurrency: BaseCurrency = {
    ticker: baseCurrencyConfig.baseCurrency ? baseCurrencyConfig.baseCurrency.toUpperCase() : "ARK",
    units: ARKTOSHI,
};
const arkEcosystemConfig = config.get("arkEcosystem");

// Use a ParserUtils class to be able to add these methods to Unit testing without exposing them to the module
export class ParserUtils {
    /**
     * @dev     Parse a TIP mention command to get it's value in ArkToshi
     * @param   bodyParts
     * @param   mentionIndex
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
    public static async parseTipValue(bodyParts: string[], mentionIndex: number): Promise<AmountCurrency> {
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
     * @dev Parse a mention command
     * @param command
     * @param bodyParts
     * @param mentionBody
     * @param mentionIndex
     * @param platform
     * @param commandSender
     * @param commandReplyTo
     * @param id
     */
    public static async parseMentionCommand(
        command: string,
        bodyParts: string[],
        mentionBody: string,
        mentionIndex: number,
        platform: string,
        commandSender: Username,
        commandReplyTo: Username,
        id: string,
    ): Promise<Command[]> {
        const smallFooter: boolean = bodyParts[mentionIndex + 1] === "~";
        switch (command) {
            case "STICKERS":
                return [{ command, smallFooter, commandSender, commandReplyTo, id }];

            case "REWARD":
                const transfers: Transfer[] = await ParserUtils.parseReward(
                    mentionBody,
                    mentionIndex,
                    platform,
                    commandSender,
                );
                const commands: Command[] = [];
                for (const item in transfers) {
                    if (transfers[item]) {
                        const rewardCommand: Command = {
                            commandReplyTo: transfers[item].receiver,
                            commandSender,
                            command: transfers[item].command,
                            transfer: transfers[item],
                            smallFooter,
                            id,
                        };
                        commands.push(rewardCommand);
                    }
                }
                return commands;

            default:
                // Check if we received a TIP command
                const amountCurrency: AmountCurrency = await ParserUtils.parseTipValue(bodyParts, mentionIndex);
                if (amountCurrency !== null) {
                    const token: string = arkEcosystemConfig.hasOwnProperty(amountCurrency.currency.toLowerCase())
                        ? amountCurrency.currency.toUpperCase()
                        : baseCurrency.ticker;
                    const transfer: Transfer = {
                        sender: commandSender,
                        receiver: commandReplyTo,
                        command: "TIP",
                        arkToshiValue: amountCurrency.arkToshiValue,
                        token,
                        check: amountCurrency,
                    };
                    return [
                        {
                            command: "TIP",
                            transfer,
                            smallFooter,
                            commandSender,
                            commandReplyTo,
                            id,
                        },
                    ];
                }
        }
        return null;
    }

    /**
     * @dev Parse a command
     * @param command
     * @param commandArguments
     * @param platform
     * @param commandSender
     */
    public static async parseCommand(
        command: string,
        commandArguments: string[],
        platform: string,
        commandSender: Username,
    ): Promise<Command> {
        command = command.toUpperCase();
        if (!Commands.isValidCommand(command)) {
            return null;
        }

        // Determine which are the optional arguments for this command
        const commandIndex = ParserUtils.commandIndex(command, commandArguments);
        const arg1: string =
            typeof commandArguments[commandIndex + 1] !== "undefined" ? commandArguments[commandIndex + 1] : "";
        const arg2: string =
            typeof commandArguments[commandIndex + 2] !== "undefined" ? commandArguments[commandIndex + 2] : "";
        const arg3: string =
            typeof commandArguments[commandIndex + 3] !== "undefined" ? commandArguments[commandIndex + 3] : "";
        const arg4: string =
            typeof commandArguments[commandIndex + 4] !== "undefined" ? commandArguments[commandIndex + 4] : "";

        switch (command) {
            case "BALANCE":
                return await ParserUtils.parseBALANCE(arg1, platform, commandSender);
            case "ADDRESS":
            case "DEPOSIT":
                return await ParserUtils.parseDEPOSIT(arg1, platform, commandSender);
            case "SEND":
                return await ParserUtils.parseSEND(arg1, arg2, arg3, platform, commandSender);
            case "STICKERS":
                return await ParserUtils.parseSTICKERS(arg1, platform, commandSender);
            case "WITHDRAW":
                return await ParserUtils.parseWITHDRAW(arg1, arg2, arg3, arg4, commandSender);
            default:
                return { command, commandSender };
        }
    }

    /**
     * @dev Parse a SEND command
     * @param arg1
     * @param arg2
     * @param arg3
     * @param platform
     * @param commandSender
     */
    public static async parseSEND(
        arg1: string,
        arg2: string,
        arg3: string,
        platform: string,
        commandSender: Username,
    ): Promise<Command> {
        const command = "SEND";
        const receiver: Username = ParserUtils.parseUsername(arg1, platform);
        const validUser: boolean = ParserUtils.isValidUser(receiver);
        if (validUser) {
            const amountCurrency: AmountCurrency = await ParserUtils.parseAmount(arg2, arg3);
            if (amountCurrency !== null && amountCurrency.arkToshiValue.gt(0)) {
                const token: string = arkEcosystemConfig.hasOwnProperty(amountCurrency.currency.toLowerCase())
                    ? amountCurrency.currency.toUpperCase()
                    : baseCurrency.ticker;
                const transfer: Transfer = {
                    sender: commandSender,
                    receiver,
                    command,
                    arkToshiValue: amountCurrency.arkToshiValue,
                    token,
                    check: amountCurrency,
                };
                return { command, transfer, commandSender, commandReplyTo: receiver };
            }
        }
        return { command, commandSender };
    }

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
    public static async parseAmount(leftInput: string, rightInput: string = ""): Promise<AmountCurrency> {
        let amountCurrency: AmountCurrency = null;
        // A valid Currency/Amount pair E.g. [1,ARK], [USD,1]
        if (
            (Currency.isNumericalInput(leftInput) && Currency.isValidCurrency(rightInput)) ||
            (Currency.isNumericalInput(rightInput) && Currency.isValidCurrency(leftInput))
        ) {
            const toParse: string = rightInput.trim() + leftInput.trim();
            amountCurrency = Currency.parseAmountCurrency(toParse);
        }

        // A single left input; E.g. [1,_], [ARK1,_], [USD1,_]
        else if (
            leftInput !== "" &&
            (typeof rightInput === "undefined" ||
                rightInput === "" ||
                (!Currency.isValidCurrency(rightInput) && !Currency.isNumericalInput(rightInput)))
        ) {
            amountCurrency = Currency.parseAmountCurrency(leftInput);
        }

        // E.g. [_,1], [_,ARK1], [_,USD1]
        else {
            amountCurrency = Currency.parseAmountCurrency(rightInput);
        }

        if (amountCurrency !== null) {
            amountCurrency.currency = CurrencySymbol[amountCurrency.currency] || amountCurrency.currency;

            // Convert currency to its current Arktoshi value
            amountCurrency.arkToshiValue = await Currency.getExchangedValue(
                amountCurrency.amount,
                amountCurrency.currency,
            );
        }
        return amountCurrency;
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
    public static isValidUser(user: Username): boolean {
        // A user can never be a command
        if (Commands.isValidCommand(user.username)) {
            return false;
        }

        // A user can never be a currency or a number
        const amountCurrency: AmountCurrency = Currency.parseAmountCurrency(user.username);
        if (
            amountCurrency !== null ||
            Currency.isValidCurrency(user.username) ||
            Currency.isNumericalInput(user.username)
        ) {
            return false;
        }
        return !(!new BigNumber(user.username).isNaN() || !this.isValidPlatform(user.platform) || user.username === "");
    }

    public static isValidPlatform(platform: string): boolean {
        return platform === "reddit";
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
     * @param commandSender
     */
    public static async checkCommand(
        command: string,
        commandArguments: string[],
        platform: string,
        commandSender: Username,
    ): Promise<Command> {
        command = command.toUpperCase();
        if (!Commands.isValidCommand(command)) {
            return null;
        }

        if (Commands.hasArguments(command)) {
            return await ParserUtils.parseCommand(command, commandArguments, platform, commandSender);
        }
        return { command, commandSender };
    }

    /**
     * Check if an address is valid
     * @param address
     * @param token
     */
    public static async isValidAddress(address: string, token: string): Promise<boolean> {
        try {
            const arkSchema = {
                address: Joi.string()
                    .token()
                    .length(34)
                    .required(),
            };
            await Joi.attempt({ address }, arkSchema);
            return true;
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
     * Parse a STICKERS command
     * @param arg1
     * @param platform
     * @param commandSender
     */
    public static async parseSTICKERS(arg1: string, platform: string, commandSender: Username): Promise<Command> {
        const command = "STICKERS";
        const commandReplyTo: Username = ParserUtils.parseUsername(arg1, platform);
        const validUser = ParserUtils.isValidUser(commandReplyTo);
        if (validUser) {
            return { command, commandReplyTo, commandSender };
        }
        return { command, commandSender };
    }

    /**
     * Parse a DEPOSIT command
     * @param arg1
     * @param platform
     * @param commandSender
     */
    public static async parseDEPOSIT(arg1: string, platform: string, commandSender: Username): Promise<Command> {
        arg1 = arg1.toLowerCase();
        const command: string = "DEPOSIT";
        const token: string = arkEcosystemConfig.hasOwnProperty(arg1) ? arg1.toUpperCase() : baseCurrency.ticker;
        return { command, token, commandSender };
    }

    /**
     * Parse a BALANCE command
     * @param arg1
     * @param platform
     * @param commandSender
     */
    public static async parseBALANCE(arg1: string, platform: string, commandSender: Username): Promise<Command> {
        arg1 = arg1.toLowerCase();
        const command: string = "BALANCE";
        const token: string = arkEcosystemConfig.hasOwnProperty(arg1) ? arg1.toUpperCase() : baseCurrency.ticker;
        return { command, token, commandSender };
    }

    /**
     * @dev Parse a WITHDRAW command:
     * Parse a WITHDRAW command to determine which currency and which value to withdraw to what address
     *
     * @param arg1  Either the currency (e.g. ARK or DARK), or the Address to withdraw to (base currency ARK will be implied)
     * @param arg2  Either the address to withdraw to, or the first part of the currency/amount pair (e.g. 10, USD, 10USD)
     * @param arg3  Either the first, or the second part of the currency/amount pair.
     * @param arg4  Either empty or the second part of the currency/amount pair
     * @param commandSender The user/platform who is sending the command.
     * @returns a Promise with a parsed command
     */
    public static async parseWITHDRAW(
        arg1: string,
        arg2: string,
        arg3: string,
        arg4: string,
        commandSender: Username,
    ): Promise<Command> {
        const command: string = "WITHDRAW";
        let token: string = baseCurrency.ticker;
        let address: string = arg1;
        let currency: string = arg2;
        let amount: string = arg3;
        if (arkEcosystemConfig.hasOwnProperty(arg1.toLowerCase())) {
            token = arg1.toUpperCase();
            address = arg2;
            currency = arg3;
            amount = arg4;
        }

        if (await ParserUtils.isValidAddress(address, token)) {
            const amountCurrency: AmountCurrency = await ParserUtils.parseAmount(currency, amount);
            const arkToshiValue =
                amountCurrency !== null && amountCurrency.arkToshiValue.gt(0) ? amountCurrency.arkToshiValue : null;

            const transfer: Transfer = {
                sender: commandSender,
                address,
                command,
                arkToshiValue,
                token,
                check: amountCurrency,
            };
            return { command, token, transfer, commandSender };
        }
        return { command, token, commandSender };
    }

    /**
     * Parse a REWARD mention command
     * @param mentionBody
     * @param mentionIndex
     * @param platform
     * @param commandSender
     */
    public static async parseReward(
        mentionBody: string,
        mentionIndex: number,
        platform: string,
        commandSender: Username,
    ): Promise<Transfer[]> {
        const requestedRewards: Transfer[] = [];
        let bodyParts: string[] = ParserUtils.splitMessageToParts(mentionBody, true);
        bodyParts = bodyParts.slice(mentionIndex + 1);

        for (const item in bodyParts) {
            if (typeof bodyParts[item] !== "undefined") {
                const index: number = parseInt(item, 10);
                if (typeof bodyParts[index - 1] !== "undefined") {
                    const receiver: Username = this.parseUsername(bodyParts[item], platform);
                    const validUser: boolean = this.isValidUser(receiver);
                    if (validUser) {
                        const command: string = bodyParts[index - 1].toUpperCase();

                        if (command === "STICKERS") {
                            const transfer: Transfer = {
                                sender: commandSender,
                                receiver,
                                command: "STICKERS",
                            };
                            requestedRewards.push(transfer);
                        } else {
                            const rightInput: string = bodyParts[index - 1].toUpperCase();
                            const leftInput: string =
                                index >= 2 && this.isValidLeftInput(bodyParts[index - 2], rightInput)
                                    ? bodyParts[index - 2].toUpperCase()
                                    : "";
                            const amountCurrency: AmountCurrency = await this.parseAmount(leftInput, rightInput);
                            if (amountCurrency !== null && amountCurrency.arkToshiValue.gt(0)) {
                                const token: string = arkEcosystemConfig.hasOwnProperty(
                                    amountCurrency.currency.toLowerCase(),
                                )
                                    ? amountCurrency.currency.toUpperCase()
                                    : baseCurrency.ticker;
                                const transfer: Transfer = {
                                    sender: commandSender,
                                    receiver,
                                    command: "TIP",
                                    arkToshiValue: amountCurrency.arkToshiValue,
                                    token,
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
