const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const helmet = require('helmet');
const healthCheck = require('login.dfe.healthcheck');
const { getErrorHandler } = require('login.dfe.express-error-handling');
const apiAuth = require('login.dfe.api.auth');
const logger = require('./infrastructure/logger');
const config = require('./infrastructure/config');
const registerRoutes = require('./routes');

const app = express();

logger.debug('set helmet policy defaults');

app.use(helmet({
  noCache: true,
  frameguard: {
    action: 'deny',
  },
}));

// Setting helmet Content Security Policy
const scriptSources = ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\'', '*.localhost', '*.signin.education.gov.uk', 'https://code.jquery.com', 'https://rawgit.com'];

app.use(helmet.contentSecurityPolicy({
  browserSniff: false,
  setAllHeaders: false,
  useDefaults: false,
  directives: {
    defaultSrc: ['\'self\''],
    childSrc: ['none'],
    objectSrc: ['none'],
    scriptSrc: scriptSources,
    styleSrc: ['\'self\'', '*.localhost', '*.signin.education.gov.uk', '\'unsafe-inline\''],
    imgSrc: ['\'self\'', 'data:', 'blob:', '*.localhost', '*.signin.education.gov.uk'],
    fontSrc: ['\'self\'', 'data:', '*.signin.education.gov.uk'],
    connectSrc: ['\'self\''],
    formAction: ['\'self\'', '*'],
  },
}));

logger.debug('Set helmet filters');

app.use(helmet.xssFilter());
app.use(helmet.frameguard('false'));
app.use(helmet.ieNoOpen());

logger.debug('helmet setup complete');

if (config.hostingEnvironment.env !== 'dev') {
  app.set('trust proxy', 1);
}

app.use(bodyParser.json());
app.use((req, res, next) => {
  req.correlationId = req.get('x-correlation-id') || `appci-${Date.now()}`;
  next();
});

app.use('/healthcheck', healthCheck({ config }));
if (config.hostingEnvironment.env !== 'dev') {
  app.use(apiAuth(app, config));
}
registerRoutes(app);

app.use(getErrorHandler({
  logger,
}));

if (config.hostingEnvironment.env === 'dev') {
  app.proxy = true;

  const options = {
    key: config.hostingEnvironment.sslKey,
    cert: config.hostingEnvironment.sslCert,
    requestCert: false,
    rejectUnauthorized: false,
  };
  const server = https.createServer(options, app);

  server.listen(config.hostingEnvironment.port, () => {
    logger.info(`Dev server listening on https://${config.hostingEnvironment.host}:${config.hostingEnvironment.port}`);
  });
} else {
  app.listen(process.env.PORT, () => {
    logger.info(`Server listening on http://${config.hostingEnvironment.host}:${config.hostingEnvironment.port}`);
  });
}
