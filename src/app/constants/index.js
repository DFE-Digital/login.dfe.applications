const express = require("express");
const apiAuth = require("login.dfe.api.auth");
const config = require("./../../infrastructure/config");
const { asyncWrapper } = require("login.dfe.express-error-handling");

const { getFilteredToggleFlags, getToggleFlags } = require("./getToggleFlags");

const constantsRoutes = () => {
  const router = express.Router();

  // Add auth middleware.
  if (config.hostingEnvironment.env !== "dev") {
    router.use(apiAuth(router, config));
  }

  // Map routes to functions.
  router.get("/toggleflags", asyncWrapper(getToggleFlags));
  router.get(
    "/toggleflags/:type/:service_name",
    asyncWrapper(getFilteredToggleFlags),
  );

  return router;
};

module.exports = constantsRoutes();
