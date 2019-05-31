import BigNumber from "bignumber.js";
import "jest-extended";
import { ArkWallet, Balance, Currency, Reply, User, Username } from "../../../src";

describe("pay-commands: Balance()", () => {
    it("getBalance() should be a function", () => {
        expect(Balance.getBalance).toBeFunction();
    });

    describe("getBalance()", () => {
        it("should return a Balance Reply", async () => {
            // Mock User.getWalletAddress()
            const getWalletAddressMock = jest.spyOn(User, "getWalletAddress");
            getWalletAddressMock.mockImplementation(() => Promise.resolve("XXX"));
            // Mock ArkWallet.getBalance()
            const getBalanceMock = jest.spyOn(ArkWallet, "getBalance");
            getBalanceMock.mockImplementation(() => Promise.resolve(new BigNumber(1)));

            // Mock Currency.baseCurrencyUnitsToUSD()
            const baseCurrencyUnitsToUSDMock = jest.spyOn(Currency, "baseCurrencyUnitsToUSD");
            baseCurrencyUnitsToUSDMock.mockImplementation(() => Promise.resolve(new BigNumber(2)));
            const sender: Username = {
                username: "AAA",
                platform: "BBB",
            };
            const token: string = "ZZZ";
            const result: Reply = await Balance.getBalance(sender, token);
            expect(result).toContainAllKeys(["directMessageSender"]);
            getWalletAddressMock.mockRestore();
            getBalanceMock.mockRestore();
            baseCurrencyUnitsToUSDMock.mockRestore();
        });
        it("should return an Error Reply", async () => {
            // Mock User.getWalletAddress()
            const getWalletAddressMock = jest.spyOn(User, "getWalletAddress");
            getWalletAddressMock.mockImplementation(() => Promise.reject("XXX"));
            const sender: Username = {
                username: "AAA",
                platform: "BBB",
            };
            const token: string = "ZZZ";
            const result: Reply = await Balance.getBalance(sender, token);
            expect(result).toContainAllKeys(["directMessageSender", "replyComment"]);
            getWalletAddressMock.mockRestore();
        });
    });
});
