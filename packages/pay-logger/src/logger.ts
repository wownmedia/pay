import pino = require("pino");
module.exports = pino({
    name: "Pay",
    safe: true,
    prettyPrint: {
        translateTime: true,
        ignore: "hostname",
    },
});
