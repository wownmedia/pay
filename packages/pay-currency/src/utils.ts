import BigNumber from "bignumber.js";
BigNumber.config({ DECIMAL_PLACES: 8, ROUNDING_MODE: BigNumber.ROUND_DOWN });
import { CoinGeckoAPI } from "./coinGecko";
import { AmountCurrency } from "./currency";

// Load Configuration from file
import { config } from "@cryptology.hk/pay-config";
import { logger } from "@cryptology.hk/pay-logger";
const CURRENCIES = ["ARK", "Ѧ", "USD", "$", "EUR", "€", "BTC", "BCH", "GBP"];
const configuration = config.get("pay-currency");
const arkEcosystemConfig = config.get("arkEcosystem");
const acceptedCurrencies: string[] = configuration.acceptedCurrencies ? configuration.acceptedCurrencies : CURRENCIES;

// Use a CurrencyUtils class to be able to add these methods to Unit testing without exposing them to the module
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
                logger.info(`ecosystem SPLIT: ${i}`);
                const currency: string = i.toString().toUpperCase();
                if (data.startsWith(currency) || data.endsWith(currency)) {
                    const checkValidArkEcosystem: string = data.replace(currency, "").trim();
                    const amount = new BigNumber(checkValidArkEcosystem);
                    if (!amount.isNaN()) {
                        logger.info(`SPLIT: ${currency} ${amount}`);
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
