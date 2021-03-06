'use strict'

const Sequelize = require('sequelize');

const Op = Sequelize.Op;
const logger = require('./../../../infrastructure/logger');
const { servicesToggleFlags } = require('./../../../infrastructure/repository');

const listOfFilteredFlags = async (type, serviceName) => {
    try {
      logger.info('List of toggle flags');
      const listOfflags = await servicesToggleFlags.findAll(
        {
          where: {
            type: {
            [Op.eq]: type,
            },
            serviceName: {
            [Op.eq]: serviceName,
            }
          }
        });
      if (!listOfflags) {
        return null;
      }
  
      return listOfflags;
    } catch (e) {
      logger.error(`Error getting list of toggle flags - ${e.message} for type - ${type} and service name - ${serviceName}  error: ${e}`);
      throw e;
    }
  };

  const listOfFlags = async () => {
    try {
      logger.info('List of toggle flags');
      const listOfflags = await servicesToggleFlags.findAll();
      if (!listOfflags) {
        return null;
      }
  
      return listOfflags;
    } catch (e) {
      logger.error(`Error getting list of toggle flags - ${e.message} error: ${e}`);
      throw e;
    }
  };

  module.exports = {
    listOfFilteredFlags,
    listOfFlags
  }