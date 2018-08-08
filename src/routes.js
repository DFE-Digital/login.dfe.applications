const services = require('./app/services');

const registerRoutes = (app) => {
  app.use('/services', services());
};

module.exports = registerRoutes;
