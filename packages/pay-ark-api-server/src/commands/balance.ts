import { Core, Interfaces, Services } from "@cryptology.hk/pay-framework";
import BigNumber from "bignumber.js";
import { APIInfoCommand } from "../interfaces";
const apiFeesConfig = Core.config.get("apiFees");

export class Balance {
    private readonly sender: string;
    private readonly amount: BigNumber;
    private readonly command: APIInfoCommand;
    private readonly commandFee: BigNumber;

    constructor(sender: string, amount: BigNumber, vendorField: APIInfoCommand) {
        this.sender = sender;
        this.amount = amount;
        this.command = vendorField;
        this.command.token = this.command.hasOwnProperty("token") ? this.command.token.toUpperCase() : "ARK";
        this.commandFee = apiFeesConfig.hasOwnProperty("command")
            ? new BigNumber(apiFeesConfig.command)
            : new BigNumber(500000);
    }

    public async getBalance(): Promise<BigNumber> {
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

        const user: Interfaces.Username = {
            username: this.command.senderId,
            platform: platformByWallet,
        };
        const wallet: string = await Services.User.getWalletAddress(user, this.command.token);
        return await Services.ArkWallet.getBalance(wallet, this.command.token);
    }
}
