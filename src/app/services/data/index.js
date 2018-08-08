const { services } = require('./../../../infrastructure/repository');

const mapEntity = (entity) => {
  if (!entity) {
    return undefined;
  }

  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
  };
};

const findAndCountAll = async (where, offset, limit) => {
  const resultset = await services.findAndCountAll({
    where,
    order: [
      ['name', 'ASC'],
    ],
    limit,
    offset,
  });
  return {
    services: resultset.rows.map(mapEntity),
    numberOfRecords: resultset.count,
  };
};

const findAll = async (where) => {
  const resultset = await services.findAll({
    where,
    order: [
      ['name', 'ASC'],
    ],
  });
  return {
    services: resultset.map(mapEntity),
  };
};

const find = async (where) => {
  const service = await services.findAll({
    where,
    order: [
      ['name', 'ASC'],
    ],
  });
  return mapEntity(service);
};

module.exports = {
  findAndCountAll,
  findAll,
  find,
};
