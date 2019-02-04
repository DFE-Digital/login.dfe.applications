const { listServiceBanners } = require('./data');
const { extractPageParam, extractPageSizeParam } = require('./../utils');
const logger = require('./../../infrastructure/logger');

const listBannersForService = async (req, res) => {
  let page;
  let pageSize;
  try {
    page = extractPageParam(req);
    pageSize = extractPageSizeParam(req);
  } catch (e) {
    return res.status(400).send({ error: e.message });
  }

  try {
    logger.info(`Processing list service banners request. CorrelationId: ${req.correlationId}, page: ${page}, pageSize: ${pageSize}`);

    const pageOfBanners = await listServiceBanners(req.params.id, page, pageSize);
    return res.json(pageOfBanners);
  } catch(e) {
    logger.error(`Error processing list service banners request - ${e.message}. CorrelationId: ${req.correlationId}, page: ${page}, pageSize: ${pageSize}`);
  }
};

module.exports = listBannersForService;
