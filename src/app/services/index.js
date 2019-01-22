'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');

const list = require('./list');
const getServiceById = require('./getServiceById');
const updateService = require('./updateService');

const router = express.Router();

const buildArea = () => {
  router.get('/', asyncWrapper(list));
  router.get('/:id', asyncWrapper(getServiceById));
  router.patch('/:id', asyncWrapper(updateService));

  return router;
};

module.exports = buildArea;
