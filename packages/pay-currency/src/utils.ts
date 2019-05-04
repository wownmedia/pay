import BigNumber from "bignumber.js";
BigNumber.config({ DECIMAL_PLACES: 8, ROUNDING_MODE: BigNumber.ROUND_DOWN });
import CoinGecko from "coingecko-api";
const coinGeckoClient = new CoinGecko();

// Use a CurrencyUtils class to be able to add these methods to Unit testing without exposing them to the module
export class CurrencyUtils {
    /**
     * Calculate the exchange rate for a currency in amount of base currency
     * @param currency
     * @param baseCurrency
     */
    public static async getCurrencyTicker(currency: string, baseCurrency: string): Promise<BigNumber> {
        // Check if we have no conversion to make
        if (currency === baseCurrency) {
            return new BigNumber(1);
        }

        const currencyValue: BigNumber = await CurrencyUtils.getCurrencyValue(currency, currency);
        const baseCurrencyValue: BigNumber = await CurrencyUtils.getCurrencyValue(baseCurrency, currency);

        const exchangeRate = baseCurrencyValue.div(currencyValue);
        if (exchangeRate.isNaN()) {
            throw new Error("Bad exchange rate.");
        }

        return exchangeRate;
    }

    /**
     * Retrieve the exchange rate for a currency on CoinGecko
     * @param currency
     * @param fiat
     */
    public static async getCurrencyValue(currency: string, fiat: string): Promise<BigNumber> {
        currency = currency.toLowerCase();
        switch (currency) {
            case "btc":
            case "bch":
            case "usd":
            case "eur":
                return new BigNumber(1);
        }

        fiat = fiat.toLowerCase();
        switch (fiat) {
            case "usd":
            case "eur":
            case "bch":
            case "btc":
                break;
            default:
                fiat = "usd";
        }

        // Don't query CoinGecko when we are testing
        if (process.env.NODE_ENV === "test") {
            return new BigNumber(1);
        }

        // Check if we have access to CoinGecko
        if (!(await coinGeckoClient.ping())) {
            throw new Error("Can not communicate to CoinGecko");
        }

        const simpleCurrencyTicker = await coinGeckoClient.simple.price({
            ids: [currency],
            vs_currencies: [fiat],
        });

        if (!simpleCurrencyTicker.hasOwnProperty("data") || !simpleCurrencyTicker.success === true) {
            throw new Error("Can not communicate to CoinGecko: simpleCurrencyTicker");
        }

        const currencyValue = new BigNumber(simpleCurrencyTicker.data[currency][fiat]);
        if (currencyValue.isNaN()) {
            throw new Error(`Did not receive a valid value for ${currency}`);
        }

        return currencyValue;
    }
}
