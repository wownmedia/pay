#!/usr/bin/env node
'use strict';
require('dotenv').config();
const { WebhookListener } = require("../dist");
const { Core } = require("@cryptology.hk/pay-framework");

/**
 * Start up the monitor
 * @returns {Promise<void>}
 */
async function start () {
    try {
        Core.logger.info('Starting ARK Blockchain Command Monitor');
        const webhookListener = new WebhookListener();
        await webhookListener.start();
    } catch (e) {
        Core.logger.error(e.message);
        throw e;
    }
}

start().catch(e => {
    Core.logger.error('ARK Blockchain Command Monitor terminated with error');
});
