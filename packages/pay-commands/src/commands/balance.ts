import { ArkWallet } from "@cryptology.hk/pay-ark";
import { Currency } from "@cryptology.hk/pay-currency";
import { Messenger, Reply } from "@cryptology.hk/pay-messenger";
import { User, Username } from "@cryptology.hk/pay-user";
import BigNumber from "bignumber.js";

export class Balance {
    /**
     * @dev Retrieve the Balance of a user on an ArkEcosystem blockchain
     * @param user {Username}   The username/platform pair of the user to retrieve the balance for
     * @param token {string}    The token of the ArkEcosystem blockchain to retrieve the balance on
     * @returns {Promise<Reply>} Object containing the formatted reply to send to the user per direct message
     */
    public static async getBalance(user: Username, token: string): Promise<Reply> {
        try {
            const wallet: string = await User.getWalletAddress(user, token);
            const balance: BigNumber = await ArkWallet.getBalance(wallet, token);
            const usdValue: BigNumber = await Currency.baseCurrencyUnitsToUSD(balance, token);
            return Messenger.balanceMessage(balance, usdValue, token);
        } catch (e) {
            return Messenger.errorMessage();
        }
    }
}
