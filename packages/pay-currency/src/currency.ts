import { config } from "@cryptology.hk/pay-config";
import BigNumber from "bignumber.js";
import { AmountCurrency, BaseCurrency } from "./interfaces";
import { CurrencyUtils } from "./utils";

const ARKTOSHI = new BigNumber(Math.pow(10, 8));
const configuration = config.get("currency");
const arkEcosystemConfig = config.get("arkEcosystem");

const baseCurrency: BaseCurrency = {
    ticker: configuration.baseCurrency ? configuration.baseCurrency.toUpperCase() : "ARK",
    units: ARKTOSHI,
};
const acceptedCurrencies: string[] = configuration.acceptedCurrencies
    ? configuration.acceptedCurrencies
    : [baseCurrency.ticker];

export class Currency {
    /**
     * @dev Return the value of <amount> <currency> in the units of the base currency (e.g. Arktoshi)
     * e.g. input 10 USD => 20000000000 Arktoshi
     * @param amount {BigNumber}    The amount to convert
     * @param currency {string}     The currency to convert from
     * @returns {Promise<BigNumber>} The value of converted in ArkToshi
     */
    public static async getExchangedValue(amount: BigNumber, currency: string): Promise<BigNumber> {
        // Check if the input is correct
        currency = currency.toUpperCase().trim();
        if (!Currency.isValidCurrency(currency)) {
            throw TypeError(`${currency} is not supported.`);
        }

        if (amount.isNaN() || amount.lte(0)) {
            throw TypeError("Please enter a valid amount.");
        }

        // Get exchange rate for the requested currency in the base currency.
        // Will throw an error if it fails.
        const exchangeRate: BigNumber = await CurrencyUtils.getCurrencyTicker(currency, baseCurrency.ticker);

        return amount.div(exchangeRate).times(baseCurrency.units);
    }

    /**
     * @dev Get the US$ value of a value in units of the base currency (e.g. Arktoshi)
     * e.g. 2000000000 Arktoshi => US$10
     * @param units {BigNumber} The Arktoshi amount of token to be converted into USD value
     * @param token {string}    The currency the amount is in
     * @returns {Promise<BigNumber>} The USD value
     */
    public static async baseCurrencyUnitsToUSD(units: BigNumber, token?: string): Promise<BigNumber> {
        if (!token) {
            token = baseCurrency.ticker;
        }

        // Check if input is correct
        if (units.isNaN() || units.lt(0)) {
            throw TypeError("Please enter a valid amount.");
        }

        if (units.eq(0)) {
            return new BigNumber(0);
        }

        // Will throw an error if it fails.
        const exchangeRate: BigNumber = await CurrencyUtils.getCurrencyTicker("USD", token);

        return exchangeRate.times(units.div(baseCurrency.units));
    }

    /**
     * @dev Check if a string is a valid currency
     * @param currency {string} To be checked wheter or not it is a valid currency
     * @returns {boolean} TRUE if input is a valid configured currency
     */
    public static isValidCurrency(currency: string): boolean {
        currency = currency.toLowerCase();
        if (arkEcosystemConfig.hasOwnProperty(currency)) {
            return true;
        }

        currency = currency.toUpperCase();
        return acceptedCurrencies.indexOf(currency) !== -1;
    }

    /**
     * @dev Check if input is a valid currency or amount + valid currency
     * @param data {string} Valid input formats: 10 | 1.0 | 1,0 | USD10 | USD1.0 | USD1,1 | 10USD | 1.0USD | 1,1USD
     * @returns {boolean} TRUE if input is a valis currency + amount pair
     */
    public static isValidCurrencyInput(data: string): boolean {
        data = CurrencyUtils.convertAmountCurrency(data);

        // Check if we only have a valid currency or valid positive amount
        if (acceptedCurrencies.indexOf(data) !== -1 || Currency.isNumericalInput(data)) {
            return true;
        }

        // check if we have a configured ArkEcosystem currency
        for (const i in arkEcosystemConfig) {
            if (arkEcosystemConfig.hasOwnProperty(i)) {
                const currency: string = i.toString().toUpperCase();
                if (data.startsWith(currency) || data.endsWith(currency)) {
                    const checkValidArkEcosystem: string = data.replace(currency, "").trim();
                    if (Currency.isNumericalInput(checkValidArkEcosystem)) {
                        return true;
                    }
                }
            }
        }

        // Check if we have a combination of a valid currency and an amount
        for (const i in acceptedCurrencies) {
            if (typeof acceptedCurrencies[i] !== "undefined") {
                const currency = acceptedCurrencies[i];
                if (data.startsWith(currency) || data.endsWith(currency)) {
                    const checkValidCurrency = data.replace(currency, "").trim();
                    if (Currency.isNumericalInput(checkValidCurrency)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * @dev Check if data is a valid numerical: positive number, greater than 0 and smaller than Max Safe Integer
     * @param data {string} The input to check
     * @returns {boolean} TRUE if input is numerical > 0 && < Max safe integer
     */
    public static isNumericalInput(data: string): boolean {
        data = data.replace(/[,]/g, ".");
        const numerical: BigNumber = new BigNumber(data);
        return !numerical.isNaN() && numerical.lte(Number.MAX_SAFE_INTEGER) && numerical.gt(0);
    }

    /**
     * @dev Split a string up into an amount and a currency part, use base currency if only an amount is inputted
     * @param {string} data e.g. 1.8, 10USD or USD1.0
     * @returns {AmountCurrency} Amount/currency pair
     */
    public static parseAmountCurrency(data: string): AmountCurrency {
        // First make sure the input is valid
        if (!Currency.isValidCurrencyInput(data)) {
            return null;
        }

        // Make sure input is formatted correctly
        data = CurrencyUtils.convertAmountCurrency(data);

        // Check if data is only a number: in that case we have a value in the base currency
        if (Currency.isNumericalInput(data)) {
            const amount = new BigNumber(data);
            return { currency: baseCurrency.ticker, amount };
        }

        return CurrencyUtils.splitCurrencyAmountPair(data);
    }
}
