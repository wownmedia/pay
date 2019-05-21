import { config } from "@cryptology.hk/pay-config";
import "jest-extended";

// Mock Config
const configMock = jest.spyOn(config, "get");
configMock.mockImplementation(() => ({
    dbUser: "XXX",
    dbPassword: "YYY",
    database: "AAA",
    host: "BBB",
    port: 111,
}));

// mock database
import { payDatabase } from "../src/database";

describe("payDatabase", () => {
    it("should be an object", () => {
        expect(payDatabase).toBeObject();
    });
});
configMock.mockRestore();
