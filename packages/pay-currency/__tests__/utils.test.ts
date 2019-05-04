import BigNumber from "bignumber.js";
import "jest-extended";
import { CurrencyUtils } from "../dist/utils";

describe("pay-currency: CurrencyUtils()", () => {
    describe("getCurrencyTicker", () => {
        it("should return a BigNumber that represent the currency value in the base currency", async () => {
            const currency = "BTC";
            const baseCurrency = "ARK";
            const result: BigNumber = await CurrencyUtils.getCurrencyTicker(currency, baseCurrency);
            expect(result).toEqual(new BigNumber(1));
        });
    });
});
