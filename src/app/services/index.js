'use strict';

const express = require('express');
const { asyncWrapper } = require('login.dfe.express-error-handling');

const list = require('./list');
const getServiceById = require('./getServiceById');
const updateService = require('./updateService');
const listServiceBanners = require('./listServiceBanners');
const upsertServiceBanner = require('./upsertServiceBanner');

const router = express.Router();

const buildArea = () => {
  router.get('/', asyncWrapper(list));
  router.get('/:id', asyncWrapper(getServiceById));
  router.patch('/:id', asyncWrapper(updateService));

  router.get('/:id/banners', asyncWrapper(listServiceBanners));
  router.post('/:id/banners', asyncWrapper(upsertServiceBanner));

  return router;
};

module.exports = buildArea;
