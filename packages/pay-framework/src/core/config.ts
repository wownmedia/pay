import envPaths from "env-paths";
import { logger } from "./logger";

export class Config {
    private configuration: Record<string, any> = {};

    constructor() {
        this.loadFromFile(`${envPaths("ark-pay").config}/pay-config.json`);
    }

    public loadFromFile(path: string): void {
        try {
            this.configuration = require(path);
        } catch (e) {
            logger.warn(`pay-config: Bad configuration: ${e.message}`);
        }
    }

    /**
     * @dev Retrieve a sub-configuration from file
     * @param subConfig {string}
     * @returns {T} The subconfiguration requested
     */
    public get<T = any>(subConfig: string): T {
        return this.configuration[subConfig];
    }
}

export const config = new Config();
