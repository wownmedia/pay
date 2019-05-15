import { logger } from "@cryptology.hk/pay-logger";
import findConfig from "find-config";
import os from "os";

export class Config {
    public static getConfigFile() {
        // Load a config file from __test__ directories in case we are testing
        let homeDir = os.homedir();
        if (process.env.NODE_ENV === "test") {
            homeDir = __dirname.replace("src", "__tests__");
        }
        return findConfig("pay-config.json", { dir: `${homeDir}/.config/ark-pay/` });
    }
    private readonly configuration: any;

    constructor() {
        try {
            const configFile = Config.getConfigFile();
            this.configuration = require(configFile);
        } catch (e) {
            this.configuration = {};
            logger.warn("pay-config: Bad configuration: " + e.message);
        }
    }

    /**
     * Retrieve a sub-configuration from file
     * @param subConfig
     */
    public get(subConfig: string): any {
        const config = this.configuration[subConfig];
        return config ? config : {};
    }
}

export const config = new Config();
