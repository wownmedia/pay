import { Core, Interfaces, Services } from "@cryptology.hk/pay-framework";
import BigNumber from "bignumber.js";
import { APITransferCommand } from "../interfaces";
import { Send } from "./send";

const apiFeesConfig = Core.config.get("apiFees");

export class Withdraw {
    private readonly sender: string;
    private readonly amount: BigNumber;
    private readonly command: APITransferCommand;
    private readonly commandFee: BigNumber;

    constructor(sender: string, amount: BigNumber, vendorField: APITransferCommand) {
        this.sender = sender;
        this.amount = amount;
        this.command = vendorField;
        this.command.address = this.command.hasOwnProperty("address") ? this.command.address : null;
        this.command.senderId = this.command.hasOwnProperty("senderId") ? this.command.senderId : null;
        this.command.amount = this.command.hasOwnProperty("amount") ? this.command.amount : null;
        this.command.token = this.command.hasOwnProperty("token") ? this.command.token.toUpperCase() : "ARK";
        this.commandFee = apiFeesConfig.hasOwnProperty("command")
            ? new BigNumber(apiFeesConfig.command)
            : new BigNumber(500000);
    }

    public async sendTransaction(): Promise<Interfaces.Reply> {
        if (this.amount.lt(this.commandFee)) {
            throw new Error(`Amount too low, minimal amount: ${this.commandFee}`);
        }

        const platformByWallet: string = await Services.Storage.Storage.getPlatformByWallet(this.sender);
        if (platformByWallet === null) {
            throw new Error("Sender is not registered as platform");
        }

        if (!this.command.hasOwnProperty("senderId")) {
            throw new Error("Missing senderId property");
        }
        const sender: Interfaces.Username = Send.parseUsername(this.command.senderId);
        if (sender.platform === null) {
            sender.platform = platformByWallet;
        }

        if (!this.command.hasOwnProperty("address")) {
            throw new Error("Missing address property");
        }

        if (!this.command.hasOwnProperty("amount")) {
            throw new Error("Missing amount property");
        }
        const amount: BigNumber = new BigNumber(this.command.amount);
        const arkToshiValue: BigNumber = await Services.Currency.Currency.getExchangedValue(amount, this.command.token);
        const transfer: Interfaces.Transfer = {
            sender,
            address: this.command.address,
            command: "WITHDRAW",
            token: this.command.token,
            arkToshiValue,
        };
        return await Services.Commands.Withdraw.transfer(transfer);
    }
}
