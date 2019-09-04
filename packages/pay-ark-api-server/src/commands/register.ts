import { Core, Services } from "@cryptology.hk/pay-framework";
import BigNumber from "bignumber.js";
import { CommonPlatforms } from "../enums";
import { APIRegisterCommand, APITransferReply } from "../interfaces";
const apiFeesConfig = Core.config.get("apiFees");

export class Register {
    private readonly amount: BigNumber;
    private readonly transactionId: string;
    private readonly command: APIRegisterCommand;
    private readonly registrationFee: BigNumber;

    constructor(amount: BigNumber, transactionId: string, vendorField: APIRegisterCommand) {
        this.amount = amount;
        this.transactionId = transactionId;
        this.command = vendorField;
        this.command.platform = this.command.platform.toLowerCase();
        this.registrationFee = apiFeesConfig.hasOwnProperty("registration")
            ? new BigNumber(apiFeesConfig.registration)
            : new BigNumber(2500000000);
    }

    public async registrate(): Promise<void> {
        if (this.amount.lt(this.registrationFee)) {
            throw new Error(`Amount too low, minimal amount: ${this.registrationFee}`);
        }

        if (!this.command.platform || this.command.platform in CommonPlatforms) {
            throw new Error("Invalid Platform");
        }

        const platformWallet: string = await Services.Storage.Storage.getPlatform(this.command.platform);
        if (platformWallet != null) {
            throw new Error("Platform is already registered");
        }

        const platformByWallet: string = await Services.Storage.Storage.getPlatformByWallet(platformWallet);
        if (platformByWallet != null) {
            throw new Error("Wallet is already registered");
        }

        const successfulRegistration: boolean = await Services.Storage.Storage.addPlatform(
            this.command.platform,
            platformByWallet,
        );
        if (!successfulRegistration) {
            throw new Error("Could not register platform");
        }
    }
}
