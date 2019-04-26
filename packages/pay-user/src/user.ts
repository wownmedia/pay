// import { logger } from "@cryptology.hk/pay-logger";
// import BigNumber from "bignumber.js";
// import Joi from "joi";

export interface Username {
    username: string;
    platform: string;
}

export class User {
    private username: string;
    private platform: string;

    constructor(username: string, platform: string) {
        this.username = username;
        this.platform = platform;
    }

    // noinspection JSMethodCanBeStatic
    public async isValidUser(): Promise<boolean> {
        // TODO
        return true;
    }
}
