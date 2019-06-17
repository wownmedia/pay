import BigNumber from "bignumber.js";
import { config } from "../../core";
const arkEcoSytemConfig = config.get("arkEcosystem");

const ARKTOSHI = new BigNumber(Math.pow(10, 8));

export class Messages {
    /**
     * @dev Generate a HELP message
     * @param command
     * @param short
     */
    public static helpMessage(command: string, short?: boolean): string {
        switch (command.toUpperCase()) {
            case "WITHDRAW":
                return _HELP_WITHDRAW;
            case "TIP":
                return _HELP_TIP;
            case "SEND":
                return _HELP_SEND;
            case "STICKERS":
                return _HELP_STICKERS;
            case "HELP":
            default:
                return short ? _HELP_SHORT : _HELP;
        }
    }

    /**
     * @dev  Retrieve the explorer for a blockchain from config
     * @param token
     */
    public static getExplorer(token: string): string {
        token = token.toLowerCase();
        if (arkEcoSytemConfig.hasOwnProperty(token) && arkEcoSytemConfig[token].hasOwnProperty("explorer")) {
            return arkEcoSytemConfig[token].explorer;
        }
        return _EXPLORER;
    }

    /**
     * @dev generate an error message
     */
    public static errorMessage(): string {
        return _ERROR_MESSAGE;
    }

    /**
     * @dev generate an error comment reply
     */
    public static errorComment(): string {
        return _ERROR_COMMENT;
    }

    /**
     * @dev generate a summoned message
     */
    public static summonedComment(): string {
        return _SUMMONED_COMMENT;
    }

    /**
     * @dev generate a footer
     * @param small
     */
    public static getFooter(small?: boolean): string {
        if (small) {
            return _SMALL_FOOTER;
        }
        return _FOOTER;
    }

    /**
     * @dev generate a minimum amount message
     * @param token
     */
    public static minAmountMessage(token: string): string {
        token = token.toLowerCase();
        let amount: BigNumber = new BigNumber(1);
        if (arkEcoSytemConfig.hasOwnProperty(token) && arkEcoSytemConfig[token].hasOwnProperty("minValue")) {
            amount = new BigNumber(arkEcoSytemConfig[token].minValue);
        }
        const lowestValue = `${amount.div(ARKTOSHI).toNumber()} ${token.toUpperCase()}`;
        return Messages.replaceAll(_MINIMAL_TRANSACTION_VALUE, "#minValue#", lowestValue);
    }

    /**
     * @dev generate a too low balance message
     * @param balance
     * @param amount
     * @param token
     * @param address
     */
    public static senderLowBalance(balance: BigNumber, amount: BigNumber, token: string, address: string): string {
        const amountString = `${amount.div(ARKTOSHI).toFixed(8)} ${token.toUpperCase()}`;
        const balanceString = `${balance.div(ARKTOSHI).toFixed(8)} ${token.toUpperCase()}`;

        const lowBalanceMessage = Messages.replaceAll(_SEND_NO_BALANCE_MESSAGE, "#token#", token);
        return lowBalanceMessage
            .replace("#balance#", balanceString)
            .replace("#amount#", amountString)
            .replace("#address#", address);
    }

    /**
     * @dev generate a deposit message
     * @param address
     * @param token
     * @param platform
     */
    public static depositMessage(address: string, token: string, platform: string): string {
        const message = Messages.replaceAll(_DEPOSIT_MESSAGE, "#token#", token);
        return message.replace("#platform#", platform).replace("#address#", address);
    }

    /**
     * @dev generate a transfer message
     * @param receiver
     * @param platform
     * @param transactionId
     * @param amount
     * @param usdValue
     * @param token
     */
    public static transferMessage(
        receiver: string,
        platform: string,
        transactionId: string,
        amount: string,
        usdValue: string,
        token: string,
    ): string {
        const explorer: string = this.getExplorer(token);
        token = token.toUpperCase();
        const message = Messages.replaceAll(_TRANSACTION_MESSAGE, "#token#", token);
        return message
            .replace("#receiver#", receiver)
            .replace("#platform#", platform)
            .replace("#amount#", amount)
            .replace("#usdValue#", usdValue)
            .replace("#transactionId#", transactionId)
            .replace("#explorer#", explorer);
    }

    /**
     * @dev generate a message for the receiver of a transfer
     * @param username
     * @param platform
     * @param transactionId
     * @param amount
     * @param usdValue
     * @param token
     * @param address
     */
    public static transferReceiverMessage(
        username: string,
        platform: string,
        transactionId: string,
        amount: string,
        usdValue: string,
        token: string,
        address: string,
    ): string {
        const explorer: string = this.getExplorer(token);
        token = token.toUpperCase();
        const message: string = this.replaceAll(_TRANSACTION_RECEIVE_MESSAGE, "#token#", token);
        return message
            .replace("#username#", username)
            .replace("#platform#", platform)
            .replace("#amount#", amount)
            .replace("#usdValue#", usdValue)
            .replace("#transactionId#", transactionId)
            .replace("#address#", address)
            .replace("#explorer#", explorer);
    }

    /**
     * @dev generate a TIP comment reply
     * @param username
     * @param transactionId
     * @param amount
     * @param usdValue
     * @param token
     */
    public static transferCommentReply(
        username: string,
        transactionId: string,
        amount: string,
        usdValue: string,
        token: string,
    ) {
        const explorer: string = this.getExplorer(token);
        token = token.toUpperCase();
        const message: string = this.replaceAll(_TIP_NOTIFICATION, "#token#", token);
        return message
            .replace("#username#", username)
            .replace("#amount#", amount)
            .replace("#usdValue#", usdValue)
            .replace("#transactionId#", transactionId)
            .replace("#explorer#", explorer);
    }

    /**
     * @dev generate a comment reply to a STICKERS mention
     * @param username
     * @param transactionId
     */
    public static stickersCommentReply(username: string, transactionId: string): string {
        return _STICKERS_NOTIFICATION.replace("#username#", username).replace("#transactionId#", transactionId);
    }

    /**
     * @dev generate a message reply to the seller of Stickers
     * @param stickerCode
     * @param transactionId
     */
    public static stickersMerchantReply(stickerCode: string, transactionId: string): string {
        return _STICKERS_CODE_NEWCODE.replace("#stickerCode#", stickerCode).replace("#transactionId#", transactionId);
    }

    /**
     * @dev generate a message to the sender of Stickers
     * @param receiver
     * @param transactionId
     * @param amount
     * @param usdValue
     */
    public static stickersMessage(receiver: string, transactionId: string, amount: string, usdValue: string): string {
        return _TRANSACTION_STICKERS_MESSAGE
            .replace("#receiver#", receiver)
            .replace("#amount#", amount)
            .replace("#usdValue#", usdValue)
            .replace("#transactionId#", transactionId);
    }

    /**
     * @dev generate a message to the receiver of stickers
     * @param sender
     * @param stickerCode
     */
    public static stickersReceiverMessage(sender: string, stickerCode: string): string {
        const message = this.replaceAll(_STICKERS_CODE_MESSAGE, "#sender#", sender);
        return message.replace("#stickerCode#", stickerCode);
    }

    /**
     * @dev generate a message to show balance
     * @param balance
     * @param token
     * @param usdValue
     */
    public static balanceMessage(balance: string, token: string, usdValue: string): string {
        const balanceMessage = Messages.replaceAll(_BALANCE_MESSAGE, "#token#", token);
        return balanceMessage.replace("#balance#", balance).replace("#usdValue#", usdValue);
    }

    /**
     * @dev generate a withdraw message
     * @param balance
     * @param token
     * @param usdValue
     * @param transactionId
     */
    public static withdrawMessage(balance: string, token: string, usdValue: string, transactionId: string): string {
        const explorer: string = this.getExplorer(token);
        token = token.toUpperCase();
        const withdrawMessage: string = Messages.replaceAll(_WITHDRAW_MESSAGE, "#token#", token);
        return withdrawMessage
            .replace("#amount#", balance)
            .replace("#usdValue#", usdValue)
            .replace("#transactionId#", transactionId)
            .replace("#explorer#", explorer);
    }

    /**
     * @dev replace all occurences
     * @param target
     * @param search
     * @param replacement
     * @protected
     */
    protected static replaceAll(target: string, search: string, replacement: string): string {
        return target.split(search).join(replacement);
    }
}

const _EXPLORER = "https://explorer.ark.io";

const _FOOTER =
    " \n\n --- \n\n " +
    "[Use ArkTippr](https://arktippr.com) | [FAQ](https://np.reddit.com/r/arktippr/wiki/faq) | [Ark.io](https://ark.io) | [Explore Ark](https://arkdirectory.com/) | [Terms of Use](https://np.reddit.com/r/arktippr/wiki/terms) | [r/arktippr](https://np.reddit.com/r/arktippr) \n\n " +
    "Ark provides users, developers, and startups with innovative blockchain technologies. Point. Click. Blockchain.";

const _SMALL_FOOTER = " \n\n " + "https://arktippr.com | https://ark.io";

const _SUMMONED_COMMENT =
    "ArkTippr tipbot here- I have been summoned, but I'm having trouble understanding what to do. " +
    "I do enjoy a zero before a decimal if that's the issue!";

const _ERROR_MESSAGE = "\n\n " + "Sorry, something went wrong executing your command. Please try again later.\n\n ";

const _WITHDRAW_MESSAGE =
    "\n\n " +
    "You withdrew funds from your wallet successfully! \n\n " +
    "#amount# #token# ($#usdValue# USD) was transferred out of your #token# wallet.\n\n " +
    "Check this transaction on the #token# blockchain: #explorer#/transaction/#transactionId#\n\n ";

const _BALANCE_MESSAGE =
    "\n\n " +
    "Your ArkTippr #token# wallet balance is: #balance# #token# ($#usdValue# USD).\n\n " +
    "For instructions on how to withdraw #token# from your ArkTippr wallet to a different #token# address, reply ` WITHDRAW #token# `.\n\n ";

const _MINIMAL_TRANSACTION_VALUE =
    "\n\n " +
    "You tried to execute a transaction below the minimum amount, #minValue#.\n\n " +
    "Please try again, with an amount of #minValue# or higher. Cheers!\n\n ";

const _ERROR_COMMENT =
    "ArkTippr here- not to get awkward, but this user can't execute that transaction right now..." +
    "for reasons.  Perhaps they will try again soon!\n\n ";

const _SEND_NO_BALANCE_MESSAGE =
    "\n\n " +
    "Unfortunately, your #token# wallet does not have a sufficient balance for this transaction.\n\n " +
    "You tried to send #amount# but your wallet only contains #balance#. " +
    "Perhaps the transaction failed due to not accounting for the network transaction fee.\n\n " +
    "Your #token# wallet address is ` #address# ` \n\n " +
    "Add #token# to your balance at that address and retry.\n\n " +
    "Thank you!\n\n ";

const _DEPOSIT_MESSAGE =
    "\n\n " +
    "Your #token# address is:\n\n " +
    "**#address#**\n\n " +
    "Every #platform# user has their own unique #token# wallet address, and this one is yours!\n\n " +
    "Add to your #token# wallet balance by sending #token# to this address.\n\n " +
    "You can also add this address to any official #token# wallet in Watch-Only mode, to track your balance.\n\n ";

const _TRANSACTION_MESSAGE =
    "\n\n " +
    "Your #token# transaction to #receiver# on #platform# was successful!\n\n " +
    "You sent #amount# #token# ($#usdValue# USD) from your ArkTippr wallet.\n\n " +
    "Check this transaction on the #token# blockchain: #explorer#/transaction/#transactionId#\n\n ";

const _TRANSACTION_RECEIVE_MESSAGE =
    "\n\n " +
    "User #username# on #platform# has sent you `#amount# #token# ($#usdValue# USD)` directly via ArkTippr!\n\n " +
    "For reference, your personal #token# wallet address is `#address#`\n\n " +
    "For assistance withdrawing this #token# to a different wallet, reply ` WITHDRAW #token# ` or visit the " +
    "[Usage page of the ArkTippr Wiki](https://np.reddit.com/r/arktippr/wiki/usage)\n\n " +
    "[Check this transaction on the #token# blockchain](#explorer#/transaction/#transactionId#)\n\n ";

const _TIP_NOTIFICATION =
    "#username# you have received `#amount# #token# ($#usdValue# USD)`! " +
    "Check on #token# blockchain: #explorer#/transaction/#transactionId#. ";

const _STICKERS_NOTIFICATION =
    "#username#. You have received a free ArkStickers sticker set!\n\n " +
    "ArkTippr has sent you a private message with a code to redeem on [ArkStickers.com](https://arkstickers.com).\n\n " +
    "[Check this transaction on the Ark blockchain](https://explorer.ark.io/transaction/#transactionId#)\n\n ";

const _TRANSACTION_STICKERS_MESSAGE =
    "\n\n " +
    "Thank you! ArkTippr has successfully sent an ArkStickers code to the private messages of #receiver#. " +
    "They know it came from you- your generosity levels are over nine thousand! \n\n " +
    "ArkTippr successfully transferred #amount# ARK ($#usdValue# USD) from your ArkTippr wallet to the " +
    "ArkStickers Ark address.\n\n " +
    "[Check this transaction on the Ark blockchain](https://explorer.ark.io/transaction/#transactionId#)\n\n ";

const _STICKERS_CODE_MESSAGE =
    "\n\n " +
    "**Congratulations!** #sender# has paid for you to receive a **FREE** ArkStickers sticker set.\n\n " +
    "Go to [ArkStickers.com](https://arkstickers.com) and use this 1-time code: **#stickerCode#**\n\n " +
    "You do not need to have Ark or execute a transaction to claim the free stickers.\n\n " +
    "#sender# has taken care of everything for you, and you do not need to pay or do anything other than " +
    "receive the stickers.\n\n " +
    "Stickers are delivered all around the world. Cheers and enjoy!\n\n ";

const _STICKERS_CODE_NEWCODE =
    "\n\n " +
    "A new code has been generated: **#stickerCode#**\n\n " +
    "Please check the transaction below to confirm you have received the funds.\n\n " +
    "[Check this transaction on the Ark blockchain](https://explorer.ark.io/transaction/#transactionId#)\n\n ";

const _HELP =
    "\n\n " +
    "Send me a direct message containing one (or more) of the following commands:\n\n " +
    "**BALANCE** - To see your ArkTippr wallet balance\n\n " +
    "**DEPOSIT** or **ADDRESS** - To receive instructions on how to add to your balance\n\n " +
    "**WITHDRAW** - To receive instructions on how to withdraw funds to a different Ark wallet\n\n " +
    "**TIP** - To receive instructions on how to publicly tip a user\n\n " +
    "**SEND** - To receive instructions on how to non-publicly send Ark to a user\n\n " +
    "**STICKERS** - To receive instructions on how to give a Reddit user an ArkStickers.com sticker code\n\n " +
    "[You can also visit the Usage page of the ArkTippr Wiki](https://np.reddit.com/r/arktippr/wiki/usage)\n\n ";

const _HELP_SHORT =
    "\n\n " +
    "Send me a direct message containing one (or more) of the following commands:\n\n " +
    "BALANCE - To see your ArkTippr wallet balance\n\n " +
    "DEPOSIT or ADDRESS - To receive instructions on how to add to your balance\n\n " +
    "WITHDRAW - To receive instructions on how to withdraw funds to a different Ark wallet\n\n " +
    "TIP - To receive instructions on how to publicly tip a user\n\n " +
    "SEND - To receive instructions on how to non-publicly send Ark to a user\n\n ";

const _HELP_WITHDRAW =
    "\n\n " +
    "You can withdraw all the Ark in your ArkTippr wallet to a different wallet:\n\n " +
    "**To withdraw the total balance:** \n\n " +
    "    WITHDRAW [token] <address> \n\n " +
    "You can also withdraw only some of the Ark in your ArkTippr wallet to a different wallet:\n\n " +
    "**To withdraw a partial balance:** \n\n " +
    "    WITHDRAW [token] <address> [amount] [currency] \n\n " +
    "`[token]` is the Ark Ecosystem token that you like to withdraw (e.g. ARK, XQR). If no token is declared, Ark is the default. \n\n " +
    "`<address>` should be a **valid wallet that you control**. WITHDRAW is irreversible so make sure the address is correct.\n\n " +
    "`[amount]` is the amount you like to withdraw *(e.g. 10, 1.5)* \n\n " +
    "`[currency]` is one of the [supported currencies](https://np.reddit.com/r/arktippr/wiki/usage#wiki_supported_currencies) " +
    "If no currency is declared, Ark is the default. \n\n ";

const _HELP_TIP =
    "\n\n " +
    "To tip a user as a reward for good content, simply reply to the specific comment or post with: \n\n " +
    "    <amount> [currency] u/arktippr\n\n " +
    "This will transfer the `<amount> [currency]` converted to Ark from your ArkTippr Ark wallet to theirs - on-chain!\n\n " +
    "If the other user did not set up an ArkTippr Ark wallet yet, it still works. The Ark is waiting for them on the blockchain!\n\n " +
    "`<amount>` is the amount you like to tip *(e.g. 10, 1.5)*\n\n " +
    "`[currency]` is one of the [supported currencies](https://np.reddit.com/r/arktippr/wiki/usage#wiki_supported_currencies). " +
    "If no currency is declared, Ark is the default. \n\n " +
    "`[~]` enables a smaller footer on the public reply ArkTippr posts on a tip comment. \n\n ";

const _HELP_SEND =
    "\n\n " +
    "Sometimes, you will want to send Ark to another user privately, without a public comment that everyone can see. " +
    "This is accomplished with the SEND command. It's more anonymous than Venmo, and more fun than Paypal :)\n\n " +
    "To transfer Ark to a user privately, send ArkTippr a private message like this:\n\n " +
    "    SEND <username> <amount> [currency]\n\n " +
    "`<username>` should be a **valid user**\n\n " +
    "`<amount>` is the amount you like to send *(e.g. 10, 1.5)*\n\n " +
    "`[currency]` is one of the [supported currencies](https://np.reddit.com/r/arktippr/wiki/usage#wiki_supported_currencies). " +
    "If no currency is declared, Ark is the default.\n\n ";

const _HELP_STICKERS =
    "\n\n " +
    "[ArkStickers](https://ArkStickers.com) has created a great set of stickers and Ark info sheet that can be used to promote Ark technology.\n\n " +
    "When you use the STICKERS command, you will give that user (or yourself) a code redeemable at ArkStickers.com for a sticker set, and it never expires!\n\n " +
    "There are two ways to accomplish this:\n\n " +
    "**1) Publicly reply to a comment or post** \n\n " +
    "To send a user an ArkStickers sticker code, comment on their post or reply to their comment with:\n\n " +
    "    STICKERS u/arktippr\n\n " +
    "This will do the following:\n\n " +
    "1 Send Ѧ2 ARK from your balance to ArkStickers.com Ark wallet\n\n " +
    "2 Generate an ArkStickers stickers code\n\n " +
    "3 Send the code privately to the user in question via private message.\n\n " +
    "They will receive a code that you paid for in their messages Inbox, and they can use their code on ArkStickers.com to get their stickers for free " +
    "(no Ark transaction required for them).\n\n " +
    "Everyone on Reddit will see that you gave them stickers!\n\n " +
    "Sticker codes can only be used one time.\n\n " +
    "**2) Send ArkTippr a Private Message** \n\n " +
    "You can also do this by sending ArkTippr a private message with the command:\n\n " +
    "    STICKERS <username>\n\n " +
    "This will do the following:\n\n " +
    "1 Send Ѧ2 ARK from your balance to ArkStickers.com Ark wallet\n\n " +
    "2 Generate an ArkStickers stickers code\n\n " +
    "3 Send the code privately to the user in question via private message.\n\n " +
    "*(This method allows you to get a code sent to yourself if you want to.)* \n\n " +
    "They will receive a code that you paid for in their messages Inbox, and they can use their code on ArkStickers.com to get their stickers for free " +
    "(no Ark transaction required for them).\n\n " +
    "This method does not use public comments, so no one will see that you gave them stickers.\n\n " +
    "Sticker codes can only be used one time.\n\n" +
    "**Did You Know?** You can use STICKERS for any Reddit user on any Subreddit- you are not confined to Ark's Subreddit!\n\n ";
