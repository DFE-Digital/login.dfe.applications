const { Op } = require('sequelize');
const logger = require('../../infrastructure/logger');
const { findAllIdOnlyToShow } = require('./data');

const query = async () => {
  const where = {

    [Op.and]: [
      { isIdOnlyService: true },
      { isHiddenService: false },
    ],
  };
  return findAllIdOnlyToShow(where);
};

const listIdOnlyServices = async (req, res) => {
  try {
    logger.info(`Processing - list IDonly services request. CorrelationId: ${req.correlationId}`);
    const result = await query();
    return res.json(result);
  } catch (e) {
    logger.error(`Error processing list IDonly services request - ${e.message}. CorrelationId: ${req.correlationId}`);
    throw e;
  }
};

module.exports = listIdOnlyServices;
