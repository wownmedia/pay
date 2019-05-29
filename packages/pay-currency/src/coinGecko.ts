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

        return await this.getSimplePrice(currency, fiat);
    }

    /**
     * @dev Interface to the CoinGecko API
     * @param currency
     * @param fiat
     *
     * Didn't manage to mock the getter for simple.price in testing, so no coverage for this method.
     */
    public static async getSimplePrice(currency: string, fiat: string): Promise<BigNumber> {
        try {
            currency = currency.toLowerCase();
            fiat = fiat.toLowerCase();

            const simpleCurrencyTicker = await coinGeckoClient.simple.price({
                ids: [currency],
                vs_currencies: [fiat],
            });

            return new BigNumber(simpleCurrencyTicker.data[currency][fiat]);
        } catch (e) {
            return new BigNumber(0);
        }
    }
}
