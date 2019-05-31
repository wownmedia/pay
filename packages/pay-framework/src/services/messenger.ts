import BigNumber from "bignumber.js";
import { config } from "../core";
import { Reply, Username } from "./interfaces";
import { Messages } from "./messages";

const ARKTOSHI = new BigNumber(Math.pow(10, 8));
const platforms = config.get("platforms");

export class Messenger {
    /**
     * @dev Generate a HELP message to send to the user who requested HELP
     * @param command {string} The command to provide HELP about
     * @returns {Reply} Object containing help message for sender
     */
    public static helpMessage(command: string): Reply {
        const directMessageSender: string = Messages.helpMessage(command);
        return { directMessageSender };
    }

    /**
     * @dev Generate an error message
     * @returns {Reply} Object containing ERROR message for Sender and to reply to comment
     */
    public static errorMessage(): Reply {
        const directMessageSender: string = Messages.errorMessage();
        const replyComment: string = Messages.errorComment();
        return { directMessageSender, replyComment };
    }

    /**
     * @dev Generate a "I was summoned and have no idea what you want" message
     * @returns {Reply} Object with message to reply to comment
     */
    public static summonedMessage(): Reply {
        const replyComment: string = Messages.summonedComment();
        return { replyComment };
    }

    /**
     * @dev Generate a message that requested transfer amount is below minimum
     * @param token {string} The ArkEcosystem blockchain to generate the message for
     * @returns {Reply} Object with reply to send per direct message for sender and a reply to post to a comment
     */
    public static minAmountMessage(token: string): Reply {
        const directMessageSender: string = Messages.minAmountMessage(token);
        const replyComment: string = Messages.errorComment();
        return { directMessageSender, replyComment };
    }

    /**
     * @dev Generate a message for sender that his balance is too low
     * @param balance {BigNumber}   Balance of the Sender
     * @param amount {BigNumber}    Amount sender requested to transfer
     * @param token {string}        Token of the ArkEcosystem blockchain that is used in the command
     * @param address {string}      Wallet address of the Sender
     * @returns {Reply} Object with reply to send per direct message for sender and a reply to post to a comment
     */
    public static senderLowBalance(balance: BigNumber, amount: BigNumber, token: string, address: string): Reply {
        const directMessageSender: string = Messages.senderLowBalance(balance, amount, token, address);
        const replyComment: string = Messages.errorComment();
        return { directMessageSender, replyComment };
    }

    /**
     * @dev Generate a message with the depositi address of the sender on a platform for a token
     * @param address {string}  Wallet address of the sender
     * @param token {string}    Token of the ArkEcosystem blockchain that is used in the command
     * @param platform          Platform the sender is on (e.g. Reddit)
     * @returns {Reply} Object with reply to send per direct message for sender
     */
    public static depositMessage(address: string, token: string, platform: string): Reply {
        const directMessageSender: string = Messages.depositMessage(address, token, platform);
        return { directMessageSender };
    }

    /**
     * @dev Generate a message for sender with his balance for a token
     * @param balance {BigNumber}   The balance
     * @param usdValue {BigNumber}  The USD value of the balance
     * @param token {string}        Token of the ArkEcosystem blockchain that is used in the command
     * @returns {Reply} Object with reply to send per direct message for sender
     */
    public static balanceMessage(balance: BigNumber, usdValue: BigNumber, token: string): Reply {
        token = token.toUpperCase();
        const currencySymbol: string = token === "ARK" ? "Ѧ" : "";
        const amount: string = this.formatBalance(balance, currencySymbol);
        const usdValueConverted: string = usdValue.toFixed(4).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");
        const directMessageSender: string = Messages.balanceMessage(amount, token, usdValueConverted);
        return { directMessageSender };
    }

    /**
     * @dev Generate a message to reply to a withdraw command
     * @param value {BigNumber}     The value withdrawn
     * @param usdValue {BigNumber}  The USD value of the withdraw
     * @param transactionId         The transaction ID of the transfer transaction
     * @param token {string}        Token of the ArkEcosystem blockchain that is used in the command
     * @returns {Reply} Object with reply to send per direct message for sender
     */
    public static withdrawMessage(value: BigNumber, usdValue: BigNumber, transactionId: string, token: string): Reply {
        token = token.toUpperCase();
        const currencySymbol: string = token === "ARK" ? "Ѧ" : "";
        const amount: string = this.formatBalance(value, currencySymbol);
        const usdValueConverted: string = usdValue.toFixed(4).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");
        const directMessageSender: string = Messages.withdrawMessage(amount, token, usdValueConverted, transactionId);
        return { directMessageSender };
    }

    /**
     * @dev Generate a message to reply to a transfer
     * @param sender {Username}         Sender's username/platform
     * @param receiver {Username}       Receiver's username/platform
     * @param transactionId {string}    The transaction ID of the transfer
     * @param arkToshiValue {BigNumber} The value of the transfer
     * @param usdValue {BigNumber}      The USD value of the transfer
     * @param token {string}            Token of the ArkEcosystem blockchain that is used in the command
     * @param address {string}          The wallet address of the receiver
     * @param smallFooter {boolean}     Whether or not to show a small footter instead of a regular footer
     * @returns {Reply} Object with reply to send per direct message for sender, receiver and a reply to post to a comment
     */
    public static transferMessage(
        sender: Username,
        receiver: Username,
        transactionId: string,
        arkToshiValue: BigNumber,
        usdValue: BigNumber,
        token: string,
        address: string,
        smallFooter: boolean,
    ): Reply {
        token = token.toUpperCase();
        const receiverUsernamePrefix = platforms.hasOwnProperty(receiver.platform)
            ? platforms[receiver.platform].usernamePrefix
            : "";
        const senderUsernamePrefix = platforms.hasOwnProperty(sender.platform)
            ? platforms[sender.platform].usernamePrefix
            : "";
        const currencySymbol: string = token === "ARK" ? "Ѧ" : "";
        const amount: string = this.formatBalance(arkToshiValue, currencySymbol);
        const usdValueConverted: string = usdValue.toFixed(4).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");
        const footer: string = Messages.getFooter(smallFooter);
        let directMessageSender: string = Messages.transferMessage(
            receiverUsernamePrefix + receiver.username,
            receiver.platform,
            transactionId,
            amount,
            usdValueConverted,
            token,
        );
        let directMessageReceiver: string = Messages.transferReceiverMessage(
            senderUsernamePrefix + sender.username,
            sender.platform,
            transactionId,
            amount,
            usdValueConverted,
            token,
            address,
        );
        let replyComment: string = Messages.transferCommentReply(
            receiverUsernamePrefix + receiver.username,
            transactionId,
            amount,
            usdValueConverted,
            token,
        );
        directMessageSender = directMessageSender + footer;
        directMessageReceiver = directMessageReceiver + footer;
        replyComment = replyComment + footer;
        return { directMessageSender, replyComment, directMessageReceiver };
    }

    /**
     * @dev Generate a replay after a Stickers transfer
     * @param sender {Username}         Sender's username/platform
     * @param receiver {Username}       Receiver's username/platform
     * @param transactionId {string}    The transaction ID of the transfer
     * @param amount {BigNumber}        The value of the transfer
     * @param usdValue {BigNumber}      The USD value of the transfer
     * @param token {string}            Token of the ArkEcosystem blockchain that is used in the command
     * @param stickerCode {string}      The generated stickers code
     * @param smallFooter {boolean}     Whether or not to show a small footter instead of a regular footer
     * @returns {Reply} Object with reply to send per direct message for sender, receiver, merchants and a reply to post to a comment
     */
    public static stickersMessage(
        sender: Username,
        receiver: Username,
        transactionId: string,
        amount: BigNumber,
        usdValue: BigNumber,
        token: string,
        stickerCode: string,
        smallFooter: boolean,
    ): Reply {
        const receiverUsernamePrefix = platforms.hasOwnProperty(receiver.platform)
            ? platforms[receiver.platform].usernamePrefix
            : "";
        const formattedAmount: string = this.formatBalance(amount, "Ѧ");
        const usdValueConverted: string = usdValue.toFixed(4).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");
        const footer: string = Messages.getFooter(smallFooter);
        const directMessageSender: string = Messages.stickersMessage(
            receiverUsernamePrefix + receiver.username,
            transactionId,
            formattedAmount,
            usdValueConverted,
        );
        const directMessageReceiver: string = Messages.stickersReceiverMessage(sender.username, stickerCode);
        const directMessageMerchant: string = Messages.stickersMerchantReply(stickerCode, transactionId);
        let replyComment: string = Messages.stickersCommentReply(receiver.username, transactionId);
        replyComment = replyComment + footer;
        return { directMessageSender, replyComment, directMessageReceiver, directMessageMerchant };
    }

    /**
     * @dev  Format inputted balance to a string
     * @param {BigNumber} amount The amount in Arktoshi
     * @param currencySymbol {string} Optional currency symbol (e.g. $, €)
     * @returns {string} String with amount
     * @protected
     */
    protected static formatBalance(amount: BigNumber, currencySymbol?: string): string {
        const balance = amount
            .div(ARKTOSHI)
            .toFixed(8)
            .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");
        if (!currencySymbol) {
            currencySymbol = "";
        }
        return `${currencySymbol}${balance}`;
    }
}
