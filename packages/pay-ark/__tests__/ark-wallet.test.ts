import BigNumber from "bignumber.js";
import "jest-extended";

// Mock Config
import { config } from "@cryptology.hk/pay-config";
const configMock = jest.spyOn(config, "get");
configMock.mockImplementation(() => ({
    encryptionKey: "935bff586aeb4244452802e4cf87eaca",
    ark: {
        networkVersion: 23,
        minValue: 2000000,
        transactionFee: 300,
        vote: {
            voteFee: 157,
            delegate: "cryptology",
            fillWalletFromSeed: "a very secret seed",
            fillWalletValue: 20000,
            fillVendorField: "Welcome to ARK Pay",
        },
        nodes: [
            {
                host: "localhost",
                port: 4003,
            },
        ],
    },
    dark: {
        networkVersion: 30,
        minValue: 2000000,
        transactionFee: 300,
        vote: false,
        nodes: [
            {
                host: "localhost",
                port: 4003,
            },
        ],
    },
}));

// Mock Ark Network
import { Network } from "../src";
const networkMock = jest.spyOn(Network, "broadcastTransactions");
networkMock.mockImplementation(() =>
    Promise.resolve([
        {
            node: {
                host: "localhost",
                port: 4003,
            },
            response: {
                data: {},
                errors: {},
            },
        },
    ]),
);
const getAPIMock = jest.spyOn(Network, "getFromAPI");
getAPIMock.mockImplementation(() =>
    Promise.resolve({
        data: {
            address: "",
            publicKey: "",
            username: null,
            secondPublicKey: null,
            balance: 1,
            isDelegate: false,
            vote: "",
        },
        errors: {},
    }),
);

import { ArkEcosystemWallet, ArkWallet } from "../src/";

describe("pay-ark: ArkWallet()", () => {
    describe("generateWallet()", () => {
        it("should correctly generate an ARK Wallet", () => {
            const networkVersion = 23;
            const token = "ARK";
            const wallet: ArkEcosystemWallet = ArkWallet.generateWallet(token);
            expect(wallet).toContainAllKeys(["address", "encryptedSeed", "networkVersion", "token"]);
            expect(wallet.address).toStartWith("A");
            expect(wallet.networkVersion).toBe(networkVersion);
        });

        it("should correctly generate a DARK Wallet", () => {
            const networkVersion = 30;
            const token = "DARK";
            const wallet: ArkEcosystemWallet = ArkWallet.generateWallet(token);
            expect(wallet).toContainAllKeys(["address", "encryptedSeed", "networkVersion", "token"]);
            expect(wallet.address).toStartWith("D");
            expect(wallet.networkVersion).toBe(networkVersion);
        });
    });

    describe("sendTransaction()", () => {
        it("should correctly create and send a DARK transaction", async () => {
            const networkVersion = 30;
            const token: string = "DARK";
            const sender: ArkEcosystemWallet = {
                address: "D858GWCkiARE79vA3ZkGrz6hv4bbZFVJZJ",
                encryptedSeed:
                    "58d848800dc9d7eb29202cd2898b6a30:f2a38f59563976b061d2df13e1488bc674f4949beffdcfd3fe0cee8c10971db1b2bfbd2ff11a99c7a8e73055966d7e1ce51c85adc27adadfaff627a894b502839276e864529084118fb232d4bb1645b3",
                token,
                networkVersion,
            };
            const amount: BigNumber = new BigNumber(1);
            const vendorField: string = "test";
            const result = await ArkWallet.sendTransaction(sender, sender, amount, vendorField, token);
            expect(result[0]).toContainAllKeys(["node", "response"]);
        });
    });

    describe("getBalance()", () => {
        it("should correctly retrieve a balance for a wallet on a network", async () => {
            const wallet = "AFqavNP6bvyTiS4WcSFaTWnpMCHHYbiguR";
            const token: string = "ARK";
            const result = await ArkWallet.getBalance(wallet, token);
            expect(result).toEqual(new BigNumber(1));
        });
    });
});

configMock.mockClear();
networkMock.mockClear();
getAPIMock.mockClear();
