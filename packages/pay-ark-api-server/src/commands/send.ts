import { Core, Interfaces, Services } from "@cryptology.hk/pay-framework";
import BigNumber from "bignumber.js";
import { APITransferCommand } from "../interfaces";
const apiFeesConfig = Core.config.get("apiFees");
const parserConfig = Core.config.get("parser");
const USERNAME_PLATFORM_SEPARATOR = parserConfig.seperator ? parserConfig.seperator : "@";

export class Send {
    /**
     * @dev Parse a username
     * @param username
     */
    public static parseUsername(username: string): Interfaces.Username {
        // Remove the Reddit user u/ and Twitter @
        const userNameReplace: RegExp = new RegExp("(^@|u/)");
        username = username.replace(userNameReplace, "");

        // Split up the username and platform if any (eg. cryptology@twitter)
        const usernameParts: string[] = username.split(USERNAME_PLATFORM_SEPARATOR);
        if (usernameParts.length === 2) {
            username = usernameParts[0];
            const platform = usernameParts[1];
            return { username, platform };
        }

        if (usernameParts.length === 1) {
            username = usernameParts[0];
            const platform = null;
            return { username, platform };
        }
        return null;
    }
    private readonly sender: string;
    private readonly amount: BigNumber;
    private readonly command: APITransferCommand;
    private readonly commandFee: BigNumber;

    constructor(sender: string, amount: BigNumber, vendorField: APITransferCommand) {
        this.sender = sender;
        this.amount = amount;
        this.command = vendorField;
        this.command.receiverId = this.command.hasOwnProperty("receiverId") ? this.command.receiverId : null;
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

        if (!this.command.hasOwnProperty("receiverId")) {
            throw new Error("Missing receiverId property");
        }
        const receiver: Interfaces.Username = Send.parseUsername(this.command.receiverId);
        if (receiver.platform === null) {
            receiver.platform = platformByWallet;
        }

        if (!this.command.hasOwnProperty("amount")) {
            throw new Error("Missing amount property");
        }
        const amount: BigNumber = new BigNumber(this.command.amount);
        const arkToshiValue: BigNumber = await Services.Currency.Currency.getExchangedValue(amount, this.command.token);
        const transfer: Interfaces.Transfer = {
            sender,
            receiver,
            command: "SEND",
            token: this.command.token,
            arkToshiValue,
        };
        const vendorField: string = `ARK Pay - transfer from ${sender.username}@${sender.platform}`;
        return await Services.Commands.Send.transfer(transfer, vendorField);
    }
}
