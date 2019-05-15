import "jest-extended";
import { config, Config } from "../src";

describe("pay-currency: Config()", () => {
    describe("get()", () => {
        it("should correctly parse and load the config test file", () => {
            const subConfig: string = "pay-config";
            const result = config.get(subConfig);
            expect(result).toContainAllKeys(["test"]);
            expect(result.test).toEqual("cryptology");
        });

        it("should return an empty object if the sub-config is not found", () => {
            const subConfig: string = "notavalidsubconfig";
            const result = config.get(subConfig);
            expect(result).toBeEmpty();
        });
    });

    it("should create an empty config if the file is not found", () => {
        const getConfigFileMock = jest.spyOn(Config, "getConfigFile");
        getConfigFileMock.mockImplementation(() => "bad");
        const badConfig = new Config();
        const subConfig: string = "pay-config";
        const result = badConfig.get(subConfig);
        expect(result).toBeEmpty();
        getConfigFileMock.mockRestore();
    });
});
