import { logger } from "@cryptology.hk/pay-logger";
import envPaths from "env-paths";

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

    public get<T = any>(subConfig: string): T {
        return this.configuration[subConfig];
    }
}

export const config = new Config();
