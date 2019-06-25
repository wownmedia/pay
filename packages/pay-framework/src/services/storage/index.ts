import { Interfaces } from "@arkecosystem/crypto";
import { config, logger, payDatabase } from "../../core";
import { Wallet } from "../../interfaces";
import { Signature } from "../signature";

const serverConfig = config.get("server");

export class Storage {
    public static async getWallet(username: string, platform: string, token: string): Promise<Wallet> {
        token = token.toUpperCase();
        platform = platform.toLowerCase();

        const query = `SELECT * FROM users WHERE username = $1 AND platform = $2 AND token = $3 LIMIT 1`;
        const result = await payDatabase.query(query, [username, platform, token]);
        let user = result.rows[0];

        // User does not exist, try lowercase version of the username (previously users were not stored in Lowercase)
        if (typeof user === "undefined") {
            username = username.toLowerCase();
            const result = await payDatabase.query(query, [username, platform, token]);
            user = result.rows[0];
        }

        if (typeof user === "undefined" || !user.hasOwnProperty("address") || !user.hasOwnProperty("seed")) {
            return null; // no wallet found
        }

        return {
            address: user.address,
            encryptedSeed: user.seed,
        };
    }

    public static async setWallet(username: string, platform: string, token: string, wallet: Wallet): Promise<boolean> {
        token = token.toUpperCase();
        platform = platform.toLowerCase();
        username = username.toLowerCase();

        const sql: string = `INSERT INTO users (username, address, seed, platform, token) VALUES($1, $2, $3, $4, $5) RETURNING *`;
        const values = [username, wallet.address, wallet.encryptedSeed, platform, token];

        const res = await payDatabase.query(sql, values);
        if (typeof res.rows[0] === "undefined") {
            throw new Error(`Could not create user ${username}`);
        }
        return true;
    }

    public static async checkSubmission(submissionId: string): Promise<boolean> {
        submissionId = submissionId.substring(0, 32);
        const query: string = "SELECT * FROM submissions WHERE submission = $1 LIMIT 1";
        const result = await payDatabase.query(query, [submissionId]);
        const submission = result.rows[0];

        // A new submission
        if (typeof submission === "undefined") {
            return false;
        }

        // the Submission exists, check the claim to execute by this server
        if (!serverConfig.hasOwnProperty("seed")) {
            throw new Error("Bad server configuration: No seed.");
        }
        const signedMessage: Interfaces.IMessage = Signature.sign(submissionId, serverConfig.seed);
        return Signature.verify(submissionId, submission.signature, signedMessage.publicKey);
    }

    public static async addSubmission(submissionId: string): Promise<boolean> {
        submissionId = submissionId.substring(0, 32);
        if (!serverConfig.hasOwnProperty("seed")) {
            throw new Error("Bad server configuration: No seed.");
        }
        const signedMessage: Interfaces.IMessage = Signature.sign(submissionId, serverConfig.seed);
        const sql = "INSERT INTO submissions(submission, public_key, signature) VALUES($1, $2, $3) RETURNING *";
        const values = [submissionId, signedMessage.publicKey, signedMessage.signature];

        await payDatabase.query(sql, values);
        logger.info(
            `New submission ${submissionId} has been added to the database for public Key: ${signedMessage.publicKey}.`,
        );
        return true;
    }

    /**
     * @dev Check if a message/mention was not processed before
     * @param submissionId
     * @returns {Promise<boolean>} True if the message was not processed already
     * @public
     */
    public static async isNewSubmission(submissionId: string): Promise<boolean> {
        try {
            // Check if there isn't an entry yet for this submission
            if (await this.checkSubmission(submissionId)) {
                return false;
            }

            // Claim the submission
            if (!(await this.addSubmission(submissionId))) {
                return false;
            }

            // Check if this server's claim is valid
            if (await this.checkSubmission(submissionId)) {
                logger.info(`Claim to Submission ${submissionId} will be executed by this server.`);
                return true;
            }
        } catch (e) {
            // Most likely a DB connection error
            logger.error(e.message);
        }
        return false;
    }
}
