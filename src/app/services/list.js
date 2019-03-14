const { findAndCountAll } = require('./data');
const { extractParam, extractPageParam, extractPageSizeParam } = require('./../utils');
const { Op } = require('sequelize');
const logger = require('./../../infrastructure/logger');

const query = async (parentId, page, pageSize) => {
  const offset = (page - 1) * pageSize;
  const where = parentId ? {
    parentId: {
      [Op.eq]: parentId,
    },
  } : undefined;
  return findAndCountAll(where, offset, pageSize);
};

const list = async (req, res) => {
  const parentId = extractParam(req, 'parent');
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

    const result = await query(parentId, page, pageSize);

    result.page = page;
    result.numberOfPages = Math.ceil(result.numberOfRecords / pageSize);

    return res.json(result);
  } catch (e) {
    logger.error(`Error processing list services request - ${e.message}. CorrelationId: ${req.correlationId}, page: ${page}, pageSize: ${pageSize}`);
    throw e;
  }
};

module.exports = list;
