const { Op } = require('sequelize');
const { findAndCountAll } = require('./data');
const { extractParam, extractPageParam, extractPageSizeParam } = require('../utils');
const logger = require('../../infrastructure/logger');

const query = async (parentId, page, pageSize) => {
  const offset = (page - 1) * pageSize;
  const where = parentId ? {
    parentId: {
      [Op.eq]: parentId,
    },
  } : {
    isChildService: {
      [Op.eq]: false,
    },
  };
  return findAndCountAll(where, offset, pageSize);
};

const list = async (req, res) => {
  const { correlationId } = req;
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
    logger.debug(`Processing list services request. page: ${page}, pageSize: ${pageSize}`, { correlationId });

    const result = await query(parentId, page, pageSize);

    result.page = page;
    result.numberOfPages = Math.ceil(result.numberOfRecords / pageSize);

    return res.json(result);
  } catch (e) {
    logger.error(`Error processing list services request - page: ${page}, pageSize: ${pageSize}`, { correlationId, ...e });
    throw e;
  }
};

module.exports = list;
