import crypto, { Cipher, Decipher } from "crypto";
import Joi from "joi";
import { config } from "../../core";
const secureStorageConfig = config.get("secureStorage");

const IV_LENGTH = 16; // For AES, this is always 16
const ALGORITHM = "aes-256-cbc";

const encryptedSeedFormat = new RegExp(/^[a-z\d]{32}[:](?:[a-z\d]{32})+$/);
const encryptionSchema = Joi.object().keys({
    encryptedSeed: Joi.string()
        .regex(encryptedSeedFormat)
        .required(),
    encryptionKey: Joi.string()
        .token()
        .length(32)
        .required(),
});
const decryptionSchema = Joi.object().keys({
    seed: Joi.string().required(),
    encryptionKey: Joi.string()
        .token()
        .length(32)
        .required(),
});

export class SecureStorage {
    public static getSeedFromSecret(encryptedSeed: string): string {
        const encryptionKey: string = secureStorageConfig.encryptionKey;
        const { error } = Joi.validate({ encryptedSeed, encryptionKey }, encryptionSchema);
        if (error) {
            throw TypeError(error.message);
        }

        const textParts: string[] = encryptedSeed.split(":");
        const iv: Buffer = Buffer.from(textParts.shift(), "hex");
        const encryptedText: Buffer = Buffer.from(textParts.join(":"), "hex");
        const decipher: Decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(encryptionKey), iv);
        let decrypted: Buffer = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    }

    public static generateSecretFromSeed(seed: string): string {
        const encryptionKey: string = secureStorageConfig.encryptionKey;
        const { error } = Joi.validate({ seed, encryptionKey }, decryptionSchema);
        if (error) {
            throw TypeError(error.message);
        }

        const iv: Buffer = crypto.randomBytes(IV_LENGTH);
        const cipher: Cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(encryptionKey), iv);
        let encrypted: Buffer = cipher.update(seed);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return iv.toString("hex") + ":" + encrypted.toString("hex");
    }
}
