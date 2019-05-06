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
