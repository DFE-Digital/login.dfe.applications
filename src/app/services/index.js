'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');

const router = express.Router();

const buildArea = () => {
  router.get('/', asyncWrapper((req, res) => {
    res.send('list');
    return Promise.resolve();
  }));

  return router;
};

module.exports = buildArea;
