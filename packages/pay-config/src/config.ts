import { logger } from "@cryptology.hk/pay-logger";
import findConfig from "find-config";
import os from "os";

export class Config {
    /**
     * @dev Retrieve the path to the JSON file where the config is stored
     * @returns {any} The path
     */
    public static getConfigFile(): any {
        // Load a config file from __test__ directories in case we are testing
        let homeDir = os.homedir();
        if (process.env.NODE_ENV === "test") {
            homeDir = __dirname.replace("src", "__tests__");
        }
        return findConfig("pay-config.json", { dir: `${homeDir}/.config/ark-pay/` });
    }

    /**
     * @dev Internally stored config JSON
     */
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
     * @dev Retrieve a sub-configuration from file
     * @param subConfig {string}
     * @returns {any} The subconfiguration requested
     */
    public get(subConfig: string): any {
        const config = this.configuration[subConfig];
        return config ? config : {};
    }
}

export const config = new Config();
