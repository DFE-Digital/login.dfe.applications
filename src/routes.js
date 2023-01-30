const services = require('./app/services');
const constants = require('./app/constants');
const registerRoutes = (app) => {
  app.use('/services', services());
  app.use('/constants', constants);
};

module.exports = registerRoutes;
