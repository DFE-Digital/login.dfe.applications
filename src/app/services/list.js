const { services } = require('./../../infrastructure/repository');
const { extractPageParam, extractPageSizeParam } = require('./../utils');

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
  const page = extractPageParam(req);
  const pageSize = extractPageSizeParam(req);
  const result = await query(page, pageSize);

  result.page = page;
  result.numberOfPages = Math.ceil(result.numberOfRecords / pageSize);

  return res.json(result);
};

module.exports = list;
