"use strict";

const config = require("./../config");

const { makeConnection } = require("./connection");
const servicesModel = require("./services");
const serviceRedirectsModel = require("./serviceRedirects");
const servicePostLogoutRedirectsModel = require("./servicePostLogoutRedirects");
const serviceGrantTypesModel = require("./serviceGrantTypes");
const serviceResponseTypesModel = require("./serviceResponseTypes");
const serviceParamsModel = require("./serviceParams");
const serviceAssertionsModel = require("./serviceAssertions");
const serviceBannersModel = require("./serviceBanners");
const serviceConstantsModel = require("./servicesToggleFlags");
const grants = require("./grants");
const tokens = require("./tokens");

const db = makeConnection();

const defineStatic = (model) => {};
const buildDataModel = (model, connection, entityModels) => {
  const dbSchema = config.database.schema || "services";

  // Define
  entityModels.forEach((entityModel) => {
    model[entityModel.name] = entityModel.define(db, dbSchema);
  });
  defineStatic(model);

  // Extend
  entityModels
    .filter((m) => m.extend !== undefined)
    .forEach((entityModel) => {
      entityModel.extend(model);
    });
};
const dataModel = {};
buildDataModel(dataModel, db, [
  servicesModel,
  serviceRedirectsModel,
  servicePostLogoutRedirectsModel,
  serviceGrantTypesModel,
  serviceResponseTypesModel,
  serviceParamsModel,
  serviceAssertionsModel,
  serviceBannersModel,
  grants,
  tokens,
  serviceConstantsModel,
]);

module.exports = dataModel;
