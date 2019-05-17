import { Username } from "@cryptology.hk/pay-user";
import BigNumber from "bignumber.js";
import { Messages } from "./messages";

export interface Reply {
    directMessageSender?: string;
    directMessageReceiver?: string;
    directMessageMerchant?: string;
    replyComment?: string;
}

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

    public static transferMessage(
        sender: Username,
        receiver: Username,
        transactionId: string,
        amount: BigNumber,
        usdValue: BigNumber,
        token: string,
        address: string,
        smallFooter: boolean,
    ): Reply {
        token = token.toUpperCase();
        const footer: string = Messages.getFooter(smallFooter);
        const directMessageSender: string = Messages.transferMessage(
            receiver.username,
            receiver.platform,
            transactionId,
            amount.toString(),
            usdValue.toString(),
            token,
        );
        const directMessageReceiver: string = Messages.transferReceiverMessage(
            sender.username,
            sender.platform,
            transactionId,
            amount.toString(),
            usdValue.toString(),
            token,
            address,
        );
        let replyComment: string = Messages.transferCommentReply(
            receiver.username,
            transactionId,
            amount.toString(),
            usdValue.toString(),
            token,
        );
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
        const footer: string = Messages.getFooter(smallFooter);
        const directMessageSender: string = Messages.stickersMessage(
            receiver.username,
            transactionId,
            amount.toString(),
            usdValue.toString(),
        );
        const directMessageReceiver: string = Messages.stickersReceiverMessage(sender.username, stickerCode);
        const directMessageMerchant: string = Messages.stickersMerchantReply(stickerCode, transactionId);
        let replyComment: string = Messages.stickersCommentReply(receiver.username, transactionId);
        replyComment = replyComment + footer;
        return { directMessageSender, replyComment, directMessageReceiver, directMessageMerchant };
    }
}
