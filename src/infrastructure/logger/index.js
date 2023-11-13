'use strict';

const winston = require('winston');
const appInsights = require('applicationinsights');
const AppInsightsTransport = require('login.dfe.winston-appinsights');
const AuditTransporter = require('login.dfe.audit.transporter');
const config = require('../config');

const logLevel = (config && config.loggerSettings && config.loggerSettings.logLevel) ? config.loggerSettings.logLevel : 'info';

const customLevels = {
  levels: {
    audit: 0,
    error: 1,
    warn: 2,
    info: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  },
  colors: {
    info: 'yellow',
    ok: 'green',
    error: 'red',
    audit: 'magenta',
  },
};

const loggerConfig = {
  levels: customLevels.levels,
  transports: [],
};

loggerConfig.transports.push(new (winston.transports.Console)({ level: logLevel, colorize: true }));

const opts = { application: config.loggerSettings.applicationName, level: 'audit' };
const auditTransport = AuditTransporter(opts);

if (auditTransport) {
  loggerConfig.transports.push(auditTransport);
}

if (config.hostingEnvironment.applicationInsights) {
  appInsights.setup(config.hostingEnvironment.applicationInsights)
    .setAutoCollectConsole(false, false)
    .setSendLiveMetrics(config.loggerSettings.aiSendLiveMetrics || false)
    .start();
  loggerConfig.transports.push(new AppInsightsTransport({
    client: appInsights.defaultClient,
    applicationName: config.loggerSettings.applicationName || 'Applications',
    type: 'event',
    treatErrorsAsExceptions: true,
  }));
}

const logger = winston.createLogger(loggerConfig);

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection at:', p, 'reason:', reason);
});

module.exports = logger;
