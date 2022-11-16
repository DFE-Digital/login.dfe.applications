const services = require('./app/services');
const constants = require('./app/constants');
const registerRoutes = (app) => {
  app.use('/app/services', services());
  app.use('/app/constants', constants);
};

module.exports = registerRoutes;
