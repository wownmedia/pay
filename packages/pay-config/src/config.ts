import { logger } from "@cryptology.hk/pay-logger";
import BigNumber from "bignumber.js";
import findConfig from "find-config";
import os from "os";

let homeDir = os.homedir();
if (process.env.NODE_ENV === "test") {
    homeDir = __dirname.replace("src", "__tests__");
}
const configFile = findConfig("pay-config.json", { dir: `${homeDir}/.config/ark-pay/` });

export interface BaseCurrency {
    ticker: string;
    units: BigNumber;
}

export class Config {
    private readonly configuration: any;

    constructor() {
        try {
            this.configuration = require(configFile);
        } catch (e) {
            logger.error("Bad configuration: " + e.message);
        }
    }

    /**
     * Retrieve a sub-configuration from file
     * @param subConfig
     */
    public get(subConfig: string): any {
        logger.info(homeDir);
        try {
            const config = this.configuration[subConfig];
            logger.info(`config loaded: ${JSON.stringify(config)}`);
            return config ? config : {};
        } catch (e) {
            logger.warn("Could not read configuration!");
            return {};
        }
    }
}

export const config = new Config();
