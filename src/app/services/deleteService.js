const { Op } = require('sequelize');
const { destroy, find } = require('./data');
const logger = require('../../infrastructure/logger');

const deleteService = async (req, res) => {
  const serviceId = req.params.id;
  const { correlationId } = req;

  logger.info(`Deleting service ${serviceId}`, { correlationId });
  try {
    const existingService = await find({
      id: {
        [Op.eq]: serviceId,
      },
    });
    if (!existingService) {
      return res.status(404).send();
    }

    if (!existingService.parentId) {
      return res.status(400).send('Top level services are not deletable.');
    }
    await destroy(existingService.id);
    return res.status(202).send();
  } catch (e) {
    logger.error(`Error deleting service ${serviceId}`, { correlationId, error: { ...e } });
    throw e;
  }
};

module.exports = deleteService;
