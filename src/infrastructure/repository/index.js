'use strict';

const config = require('./../config');

const { makeConnection } = require('./connection');
const servicesModel = require('./services');

const db = makeConnection();

const defineStatic = (model) => {
};
const buildDataModel = (model, connection, entityModels) => {
  const dbSchema = config.database.schema || 'services';

  // Define
  entityModels.forEach((entityModel) => {
    model[entityModel.name] = entityModel.define(db, dbSchema);
  });
  defineStatic(model);

  // Extend
  entityModels.filter(m => m.extend !== undefined).forEach((entityModel) => {
    entityModel.extend(model);
  });
};
const dataModel = {};
buildDataModel(dataModel, db, [
  servicesModel,
]);


module.exports = dataModel;
