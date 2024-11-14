'use strict';

const { updateToken } = require('./data');
const logger = require('../../../infrastructure/logger');

const validate = (req) => {
  const model = {
    token: {
      jti: req.body.jti,
      active: req.body.active,
      grantId: req.params.grantId,
    },
    errors: [],
  };

  if (model.token.active === undefined) {
    model.errors.push('active must be specified');
  }
  if (!model.token.jti) {
    model.errors.push('jti must be specified');
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
    const token = await updateToken(
      model.token.grantId,
      model.token.jti,
      model.token.active,
    );

    return res.status(202).json(token);
  } catch (e) {
    logger.error('Error processing create token request', { correlationId, ...e });
    throw e;
  }
};

module.exports = action;
