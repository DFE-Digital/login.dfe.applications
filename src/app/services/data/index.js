const { services } = require('./../../../infrastructure/repository');
const logger = require('./../../../infrastructure/logger');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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

const getById = async (id, correlationId) => {
  try {
    const service = await services.find({
      where: {
        id: {
          [Op.eq]: id,
        },
      },
    });
    if (!service) {
      return null;
    }
    return {
      id: service.getDataValue('id'),
      name: service.getDataValue('name'),
      description: service.getDataValue('description'),
    };
  } catch (e) {
    logger.error(`error getting service ${id} - ${e.message} for request ${correlationId} error: ${e}`, { correlationId });
    throw e;
  }
};

module.exports = {
  findAndCountAll,
  findAll,
  find,
  getById,
};
