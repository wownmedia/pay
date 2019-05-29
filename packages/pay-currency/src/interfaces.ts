import BigNumber from "bignumber.js";

/**
 * Parsed amount/currency pair and it's value in Arktoshi
 */
export interface AmountCurrency {
    arkToshiValue?: BigNumber;
    amount: BigNumber;
    currency: string;
}

export interface BaseCurrency {
    ticker: string;
    units: BigNumber;
}
