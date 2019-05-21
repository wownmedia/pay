import { ArkEcosystemWallet, ArkWallet, TransactionResponse, WalletBalance } from "@cryptology.hk/pay-ark";
import { config } from "@cryptology.hk/pay-config";
import { Currency } from "@cryptology.hk/pay-currency";
import { logger } from "@cryptology.hk/pay-logger";
import { Messenger, Reply } from "@cryptology.hk/pay-messenger";
import { Storage, Wallet } from "@cryptology.hk/pay-storage";
import { Username } from "@cryptology.hk/pay-user";
import BigNumber from "bignumber.js";
import crypto from "crypto";
import { Transfer } from "../command";
import { Send } from "./send";

const stickersConfig = config.get("merchants").stickers;

export class Stickers extends Send {
    public static async send(sender: Username, receiver: Username): Promise<Reply> {
        try {
            // Prepare the transfer
            const price: BigNumber = this.__getStickersPrice();
            const address: string = this.__getStickersAddress();
            const token: string = this.__getStickersToken();

            // Check if the Sender has sufficient balance
            const senderBalance: WalletBalance = await Send.__senderHasBalance(sender, token, price);
            if (!senderBalance.success) {
                return Messenger.senderLowBalance(senderBalance.balance, price, token, senderBalance.address);
            }

            // Generate the code
            const stickerCode: string = this.__generateCode(sender, receiver);

            // and..... send
            const vendorField: string = "ARK Pay - Stickers!";
            return await this.__sendStickersTransaction(
                sender,
                receiver,
                address,
                token,
                price,
                vendorField,
                stickerCode,
                true,
            );
        } catch (e) {
            logger.warn(e.message);
            return Messenger.errorMessage();
        }
    }

    protected static async __sendStickersTransaction(
        sender: Username,
        receiver: Username,
        address: string,
        token: string,
        price: BigNumber,
        vendorField: string,
        stickerCode: string,
        smallFooter: boolean,
    ): Promise<Reply> {
        const networkVersion: number = ArkWallet.getArkEcosystemNetworkVersionForToken(token);
        const walletSender: Wallet = await Storage.getWallet(sender.username, sender.platform, token);

        const txSender: ArkEcosystemWallet = {
            address: walletSender.address,
            encryptedSeed: walletSender.encryptedSeed,
            networkVersion,
            token,
        };
        const txReceiver: ArkEcosystemWallet = {
            address,
            encryptedSeed: "",
            networkVersion,
            token,
        };
        const response: TransactionResponse[] = await ArkWallet.sendTransaction(
            txSender,
            txReceiver,
            price,
            vendorField,
            token,
        );

        const transactionId: string = this.__processTransaction(response);
        const usdValue: BigNumber = await Currency.baseCurrencyUnitsToUSD(price, token);
        return Messenger.stickersMessage(
            sender,
            receiver,
            transactionId,
            price,
            usdValue,
            token,
            stickerCode,
            smallFooter,
        );
    }

    private static __getStickersPrice(): BigNumber {
        if (!stickersConfig.hasOwnProperty("price")) {
            throw TypeError("Could not find Stickers price in the configuration");
        }

        const price: BigNumber = new BigNumber(stickersConfig.price);

        if (price.isNaN()) {
            throw TypeError("Bad price for Stickers in the configuration");
        }

        return price;
    }

    private static __getStickersAddress(): string {
        if (!stickersConfig.hasOwnProperty("payoutTo")) {
            throw TypeError("Could not find Stickers payoutTo in the configuration");
        }
        // todo: probably check if the address is actually valid and if it is on the right token
        return `${stickersConfig.payoutTo}`;
    }

    private static __getStickersToken(): string {
        if (!stickersConfig.hasOwnProperty("token")) {
            throw TypeError("Could not find Stickers token in the configuration");
        }
        return stickersConfig.token.toUpperCase();
    }

    private static __generateCode(sender: Username, receiver: Username): string {
        const now: string = Date.now().toString();
        const secret: string = sender.username + receiver.username + now;
        const hash: string = crypto
            .createHmac("sha256", secret)
            .update("ArkStickers,com")
            .digest("hex");

        const lastNumber: number = parseInt(now.slice(-1), 10);
        const key = hash.substr(lastNumber, 5);

        return key.toUpperCase();
    }
}
