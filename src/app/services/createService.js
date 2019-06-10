const { create, addRedirectUri, addPostLogoutRedirect, addGrantType, addResponseType, addServiceParam, find } = require('./data');
const logger = require('./../../infrastructure/logger');
const { Op } = require('sequelize');
const { forEachAsync } = require('./../utils');
const { isUUID } = require('./../utils');

const parseAndValidateRequest = async (req) => {
  const relyingParty = req.body.relyingParty || {};
  const model = {
    service: {
      name: req.body.name,
      description: req.body.description || '',
      isExternalService: req.body.isExternalService || false,
      isChildService: req.body.isChildService || false,
      parentId: req.body.parentId || undefined,
      relyingParty: {
        client_id: relyingParty.client_id,
        client_secret: relyingParty.client_secret,
        api_secret: relyingParty.api_secret || undefined,
        token_endpoint_auth_method: relyingParty.token_endpoint_auth_method || undefined,
        service_home: relyingParty.service_home || undefined,
        postResetUrl: relyingParty.postResetUrl || undefined,
        redirect_uris: relyingParty.redirect_uris || [],
        post_logout_redirect_uris: relyingParty.post_logout_redirect_uris || [],
        grant_types: relyingParty.grant_types || [],
        response_types: relyingParty.response_types || [],
        params: relyingParty.params || {},
      },
    },
    validationErrors: [],
  };

  if (!model.service.name) {
    model.validationErrors.push('Must provide name');
  }

  if (!model.service.relyingParty.client_id) {
    model.validationErrors.push('Must provide relyingParty.client_id');
  } else if (isUUID(model.service.relyingParty.client_id)) {
    model.validationErrors.push('relyingParty.client_id cannot be an UUID');
  }

  if (!model.service.relyingParty.client_secret) {
    model.validationErrors.push('Must provide relyingParty.client_secret');
  } else if (model.service.relyingParty.client_secret.length < 15) {
    model.validationErrors.push('relyingParty.client_secret must be at least 15 characters');
  } else {
    const existingServiceWithClientId = await find({
      clientId: {
        [Op.eq]: model.service.relyingParty.client_id,
      },
    });
    if(existingServiceWithClientId) {
      model.validationErrors.push(`relyingParty.client_id must be unique. ${model.service.relyingParty.client_id} is already assigned`);
    }
  }

  if (model.service.relyingParty.redirect_uris < 1) {
    model.validationErrors.push('Must provide at least 1 relyingParty.redirect_uris');
  }

  return model;
};

const createService = async (req, res) => {
  const model = await parseAndValidateRequest(req);
  if (model.validationErrors.length > 0) {
    return res.status(400).json({ reasons: model.validationErrors });
  }

  const id = await create(model.service);
  await forEachAsync(model.service.relyingParty.redirect_uris, async (redirectUri) => {
    await addRedirectUri(id, redirectUri);
  });
  await forEachAsync(model.service.relyingParty.post_logout_redirect_uris, async (redirectUri) => {
    await addPostLogoutRedirect(id, redirectUri);
  });
  await forEachAsync(model.service.relyingParty.grant_types, async (grantType) => {
    await addGrantType(id, grantType);
  });
  await forEachAsync(model.service.relyingParty.response_types, async (responseType) => {
    await addResponseType(id, responseType);
  });
  await forEachAsync(Object.keys(model.service.relyingParty.params), async (paramName) => {
    const paramValue = model.service.relyingParty.params[paramName];
    await addServiceParam(id, paramName, paramValue);
  });

  const service = await find({
    id: {
      [Op.eq]: id,
    },
  });
  return res.status(201).json(service);
};
module.exports = createService;
