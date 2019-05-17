import { Username } from "@cryptology.hk/pay-user";
import BigNumber from "bignumber.js";
import { CommandResult, Transaction } from "../command";

export class BaseCommand {
    private static __amountLargerThanMinimum(amount: BigNumber): boolean {
        return true;
    }
    private readonly sender: Username;
    private readonly receiver: Username;
    private readonly amount: BigNumber;

    constructor(sender?: Username, receiver?: Username, amount?: BigNumber) {
        if (sender) {
            this.sender = sender;
        }

        if (receiver) {
            this.receiver = receiver;
        }

        if (amount) {
            this.amount = amount;
        }
    }

    public async sendTransaction(): Promise<CommandResult> {
        if (!this.sender || !this.receiver || !this.amount) {
            return null;
        }

        const transactionId: string = "";
        const transaction = {
            sender: this.sender,
            receiver: this.receiver,
            transactionId,
            arkToshiValue: this.amount,
            currency: "ARK",
        };
        return {
            command: "SEND",
            success: true,
            sender: this.sender,
            transaction,
        };
    }

    private async __senderHasBalance(): Promise<boolean> {
        return true;
    }

    private __sendingToSelf() {
        if (this.sender.username === this.receiver.username && this.sender.platform === this.receiver.platform) {
            throw new Error(`${this.sender.username} is trying to send tip to self on ${this.sender.platform}.`);
        }
        return false;
    }
}
