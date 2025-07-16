const {
  setupApplicationInsights,
  setupLogging,
} = require("login.dfe.api-client/logging");

const config = require("../config");

const additionalTransports = [];

if (config.hostingEnvironment.applicationInsights) {
  setupApplicationInsights(config.hostingEnvironment.applicationInsights);
}

const applicationName = config.loggerSettings.applicationName || "Applications";

/**
 * To enable audit logging, update the logger to include `login.dfe.audit.transporter` as an additional transporter.
 *
 * Docs: https://dfe-secureaccess.atlassian.net/wiki/spaces/NSA/pages/4381868040/Process+to+centralise+component+API+calls+into+login.dfe.api-client+package#Update-to-use-logging-capabilities-from-login.dfe.api-client
 *
 * Example: https://github.com/DFE-Digital/login.dfe.services/pull/646
 */

module.exports = setupLogging({
  applicationName: applicationName,
  logLevel: process.env.LOG_LEVEL,
  additionalTransports,
});
