import "jest-extended";

// Mock Config
import { config } from "@cryptology.hk/pay-config";
const configMock = jest.spyOn(config, "get");
configMock.mockImplementation(() => ({
    encryptionKey: "935bff586aeb4244452802e4cf87eaca",
}));
import { SecureStorage } from "../src/";

describe("pay-storage: SecureStorage()", () => {
    const encryptedSeed =
        "27c34353550c64eefbc4b37382f3169c:5571c7d251f1bf5955bbece92dc8306327205b97d8827b1ae21a707e9c6632d7";
    const seed = "this is a top secret passphrase";
    describe("generateSecretFromSeed()", () => {
        it("should correctly generate an encrypted seed", () => {
            const result = SecureStorage.generateSecretFromSeed(seed);
            const confirmation = SecureStorage.getSeedFromSecret(result);
            expect(seed).toEqual(confirmation);
        });

        it("should throw a TypeError on a bad configuration/input", () => {
            const badSeed = "";
            expect(() => {
                SecureStorage.generateSecretFromSeed(badSeed);
            }).toThrowError(TypeError);
        });
    });

    describe("getSeedFromSecret()", () => {
        it("should correctly decrypt an encrypted seed", () => {
            const result = SecureStorage.getSeedFromSecret(encryptedSeed);
            expect(result).toEqual(seed);
        });

        it("should throw a TypeError on a bad configuration/input", () => {
            let badEncryptedSeed: string =
                "not32chars:5571c7d251f1bf5955bbece92dc8306327205b97d8827b1ae21a707e9c6632d7";
            expect(() => {
                SecureStorage.getSeedFromSecret(badEncryptedSeed);
            }).toThrowError(TypeError);
            badEncryptedSeed = "27c34353550c64eefbc4b37382f3169c:";
            expect(() => {
                SecureStorage.getSeedFromSecret(badEncryptedSeed);
            }).toThrowError(TypeError);
            badEncryptedSeed =
                "27c34353550c64eefbc4b37382f3169c;5571c7d251f1bf5955bbece92dc8306327205b97d8827b1ae21a707e9c6632d7";
            expect(() => {
                SecureStorage.getSeedFromSecret(badEncryptedSeed);
            }).toThrowError(TypeError);
            badEncryptedSeed = "27c34353550c64eefbc4b37382f3169c:notdivisibleby32chars";
            expect(() => {
                SecureStorage.getSeedFromSecret(badEncryptedSeed);
            }).toThrowError(TypeError);
        });
    });
});
configMock.mockClear();
