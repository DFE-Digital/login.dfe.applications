'use strict';

const Sequelize = require('sequelize');

const { Op } = Sequelize;
const logger = require('../../../infrastructure/logger');
const { servicesToggleFlags } = require('../../../infrastructure/repository');

const listOfFilteredFlags = async (type, serviceName) => {
  try {
    logger.debug('List of toggle flags');

    const listOfflags = await servicesToggleFlags.findAll(
      {
        where: {
          type: {
            [Op.eq]: type,
          },
          serviceName: {
            [Op.eq]: serviceName,
          },
        },
      },
    );

    if (!listOfflags) {
      return null;
    }

    return listOfflags;
  } catch (e) {
    logger.error(`Error getting list of toggle flags - for type - ${type} and service name - ${serviceName} `, { error: { ...e } });
    throw e;
  }
};

const listOfFlags = async () => {
  try {
    logger.debug('List of toggle flags');

    const listOfflags = await servicesToggleFlags.findAll();

    if (!listOfflags) {
      return null;
    }

    return listOfflags;
  } catch (e) {
    logger.error('Error getting list of toggle flags', { error: { ...e } });
    throw e;
  }
};

module.exports = {
  listOfFilteredFlags,
  listOfFlags,
};
