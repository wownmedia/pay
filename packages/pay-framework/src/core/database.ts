import { Pool } from "pg";
import { config } from "../core";

export const readConfig = config.get("database");

export const payDatabase = new Pool({
    user: readConfig.hasOwnProperty("dbUser") ? readConfig.dbUser : "arkpay",
    password: readConfig.hasOwnProperty("dbPassword") ? readConfig.dbPassword : "password",
    database: readConfig.hasOwnProperty("database") ? readConfig.database : "arkpay",
    host: readConfig.hasOwnProperty("host") ? readConfig.host : "localhost",
    port: readConfig.hasOwnProperty("port") ? readConfig.port : 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
