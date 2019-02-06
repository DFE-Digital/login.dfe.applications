const { getBannerById } = require('./data');
const logger = require('./../../infrastructure/logger');

const getServiceBannerById = async (req, res) => {
  const serviceId = req.params.id;
  const bannerId = req.params.bid;
  const correlationId = req.correlationId;

  try {
    logger.info(`Getting banner with id ${bannerId} for service with id ${serviceId} (correlation id: ${correlationId})`, { correlationId });
    const banner = await getBannerById(serviceId, bannerId);
    if (!banner) {
      return res.status(404).send();
    }
    return res.status(200).send(banner);
  } catch(e) {
    logger.error(`Error getting banner with id ${bannerId} for service ${serviceId} (correlation id: ${correlationId}) - ${e.message}`, {
      correlationId,
      stack: e.stack
    });
    throw e;
  }
};

module.exports = getServiceBannerById;
