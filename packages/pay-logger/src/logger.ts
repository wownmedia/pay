import pino = require("pino");
export const logger = pino({
    name: "Pay",
    safe: true,
    prettyPrint: {
        translateTime: true,
        ignore: "hostname",
    },
});
