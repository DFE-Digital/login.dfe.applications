const { removeServiceBanner } = require('./data');
const logger = require('./../../infrastructure/logger');

const deleteServiceBanner = async (req, res) => {
  try {
    logger.info(`Processing remove service banner request. CorrelationId: ${req.correlationId}`);
    await removeServiceBanner(req.params.id, req.params.bid);
    return res.status(204).send();
  } catch (e) {
    logger.error(`Error processing remove service banner request - ${e.message}. CorrelationId: ${req.correlationId}`);
    throw e;
  }
};

module.exports = deleteServiceBanner;
