const { listServiceBanners } = require('./data');
const { extractPageParam, extractPageSizeParam } = require('../utils');
const logger = require('../../infrastructure/logger');

const listBannersForService = async (req, res) => {
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
    logger.debug(`Processing list service banners request. page: ${page}, pageSize: ${pageSize}`, { correlationId });

    const pageOfBanners = await listServiceBanners(req.params.id, page, pageSize);
    return res.json(pageOfBanners);
  } catch (e) {
    logger.error(`Error processing list service banners request - page: ${page}, pageSize: ${pageSize}`, { correlationId, ...e });
  }
};

module.exports = listBannersForService;
