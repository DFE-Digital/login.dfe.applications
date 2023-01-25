const services = require('./services');
const constants = require('./constants');
const registerRoutes = (app) => {
  app.use('/services', services());
  app.use('/constants', constants);
};

module.exports = registerRoutes;
