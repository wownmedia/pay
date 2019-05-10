import { logger } from "@cryptology.hk/pay-logger";
import BigNumber from "bignumber.js";
import findConfig from "find-config";
import os from "os";

let homeDir = os.homedir();

// Load a config file from __test__ directories in case we are testing
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
            logger.warn("pay-config: Bad configuration: " + e.message);
        }
    }

    /**
     * Retrieve a sub-configuration from file
     * @param subConfig
     */
    public get(subConfig: string): any {
        try {
            const config = this.configuration[subConfig];
            return config ? config : {};
        } catch (e) {
            return {};
        }
    }
}

export const config = new Config();
