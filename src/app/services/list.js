const { services } = require('./../../infrastructure/repository');
const { extractPageParam, extractPageSizeParam } = require('./../utils');
const logger = require('./../../infrastructure/logger');

const query = async (page, pageSize) => {
  const offset = (page - 1) * pageSize;
  const resultset = await services.findAndCountAll({
    order: [
      ['name', 'ASC'],
    ],
    limit: pageSize,
    offset,
  });
  return {
    services: resultset.rows,
    numberOfRecords: resultset.count,
  };
};

const list = async (req, res) => {
  try {
    const page = extractPageParam(req);
    const pageSize = extractPageSizeParam(req);
    logger.info(`Processing list services request. CorrelationId: ${req.correlationId}, page: ${page}, pageSize: ${pageSize}`);

    const result = await query(page, pageSize);

    result.page = page;
    result.numberOfPages = Math.ceil(result.numberOfRecords / pageSize);

    return res.json(result);
  } catch (e) {
    if (e.isUserInputError) {
      return res.status(400).send({ error: e.message });
    }
    logger.error(`Error processing list services request - ${e.message}. CorrelationId: ${req.correlationId}, page: ${page}, pageSize: ${pageSize}`);
    throw e;
  }
};

module.exports = list;
