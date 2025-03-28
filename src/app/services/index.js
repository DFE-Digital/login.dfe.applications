const express = require("express");
const { asyncWrapper } = require("login.dfe.express-error-handling");

const list = require("./list");
const getServiceById = require("./getServiceById");
const createService = require("./createService");
const updateService = require("./updateService");
const deleteService = require("./deleteService");
const listServiceBanners = require("./listServiceBanners");
const upsertServiceBanner = require("./upsertServiceBanner");
const getBannerById = require("./getServiceBannerById");
const removeBanner = require("./removeServiceBanner");
const grants = require("./grants");

const router = express.Router({ mergeParams: true });

const buildArea = () => {
  router.get("/", asyncWrapper(list));
  router.post("/", asyncWrapper(createService));
  router.get("/:id", asyncWrapper(getServiceById));
  router.patch("/:id", asyncWrapper(updateService));
  router.delete("/:id", asyncWrapper(deleteService));
  router.get("/:id/banners", asyncWrapper(listServiceBanners));
  router.post("/:id/banners", asyncWrapper(upsertServiceBanner));

  router.get("/:id/banners/:bid", asyncWrapper(getBannerById));
  router.delete("/:id/banners/:bid", asyncWrapper(removeBanner));

  router.use("/:id/grants", grants());
  return router;
};

module.exports = buildArea;
