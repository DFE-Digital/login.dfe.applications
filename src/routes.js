const services = require('./app/services');
const serviceSummaries = require('./app/serviceSummaries');
const constants = require('./app/constants');

const registerRoutes = (app) => {
  app.use('/services', services());
  app.get('/service-summaries/:ids', serviceSummaries);
  app.use('/constants', constants);
};

module.exports = registerRoutes;
