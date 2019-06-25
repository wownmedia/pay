import { Crypto, Interfaces } from "@arkecosystem/crypto";

export class Signature {
    public static sign(message: string, passphrase: string): Interfaces.IMessage {
        return Crypto.Message.sign(message, passphrase);
    }

    public static verify(message: string, signature: string, publicKey: string): boolean {
        return Crypto.Message.verify({ message, publicKey, signature });
    }
}
