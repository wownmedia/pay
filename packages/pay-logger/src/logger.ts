import pino = require("pino");
export const logger = pino({
    name: "ARK Pay",
    safe: true,
    prettyPrint: {
        translateTime: true,
        ignore: "hostname",
    },
});
