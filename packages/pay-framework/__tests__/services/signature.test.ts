import { Interfaces } from "@arkecosystem/crypto";
import "jest-extended";
import { Signature } from "../../src/services";

describe("Signature", () => {
    const message = "Hello World";
    const passphrase = "this is a top secret passphrase";
    const publicKey = "034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192";
    const signature =
        "304402200fb4adddd1f1d652b544ea6ab62828a0a65b712ed447e2538db0caebfa68929e02205ecb2e1c63b29879c2ecf1255db506d671c8b3fa6017f67cfd1bf07e6edd1cc8";
    describe("sign()", () => {
        it("should correctly sign a message with a passphrase", () => {
            const result: Interfaces.IMessage = Signature.sign(message, passphrase);
            expect(result.publicKey).toEqual(publicKey);
            expect(result.signature).toEqual(signature);
        });
    });

    describe("verify()", () => {
        it("should correctly verify a signature for a message", () => {
            const result: boolean = Signature.verify(message, signature, publicKey);
            expect(result).toBeTrue();
        });

        it("should correctly discard a bad public key for a message", () => {
            const badPublicKey: string = "03364c62f7c5a7948dcaacdc72bac595e8f6e79944e722d05c8346d68aa1331b4a";
            const result: boolean = Signature.verify(message, signature, badPublicKey);
            expect(result).toBeFalse();
        });
    });
});
