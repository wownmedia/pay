import BigNumber from "bignumber.js";
import { config } from "../../core";
import { AmountCurrency, BaseCurrency } from "../../interfaces";
import { CoinGeckoAPI } from "./coinGecko";

BigNumber.config({ DECIMAL_PLACES: 8, ROUNDING_MODE: BigNumber.ROUND_DOWN });
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

export class CurrencyUtils {
    /**
     * @dev Calculate the exchange rate for a currency in amount of base currency
     * @param currency {string}     The currency to exchange
     * @param baseCurrency {string} The base currency to exchange into
     * @returns {Promise<BigNumber>} The exchange rate
     */
    public static async getCurrencyTicker(currency: string, baseCurrency: string): Promise<BigNumber> {
        // Check if we have no conversion to make
        if (currency === baseCurrency || arkEcosystemConfig.hasOwnProperty(currency.toLowerCase())) {
            return new BigNumber(1);
        }

        const currencyValue: BigNumber = await CurrencyUtils.getCurrencyValue(currency, currency);
        const baseCurrencyValue: BigNumber = await CurrencyUtils.getCurrencyValue(baseCurrency, currency);

        return baseCurrencyValue.div(currencyValue);
    }

    /**
     * @dev Retrieve the exchange rate for a currency on CoinGecko
     * @param currency {string}
     * @param fiat {string}
     * @returns {Promise<BigNumber>} The exchange rate
     */
    public static async getCurrencyValue(currency: string, fiat: string): Promise<BigNumber> {
        return await CoinGeckoAPI.price(currency, fiat);
    }

    /**
     * @dev Replace , (comma) by . (dot) and uppercase text so it can be parsed correctly
     * @param data {string}
     * @returns {string}
     */
    public static convertAmountCurrency(data: string): string {
        if (typeof data === "undefined" || data.trim() === "") {
            data = "";
        }
        return data.replace(/[,]/g, ".").toUpperCase();
    }

    /**
     * @dev Correctly split <amount><currency> into <amount> <currency>
     * @param data
     * @returns {AmountCurrency}
     */
    public static splitCurrencyAmountPair(data: string): AmountCurrency {
        for (const i in arkEcosystemConfig) {
            if (arkEcosystemConfig.hasOwnProperty(i)) {
                const currency: string = i.toString().toUpperCase();
                if (data.startsWith(currency) || data.endsWith(currency)) {
                    const checkValidArkEcosystem: string = data.replace(currency, "").trim();
                    const amount = new BigNumber(checkValidArkEcosystem);
                    if (!amount.isNaN()) {
                        return { currency, amount };
                    }
                }
            }
        }

        for (const currency of acceptedCurrencies) {
            if (data.startsWith(currency) || data.endsWith(currency)) {
                const amount = new BigNumber(data.replace(currency, "").trim());
                if (amount.isNaN()) {
                    return null;
                }
                return { currency, amount };
            }
        }
        return null;
    }
}
