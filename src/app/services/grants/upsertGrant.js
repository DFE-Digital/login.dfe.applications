'use strict';

const { upsertGrant } = require('./data');
const logger = require('../../../infrastructure/logger');

const validate = (req) => {
  const model = {
    grant: {
      grantId: req.body.grantId,
      userId: req.body.userId,
      email: req.body.email,
      jti: req.body.jti,
      serviceId: req.app.service.id,
      organisationId: req.body.organisationId,
      organisationName: req.body.organisationName,
      scope: req.body.scope,
    },
    errors: [],
  };
  if (!model.grant.serviceId) {
    model.errors.push('serviceId must be specified');
  }
  if (!model.grant.grantId) {
    model.errors.push('grantId must be specified');
  }
  if (!model.grant.userId) {
    model.errors.push('userId must be specified');
  }
  if (!model.grant.email) {
    model.errors.push('email must be specified');
  }
  if (!model.grant.jti) {
    model.errors.push('jti must be specified');
  }
  if (!model.grant.scope) {
    model.errors.push('scope must be specified');
  }

  return model;
};

const action = async (req, res) => {
  const model = validate(req);
  if (model.errors.length > 0) {
    return res.status(400).json({
      errors: model.errors,
    });
  }

  const { correlationId } = req;
  try {
    logger.info('Processing upsert grant.', { correlationId });
    const grant = await upsertGrant(
      model.grant.grantId,
      model.grant.userId,
      model.grant.email,
      model.grant.jti,
      req.app.service.id,
      model.grant.scope,
      model.grant.organisationId,
      model.grant.organisationName,
    );

    return res.status(202).json(grant);
  } catch (e) {
    logger.error('Error processing upsert for grant request.', { correlationId, ...e });
    throw e;
  }
};

module.exports = action;
