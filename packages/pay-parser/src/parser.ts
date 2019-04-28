import { Currency } from "@cryptology.hk/pay-currency";
import { logger } from "@cryptology.hk/pay-logger";
import { User, Username } from "@cryptology.hk/pay-user";
import BigNumber from "bignumber.js";
// import Joi from "joi";

// const COMMANDS = ['BALANCE', 'DEPOSIT', 'WITHDRAW', 'SEND', 'HELP', 'ADDRESS', 'STICKERS', 'TIP'];
const CURRENCIES = ["ARK", "Ѧ", "USD", "$", "EUR", "€", "BTC", "BCH"];
const USERNAME_PLATFORM_SEPERATOR = "@";
// const schema = {
//    address: Joi.string().token().length(34).optional(),
//    smartbridge: Joi.string().max(255, 'utf8').allow('').optional(),
//    passphrase: Joi.string().optional(),
//    secondSecret: Joi.string().allow('').optional(),
//    amount: Joi.number().integer().min(1).optional()
// };

/**
 * Parsed amount/currency pair and it's value in Arktoshi
 */
interface AmountCurrency {
    arkToshiValue?: BigNumber;
    amount: BigNumber;
    currency: string;
}

/**
 * Command parsed from a parsed mention and it's value in Arktoshi
 */
export interface Mention {
    command: string;
    arkToshiValue?: BigNumber;
    transfers?: Transfer[];
    check?: AmountCurrency;
    smallFooter?: boolean;
}

interface Transfer {
    user: Username;
    command: string;
    arkToshiValue?: BigNumber;
    check?: AmountCurrency;
}

/**
 * Parse textual input for commands and parameters
 */
export class Parser {
    /**
     * Replace , (comma) by . (dot) and uppercase text
     * @param data
     * @private
     */
    private static __convertAmountCurrency(data: string): string {
        // We need something to work with
        if (typeof data === "undefined") {
            throw TypeError("Amount/User is undefined");
        }
        return data.replace(/[,]/g, ".").toUpperCase();
    }

    /**
     * Check if data is a valid numerical: postive number, greater than 0 and smaller than Max Safe Integer
     * @param data
     * @private
     */
    private static __isNumericalInput(data: string): boolean {
        // We need something to work with
        if (typeof data === "undefined") {
            throw TypeError("Input is undefined");
        }

        data = data.replace(/[,]/g, ".");
        const numerical: BigNumber = new BigNumber(data);
        return !numerical.isNaN() && numerical.lte(Number.MAX_SAFE_INTEGER) && numerical.gt(0);
    }

    /**
     * Check if input is a valid currency or amount + valid currency
     * Valid input formats: 10 | 1.0 | 1,0 | USD10 | USD1.0 | USD1,1 | 10USD | 1.0USD | 1,1USD
     * @param data
     * @private
     */
    private static __isValidCurrencyInput(data: string): boolean {
        try {
            data = Parser.__convertAmountCurrency(data);

            // Check if we only have a valid currency or valid positive amount
            if (CURRENCIES.indexOf(data) !== -1 || Parser.__isNumericalInput(data)) {
                return true;
            }

            // Check if we have a combination of a valid currency and an amount
            for (const i in CURRENCIES) {
                if (typeof CURRENCIES[i] !== "undefined") {
                    const currency = CURRENCIES[i];
                    if (data.startsWith(currency) || data.endsWith(currency)) {
                        data = data.replace(currency, "").trim();
                        return Parser.__isNumericalInput(data);
                    }
                }
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    /**
     * Convert currency symbols to names
     * @param symbol
     * @private
     */
    private static __currencySymbolsToName(symbol: string): string {
        switch (symbol) {
            case "Ѧ":
                symbol = "ARK";
                break;
            case "$":
                symbol = "USD";
                break;
            case "€":
                symbol = "EUR";
                break;
        }
        return symbol;
    }

    /**
     * Find where the mentioned username is in the message
     * @param user
     * @param mention
     * @private
     */
    private static __findMentionedArkPayUser(user: string, mention: string[]): number {
        user = user.toUpperCase();
        const index: number = mention.indexOf(user);

        if (index === 0) {
            throw TypeError("Mentioned user as first entry in the message: where is the command?");
        }

        if (index === -1) {
            // Really? I know it is there, we got triggered by a mention after all...
            for (const item in mention) {
                if (typeof mention !== "undefined") {
                    const checkForUser: string = mention[item].toUpperCase();
                    if (checkForUser.includes(user)) {
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
     * @private
     */
    private static __splitMessageToParts(message: string): string[] {
        return message
            .toUpperCase()
            .trim()
            .split(/\s+/);
    }

    private static __parseUsername(username: string, platform: string): Username {
        // Remove the Reddit user u/
        const userNameReplace: RegExp = new RegExp("(u/)");
        username = username.replace(userNameReplace, "");

        // Split up the username and platform if any (eg. cryptology@twitter)
        const usernameParts: string[] = username.split(USERNAME_PLATFORM_SEPERATOR);
        if (usernameParts.length === 2) {
            username = usernameParts[0];
            platform = usernameParts[1];
        }

        return { username, platform };
    }

    private baseCurrency: string;

    /**
     *
     * @param baseCurrency  The currency to use as default
     */
    constructor(baseCurrency?: string) {
        this.baseCurrency = baseCurrency ? baseCurrency.toUpperCase() : "ARK";
        if (CURRENCIES.indexOf(this.baseCurrency) === -1) {
            CURRENCIES.push(this.baseCurrency);
        }
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Check if a string is a valid currency
     * @param currency
     */
    public isValidCurrency(currency: string): boolean {
        currency = currency.toUpperCase();
        return CURRENCIES.indexOf(currency) !== -1;
    }

    /**
     * Parse an amount/currency combination and return it's value in Arktoshi
     * @param leftInput
     * @param rightInput
     */
    public async parseAmount(leftInput: string, rightInput?: string): Promise<AmountCurrency> {
        // We need something to work with
        if (typeof leftInput === "undefined" && typeof rightInput === "undefined") {
            return null;
        }

        let amountCurrency: AmountCurrency;
        try {
            // In case we have input like "SEND 10" or "SEND 10USD"
            if (typeof rightInput === "undefined" || rightInput === "") {
                amountCurrency = this.__parseAmountCurrency(leftInput);
            }

            // In case we have input like "10 u/arktippr" or "10USD u/arktippr"
            else if (typeof leftInput === "undefined" || leftInput === "") {
                amountCurrency = this.__parseAmountCurrency(rightInput);
            }

            // In case we have input like "SEND 10 USD" or "10 USD u/arktippr" or "SEND USD 10" or "USD 10 u/arktippr"
            else if (this.isValidCurrency(rightInput) || this.isValidCurrency(leftInput)) {
                amountCurrency = this.__parseAmountCurrency(rightInput + leftInput);
            }

            // Invalid input
            else {
                return null;
            }

            // Convert currency to its current Arktoshi value
            const currency = new Currency();
            amountCurrency.currency = Parser.__currencySymbolsToName(amountCurrency.currency);
            amountCurrency.arkToshiValue = await currency.amountToArktoshi(
                amountCurrency.amount,
                amountCurrency.currency,
            );
        } catch (e) {
            return null;
        }

        return amountCurrency;
    }

    /**
     * Parse a received mention and return it's command and the value in Arktoshi
     * @param mentionBody
     * @param arkPayUser The user that was mentioned e.g. u/arktippr or @arktippr
     * @param platform The plaform where this was mentioned e.g. reddit or twitter
     */
    public async parseMention(mentionBody: string, arkPayUser: string, platform?: string): Promise<Mention> {
        // We need something to work with
        if (typeof mentionBody === "undefined" || typeof arkPayUser === "undefined") {
            return null;
        }

        if (!platform) {
            platform = "reddit";
        }

        try {
            // Split up the mention so we can parse it for commands
            const mentionBodyParts: string[] = Parser.__splitMessageToParts(mentionBody);
            arkPayUser = arkPayUser.toUpperCase();
            const mentionIndex: number = Parser.__findMentionedArkPayUser(arkPayUser, mentionBodyParts);
            const command: string = mentionBodyParts[mentionIndex - 1];

            return await this.__parseMentionCommand(command, mentionBodyParts, mentionBody, mentionIndex, platform);
        } catch (e) {
            return null;
        }
    }

    private async __parseMentionCommand(
        command: string,
        bodyParts: string[],
        mentionBody: string,
        mentionIndex: number,
        platform: string,
    ): Promise<Mention> {
        const smallFooter: boolean = bodyParts[mentionIndex + 1] === "~";
        switch (command) {
            case "STICKERS":
                return { command, smallFooter };

            case "REWARD":
                const transfers: Transfer[] = await this.__parseReward(mentionBody, mentionIndex, platform);
                return { command, transfers, smallFooter };

            default:
                // Check if we received a TIP command
                const amountCurrency: AmountCurrency = await this.__parseTip(bodyParts, mentionIndex);
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

    private async __parseTip(bodyParts: string[], mentionIndex: number): Promise<AmountCurrency> {
        const leftInput: string = mentionIndex >= 2 ? bodyParts[mentionIndex - 2].toUpperCase() : "";
        const rightInput: string = mentionIndex >= 1 ? bodyParts[mentionIndex - 1].toUpperCase() : "";
        const amountCurrency: AmountCurrency = await this.parseAmount(leftInput, rightInput);

        if (amountCurrency !== null && amountCurrency.arkToshiValue.gt(0)) {
            return amountCurrency;
        }
        return null;
    }

    private async __parseReward(mentionBody: string, mentionIndex: number, platform: string): Promise<Transfer[]> {
        const requestedRewards: Transfer[] = [];
        try {
            let bodyParts: string[] = mentionBody.trim().split(/\s+/);
            bodyParts = bodyParts.slice(mentionIndex + 1);

            for (const item in bodyParts) {
                if (typeof bodyParts[item] !== "undefined") {
                    const user: Username = Parser.__parseUsername(bodyParts[item], platform);
                    if (await this.__isValidUser(user)) {
                        const index: number = parseInt(item, 10);
                        const command: string = index >= 1 ? bodyParts[index - 1].toUpperCase() : "";

                        if (command === "STICKERS") {
                            const transfer: Transfer = {
                                user,
                                command: "STICKERS",
                            };
                            requestedRewards.push(transfer);
                        } else {
                            const rightInput: string = index >= 1 ? bodyParts[index - 1].toUpperCase() : "";
                            const leftInput: string =
                                index >= 2 && this.__needsLeftInput(rightInput)
                                    ? bodyParts[index - 2].toUpperCase()
                                    : "";
                            const amountCurrency: AmountCurrency = await this.parseAmount(leftInput, rightInput);
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
        } catch (e) {
            logger.error(e);
        }

        return requestedRewards.length ? requestedRewards : null;
    }

    private __needsLeftInput(rightInput: string): boolean {
        return (
            this.isValidCurrency(rightInput) ||
            !Parser.__isValidCurrencyInput(rightInput) ||
            Parser.__isNumericalInput(rightInput)
        );
    }

    private async __isValidUser(user: Username): Promise<boolean> {
        // A user can never be a currency or a number
        if (this.isValidCurrency(user.username) || !new BigNumber(user.username).isNaN()) {
            return false;
        }

        const checkValidUser = new User(user.username, user.platform);
        return await checkValidUser.isValidUser();
    }

    /**
     * Split a string up into an amount and a currency part, use base currency if only an amount is inputted
     * @param data e.g. 1.8, 10USD or USD1.0
     * @returns amountCurrency
     */
    private __parseAmountCurrency(data: string): AmountCurrency {
        // First make sure the input is valid
        if (!Parser.__isValidCurrencyInput(data)) {
            throw TypeError(`${data} is not a valid amount/currency input`);
        }

        // Make sure input is formatted correctly
        data = Parser.__convertAmountCurrency(data);

        // Check if data is only a number: in that case we have a value in the base currency
        if (Parser.__isNumericalInput(data)) {
            const currency = this.baseCurrency;
            const amount = new BigNumber(data);
            return { currency, amount };
        }

        for (const i in CURRENCIES) {
            if (typeof CURRENCIES[i] !== "undefined") {
                const currency = CURRENCIES[i];
                if (data.startsWith(currency) || data.endsWith(currency)) {
                    const amount = new BigNumber(data.replace(currency, "").trim());
                    if (amount.isNaN()) {
                        throw TypeError("Not a valid amount currency pair: Amount missing");
                    }
                    return { currency, amount };
                }
            }
        }
        throw TypeError("Not a valid amount currency pair");
    }
}
