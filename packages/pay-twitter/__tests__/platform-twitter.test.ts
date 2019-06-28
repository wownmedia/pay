import { Core, Interfaces, Services } from "@cryptology.hk/pay-framework";
import "jest-extended";

const configMock = jest.spyOn(Core.config, "get");
configMock.mockImplementation(() => ({
    twitter: {
        admin: "CryptologyHK",
        userId: "ArkTippr",
        usernamePrefix: "@",
        serverUrl: "https://twitter.arktippr.test",
        route: "/webhooks",
        consumerKey: "AAAA",
        consumerSecret: "BBBB",
        accessToken: "XXXX",
        accessTokenSecret: "YYYY",
        environment: "arktippr",
        accountApiPort: 4466,
    },
    reddit: {
        clientId: "xxx",
        clientSecret: "yyy",
        username: "arktippr",
        password: "zzz",
    },
}));

import { PlatformTwitter } from "../src/platform-twitter";
const platformTwitter = new PlatformTwitter();

describe("pay-twitter: PlatformTwitter()", () => {
    describe("filterEvent()", () => {
        it("should be a function", () => {
            expect(platformTwitter.filterEvent).toBeFunction();
        });
    });
});
