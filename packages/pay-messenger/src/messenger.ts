import { config } from "@cryptology.hk/pay-config";
import { Username } from "@cryptology.hk/pay-user";
import BigNumber from "bignumber.js";
import { Reply } from "./interfaces";
import { Messages } from "./messages";

const ARKTOSHI = new BigNumber(Math.pow(10, 8));
const platforms = config.get("platforms");

export class Messenger {
    public static helpMessage(command: string): Reply {
        const directMessageSender: string = Messages.helpMessage(command);
        return { directMessageSender };
    }

    public static errorMessage(): Reply {
        const directMessageSender: string = Messages.errorMessage();
        const replyComment: string = Messages.errorComment();
        return { directMessageSender, replyComment };
    }

    public static summonedMessage(): Reply {
        const replyComment: string = Messages.summonedComment();
        return { replyComment };
    }

    public static minAmountMessage(token: string): Reply {
        const directMessageSender: string = Messages.minAmountMessage(token);
        const replyComment: string = Messages.errorComment();
        return { directMessageSender, replyComment };
    }

    public static senderLowBalance(balance: BigNumber, amount: BigNumber, token: string, address: string): Reply {
        const directMessageSender: string = Messages.senderLowBalance(balance, amount, token, address);
        const replyComment: string = Messages.errorComment();
        return { directMessageSender, replyComment };
    }

    public static depositMessage(address: string, token: string, platform: string): Reply {
        const directMessageSender: string = Messages.depositMessage(address, token, platform);
        return { directMessageSender };
    }

    public static balanceMessage(balance: BigNumber, usdValue: BigNumber, token: string): Reply {
        token = token.toUpperCase();
        const currencySymbol: string = token === "ARK" ? "Ѧ" : "";
        const amount: string = this.__formatBalance(balance, currencySymbol);
        const usdValueConverted: string = usdValue.toFixed(4).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");
        const directMessageSender: string = Messages.balanceMessage(amount, token, usdValueConverted);
        return { directMessageSender };
    }

    public static withdrawMessage(value: BigNumber, usdValue: BigNumber, transactionId: string, token: string): Reply {
        token = token.toUpperCase();
        const currencySymbol: string = token === "ARK" ? "Ѧ" : "";
        const amount: string = this.__formatBalance(value, currencySymbol);
        const usdValueConverted: string = usdValue.toFixed(4).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1");
        const directMessageSender: string = Messages.withdrawMessage(amount, token, usdValueConverted, transactionId);
        return { directMessageSender };
    }

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
        const amount: string = this.__formatBalance(arkToshiValue, currencySymbol);
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
        const formattedAmount: string = this.__formatBalance(amount, "Ѧ");
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
     * @param currencySymbol
     * @returns  String with amount
     */
    protected static __formatBalance(amount: BigNumber, currencySymbol?: string): string {
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
