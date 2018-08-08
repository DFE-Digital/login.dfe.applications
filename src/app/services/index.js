'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');

const list = require('./list');

const router = express.Router();

const buildArea = () => {
  router.get('/', asyncWrapper(list));

  return router;
};

module.exports = buildArea;
