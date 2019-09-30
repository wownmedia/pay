import envPaths from "env-paths";
import { logger } from "./logger";

export class Config {
    private configuration: Record<string, any> = {};

    constructor() {
        this.loadFromFile(`${envPaths("ark-pay").config}/pay-config.json`);
    }

    /**
     * @dev Load a configuration from file
     * @param path {string} the full path to the configuration file
     */
    public loadFromFile(path: string): void {
        try {
            this.configuration = require(path);
        } catch (e) {
            logger.warn(`pay-config: Bad configuration file: ${e.message}`);
            throw e;
        }
    }

    /**
     * @dev Retrieve a sub-configuration from file
     * @param subConfig {string}
     * @returns {T} The sub-configuration requested
     */
    public get<T = any>(subConfig: string): T {
        return this.configuration[subConfig];
    }
}

export const config = new Config();
