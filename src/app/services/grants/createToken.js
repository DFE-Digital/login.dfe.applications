'use strict';

const { createToken } = require('./data');
const logger = require('../../../infrastructure/logger');

const validate = (req) => {
  const model = {
    token: {
      grantId: req.params.grantId,
      jti: req.body.jti,
      kind: req.body.kind,
      exp: req.body.exp,
      active: req.body.active,
      sid: req.body.sid,
    },
    errors: [],
  };

  if (!model.token.grantId) {
    model.errors.push('grantId must be specified');
  }
  if (!model.token.kind) {
    model.errors.push('kind must be specified');
  }
  if (!model.token.jti) {
    model.errors.push('jti must be specified');
  }
  if (!model.token.exp) {
    model.errors.push('exp must be specified');
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
    logger.info('Processing create Token.', { correlationId });
    const token = await createToken(
      model.token.grantId,
      model.token.active,
      model.token.kind,
      model.token.exp,
      model.token.jti,
      model.token.sid,
    );

    return res.status(202).json(token);
  } catch (e) {
    logger.error('Error processing create token request.', { correlationId, ...e });
    throw e;
  }
};

module.exports = action;
