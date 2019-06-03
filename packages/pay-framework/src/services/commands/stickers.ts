import BigNumber from "bignumber.js";
import crypto from "crypto";
import { config, logger } from "../../core";
import { ArkEcosystemWallet, Reply, TransactionResponse, Username, Wallet, WalletBalance } from "../../interfaces";
import { ArkWallet } from "../ark-wallet";
import { Currency } from "../currency";
import { Messenger } from "../messenger";
import { Storage } from "../storage";
import { Send } from "./send";

const stickersConfig = config.get("merchants").stickers;

export class Stickers extends Send {
    /**
     * @dev Generate, pay and send Stickers code
     * @param sender {Username}     Sender of the Stickers command
     * @param receiver {Username}   Receiver of the Stickers code
     * @returns {Promise<Reply>} Object with messages for the Sender, Receiver, Merchant and a comment reply message
     */
    public static async send(sender: Username, receiver: Username): Promise<Reply> {
        try {
            // Prepare the transfer
            const price: BigNumber = this.getStickersPrice();
            const address: string = this.getStickersAddress();
            const token: string = this.getStickersToken();

            // Check if the Sender has sufficient balance
            const senderBalance: WalletBalance = await Send.senderHasBalance(sender, token, price);
            if (!senderBalance.success) {
                return Messenger.senderLowBalance(senderBalance.balance, price, token, senderBalance.address);
            }

            // Generate the code
            const stickerCode: string = this.generateCode(sender, receiver);

            // and..... send
            const vendorField: string = "ARK Pay - Stickers!";
            return await this.sendStickersTransaction(
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

    /**
     * @dev Generate and send a transfer from Sender to Merchant
     * @param sender {Username}     The Sender of the command
     * @param receiver {Username}   The receiver of the Stickers code
     * @param address {string}      The wallet address of the merchant
     * @param token {string}        The token of the ArkEcosystem blockchain to send the merchant funds on
     * @param price {BigNumber}     The price of a stickerset in ArkToshi
     * @param vendorField {string}  The vendor field message
     * @param stickerCode {string}  The redeemable sticker code
     * @param smallFooter {boolean} Whether or not to show a small footer in the comment reply
     */
    protected static async sendStickersTransaction(
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

        const transactionId: string = this.processTransaction(response);
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

    /**
     * @dev Retrieve the price of a Stickers set from the config
     * @returns {BigNumber} the price in ArkToshi
     * @private
     */
    private static getStickersPrice(): BigNumber {
        if (!stickersConfig.hasOwnProperty("price")) {
            throw TypeError("Could not find Stickers price in the configuration");
        }

        const price: BigNumber = new BigNumber(stickersConfig.price);

        if (price.isNaN()) {
            throw TypeError("Bad price for Stickers in the configuration");
        }

        return price;
    }

    /**
     * @dev Retrieve the wallet address of the Stickers merchant from the config
     * @returns {string} The wallet address
     * @private
     */
    private static getStickersAddress(): string {
        if (!stickersConfig.hasOwnProperty("payoutTo")) {
            throw TypeError("Could not find Stickers payoutTo in the configuration");
        }
        // todo: probably check if the address is actually valid and if it is on the right token
        return `${stickersConfig.payoutTo}`;
    }

    /**
     * @dev Retreive the token of the ArkEcosystem Blockchain to send the payment transfer on
     * @returns {string}    The token
     * @private
     */
    private static getStickersToken(): string {
        if (!stickersConfig.hasOwnProperty("token")) {
            throw TypeError("Could not find Stickers token in the configuration");
        }
        return stickersConfig.token.toUpperCase();
    }

    /**
     * @dev Generate a redeemable stickers code
     * @param sender {Username}     The Sender
     * @param receiver {Username}   The Receiver
     * @returns {string} A stickers code
     * @private
     */
    private static generateCode(sender: Username, receiver: Username): string {
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
