import { config } from "@cryptology.hk/pay-config";
import { logger } from "@cryptology.hk/pay-logger";
import BigNumber from "bignumber.js";
import { CoinGeckoAPI } from "./coinGecko";
import { AmountCurrency, BaseCurrency } from "./currency";

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
     * Calculate the exchange rate for a currency in amount of base currency
     * @param currency
     * @param baseCurrency
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
     * Retrieve the exchange rate for a currency on CoinGecko
     * @param currency
     * @param fiat
     */
    public static async getCurrencyValue(currency: string, fiat: string): Promise<BigNumber> {
        return await CoinGeckoAPI.price(currency, fiat);
    }

    /**
     * Replace , (comma) by . (dot) and uppercase text so it can be parsed correctly
     * @param data
     */
    public static convertAmountCurrency(data: string): string {
        if (typeof data === "undefined" || data.trim() === "") {
            data = "";
        }
        return data.replace(/[,]/g, ".").toUpperCase();
    }

    /**
     * Correctly split <amount><currency> into <amount> <currency>
     * @param data
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

        for (const i in acceptedCurrencies) {
            if (typeof acceptedCurrencies[i] !== "undefined") {
                const currency = acceptedCurrencies[i];
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
