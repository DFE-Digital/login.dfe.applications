const { Op } = require('sequelize');
const { findAndCountAllTokens } = require('./data');
const { extractPageParam, extractPageSizeParam } = require('../../utils');
const logger = require('../../../infrastructure/logger');

const query = async (grantId, page, pageSize) => {
  const offset = (page - 1) * pageSize;
  const where = {
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

  const { correlationId } = req;
  try {
    logger.debug(`Processing list service grant tokens request. page: ${page}, pageSize: ${pageSize}`, { correlationId });

    const { grantId } = req.params;
    const result = await query(grantId, page, pageSize);

    result.page = page;
    result.numberOfPages = Math.ceil(result.numberOfRecords / pageSize);

    return res.json(result);
  } catch (e) {
    logger.error(`Error processing list service grant tokens request - page: ${page}, pageSize: ${pageSize}`, { correlationId, ...e });
    throw e;
  }
};

module.exports = list;
