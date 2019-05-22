import { ArkWallet } from "@cryptology.hk/pay-ark";
import { Currency } from "@cryptology.hk/pay-currency";
import { Messenger, Reply } from "@cryptology.hk/pay-messenger";
import { User, Username } from "@cryptology.hk/pay-user";
import BigNumber from "bignumber.js";

export class Balance {
    public static async getBalance(user: Username, token: string): Promise<Reply> {
        try {
            const wallet: string = await User.getWalletAddress(user, token);
            const balance: BigNumber = await ArkWallet.getBalance(wallet, token);
            let usdValue: BigNumber = new BigNumber(0);
            // if(balance.gt(0) && token === "ARK") {
            usdValue = await Currency.baseCurrencyUnitsToUSD(balance, token);
            // }
            return Messenger.balanceMessage(balance, usdValue, token);
        } catch (e) {
            return Messenger.errorMessage();
        }
    }
}
