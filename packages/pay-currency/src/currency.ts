// import { logger } from "@cryptology.hk/pay-logger";
import BigNumber from "bignumber.js";
// import Joi from "joi";

export class Currency {
    // noinspection JSMethodCanBeStatic,JSUnusedLocalSymbols
    public async amountToArktoshi(amount: BigNumber, currency: string): Promise<BigNumber> {
        // TODO if TEST
        return new BigNumber(1);
    }
}
