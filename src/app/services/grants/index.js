'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');
const { isUUID } = require('./../../utils');
const { Op } = require('sequelize');
const upsertGrant = require('./upsertGrant');
const getGrants = require('./list');
const { find} = require('./../data');
const createToken = require('./createToken');
const patchToken = require('./patchToken');
const listTokens = require('./listTokens');
const router = express.Router({mergeParams: true});

const populateService = async (req, res, next) => {
  const serviceId = req.params.id ? req.params.id.toLowerCase() : '';
  let service;

  if (isUUID(serviceId)) {
    service = await find({
      id: {
        [Op.eq]: serviceId,
      },
    });
  }

  if (!service) {
    service = await find({
      clientId: {
        [Op.eq]: serviceId,
      },
    });
  }
  if (!service) {
    return res.status(404).send();
  }

  req.app.service = service;
  next();
};

const buildArea = () => {
  router.use(asyncWrapper(populateService));
  router.get('/', asyncWrapper(getGrants));
  router.post('/', asyncWrapper(upsertGrant));
  router.post('/:grantId/tokens', asyncWrapper(createToken));
  router.patch('/:grantId/tokens', asyncWrapper(patchToken));
  router.get('/:grantId/tokens', asyncWrapper(listTokens));
  return router;
};

module.exports = buildArea;
