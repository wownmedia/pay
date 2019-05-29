import pino = require("pino");

// TODO: this needs updating because it uses the old pino syntax
// @ts-ignore
export const logger = pino({
    name: "ARK Pay",
    safe: true,
    prettyPrint: {
        translateTime: true,
        ignore: "hostname",
    },
});
