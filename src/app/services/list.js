const { findAndCountAll } = require('./data');
const { extractPageParam, extractPageSizeParam } = require('./../utils');
const logger = require('./../../infrastructure/logger');

const query = async (page, pageSize) => {
  const offset = (page - 1) * pageSize;
  return findAndCountAll(undefined, offset, pageSize);
};

const list = async (req, res) => {
  let page;
  let pageSize;
  try {
    page = extractPageParam(req);
    pageSize = extractPageSizeParam(req);
  } catch (e) {
    return res.status(400).send({ error: e.message });
  }
  try {
    logger.info(`Processing list services request. CorrelationId: ${req.correlationId}, page: ${page}, pageSize: ${pageSize}`);

    const result = await query(page, pageSize);

    result.page = page;
    result.numberOfPages = Math.ceil(result.numberOfRecords / pageSize);

    return res.json(result);
  } catch (e) {
    logger.error(`Error processing list services request - ${e.message}. CorrelationId: ${req.correlationId}, page: ${page}, pageSize: ${pageSize}`);
    throw e;
  }
};

module.exports = list;
