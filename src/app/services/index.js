'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');

const list = require('./list');
const getServiceById = require('./getServiceById');

const router = express.Router();

const buildArea = () => {
  router.get('/', asyncWrapper(list));
  router.get('/:id', asyncWrapper(getServiceById));

  return router;
};

module.exports = buildArea;
