import { Pool } from "pg";
import { config } from "../core";

export const readConfig = config.get("database");

export const payDatabase = new Pool({
    user: readConfig.dbUser,
    password: readConfig.dbPassword,
    database: readConfig.database,
    host: readConfig.host,
    port: readConfig.port,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
