const { update, find } = require('./data');
const logger = require('./../../infrastructure/logger');
const {Op} = require('sequelize');

const patchableProperties = ['name', 'description', 'client_id', 'api_secret', 'client_secret', 'service_home', 'redirect_uris', 'post_logout_redirect_uris', 'grant_types', 'response_types'];

const validate = (req) => {
  const keys = Object.keys(req.body);

  if (keys.length === 0) {
    return `Must specify at least one property. Patchable properties ${patchableProperties}`
  }
  const error = keys.map((key) => {
    const value = req.body[key];
    if (!patchableProperties.find(x => x === key)) {
      return `${key} is not a patchable property. Patchable properties ${patchableProperties}`
    }
    if ((key === 'redirect_uris' || key === 'post_logout_redirect_uris' || key === 'grant_types' || key === 'response_types') && !(value instanceof Array)) {
      return `${key} must be an array`
    }
    return null;
  });
  return error.find(x => x !== null);
};

const updateService = async (req, res) => {
  const serviceId = req.params.id;
  const correlationId = req.correlationId;
  try {
    const existingService = await find({
      id: {
        [Op.eq]: serviceId,
      },
    });
    if (!existingService) {
      return res.status(404).send();
    }

    const validation = validate(req);
    if (validation) {
      return res.status(400).send(validation);
    }

    const updatedService = Object.assign(existingService, req.body);

    await update(updatedService, correlationId);
    return res.status(202).send();
  } catch (e) {
    logger.error(`Error updating service ${serviceId} (correlation id: ${correlationId} - ${e.message}`);
    throw e;
  }
};

module.exports = updateService;
