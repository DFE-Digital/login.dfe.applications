const { findAndCountAllTokens } = require('./data');
const { extractPageParam, extractPageSizeParam } = require('./../../utils');
const { Op } = require('sequelize');
const logger = require('./../../../infrastructure/logger');

const query = async (grantId, page, pageSize) => {
  const offset = (page - 1) * pageSize;
  const where =  {
    grantId: {
      [Op.eq]: grantId,
    },
  };
  return findAndCountAllTokens(where, offset, pageSize);
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
    logger.info(`Processing list service grant tokens request. CorrelationId: ${req.correlationId}, page: ${page}, pageSize: ${pageSize}`);
    const grantId = req.params.grantId;

    const result = await query(grantId, page, pageSize);

    result.page = page;
    result.numberOfPages = Math.ceil(result.numberOfRecords / pageSize);

    return res.json(result);
  } catch (e) {
    logger.error(`Error processing list service grant tokens request - ${e.message}. CorrelationId: ${req.correlationId}, page: ${page}, pageSize: ${pageSize}`);
    throw e;
  }
};

module.exports = list;
