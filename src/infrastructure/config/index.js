const fs = require('fs');
const os = require('os');
const path = require('path');

require('dotenv').config();

const config = {
  loggerSettings: {
    applicationName: "Applications API",
    logLevel: "info",
    auditDb: {
      host: process.env.PLATFORM_GLOBAL_SERVER_NAME,
      username: process.env.SVC_SIGNIN_ADT,
      password: process.env.SVC_SIGNIN_ADT_PASSWORD,
      dialect: "mssql",
      name: process.env.PLATFORM_GLOBAL_AUDIT_DATABASE_NAME,
      encrypt: true,
      schema: "dbo",
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  },
  hostingEnvironment: {
    useDevViews: false,
    env: process.env.LOCAL_ENV || "azure",
    host: process.env.LOCAL_HOST || process.env.STANDALONE_APPLICATIONS_HOST_NAME,
    port: process.env.LOCAL_PORT_APPLICATION || 443,
    sslCert: process.env.LOCAL_SSL_CERT ? process.env.LOCAL_SSL_CERT.replace(/\\n/g, '\n') : "",
    sslKey: process.env.LOCAL_SSL_KEY ? process.env.LOCAL_SSL_KEY.replace(/\\n/g, '\n') : "",
    protocol: "https",
    applicationInsights: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    agentKeepAlive: {
      maxSockets: 30,
      maxFreeSockets: 10,
      timeout: 60000,
      keepAliveTimeout: 30000
    }
  },
  auth: {
    type: "aad",
    identityMetadata: process.env.TENANT_URL + "/.well-known/openid-configuration",
    clientID: process.env.AAD_SHD_APP_ID
  },
  database: {
    host: process.env.PLATFORM_GLOBAL_SERVER_NAME,
    username: process.env.SVC_SIGNIN_ORG,
    password: process.env.SVC_SIGNIN_ORG_PASSWORD,
    dialect: "mssql",
    name: process.env.PLATFORM_GLOBAL_ORGANISATIONS_DATABASE_NAME,
    encrypt: true,
    schema: "dbo",
    pool: {
      min: process.env.SQL_POOL_MIN,
      max: process.env.SQL_POOL_MAX,
      acquire: process.env.SQL_POOL_ACQUIRE,
      idle: process.env.SQL_POOL_IDLE,
      evict: process.env.SQL_POOL_EVICT,
      maxUses: process.env.SQL_POOL_MAX_USES,
    }
  },
  notifications: {
    slackWebHookUrl: process.env.PLATFORM_GLOBAL_SLACK_FEED,
    envName: process.env.ENVIRONMENT_NAME
  }
}

// Persist configuration to a temporary file and then point the `settings` environment
// variable to the path of the temporary file. The `login.dfe.dao` package can then load
// this configuration.
function mimicLegacySettings(config) {
  // TODO: This can be improved by refactoring the `login.dfe.dao` package.
  const tempDirectoryPath = fs.mkdtempSync(path.join(os.tmpdir(), 'config-'));
  const tempConfigFilePath = path.join(tempDirectoryPath, 'config.json');

  fs.writeFileSync(tempConfigFilePath, JSON.stringify(config), { encoding: 'utf8' });
  process.env.settings = tempConfigFilePath;
}

mimicLegacySettings(config);

module.exports = config;
