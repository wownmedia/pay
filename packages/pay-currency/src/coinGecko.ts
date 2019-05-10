import BigNumber from "bignumber.js";
import CoinGecko from "coingecko-api";
const coinGeckoClient = new CoinGecko();

export class CoinGeckoAPI {
    public static async price(currency: string, fiat: string): Promise<BigNumber> {
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

        const simpleCurrencyTicker = await this.getSimplePrice(currency, fiat);

        if (!simpleCurrencyTicker.hasOwnProperty("data") || !simpleCurrencyTicker.success === true) {
            throw new Error(
                `Can not communicate to CoinGecko: simpleCurrencyTicker: ${JSON.stringify(simpleCurrencyTicker)}`,
            );
        }

        const currencyValue = new BigNumber(simpleCurrencyTicker.data[currency][fiat]);
        if (currencyValue.isNaN()) {
            throw new Error(`Did not receive a valid value for ${currency}`);
        }

        return currencyValue;
    }

    /**
     * Interface to the CoinGecko API
     * @param currency
     * @param fiat
     */
    public static async getSimplePrice(currency: string, fiat: string): Promise<any> {
        if (process.env.NODE_ENV === "test") {
            return false;
        }

        return await coinGeckoClient.simple.price({
            ids: [currency],
            vs_currencies: [fiat],
        });
    }
}
