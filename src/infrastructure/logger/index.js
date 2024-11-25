'use strict';

const {
  createLogger, format, transports, addColors,
} = require('winston');

const {
  combine, prettyPrint, errors, simple, timestamp, json,
} = format;

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
  },
  colors: {
    audit: 'magenta',
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    verbose: 'cyan',
    debug: 'green',
  },
};

addColors(customLevels.colors);

// Formatter to hide audit records from other loggers.
const hideAudit = format((info) => ((info.level.toLowerCase() === 'audit') ? false : info));

const loggerConfig = {
  levels: customLevels.levels,
  transports: [],
};

loggerConfig.transports.push(new transports.Console({
  format: combine(
    hideAudit(),
    timestamp(),
    json(),
  ),
  level: logLevel,
}));

const opts = { application: config.loggerSettings.applicationName, level: 'audit' };
const auditTransport = AuditTransporter(opts);

if (auditTransport) {
  loggerConfig.transports.push(auditTransport);
}

if (config.hostingEnvironment.applicationInsights) {
  appInsights
    .setup(config.hostingEnvironment.applicationInsights)
    .setAutoCollectConsole(false, false)
    .setSendLiveMetrics(config.loggerSettings.aiSendLiveMetrics || false)
    .start();

  loggerConfig.transports.push(
    new AppInsightsTransport({
      format: combine(
        hideAudit(),
        format.json(),
      ),
      client: appInsights.defaultClient,
      applicationName: config.loggerSettings.applicationName || 'Applications',
      type: 'event',
      treatErrorsAsExceptions: true,
    }),
  );
}

const logger = createLogger({
  format: combine(
    simple(),
    errors({ stack: true }),
    prettyPrint(),
  ),
  transports: loggerConfig.transports,
  levels: loggerConfig.levels,
});

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection at:', p, 'reason:', reason);
});

module.exports = logger;
