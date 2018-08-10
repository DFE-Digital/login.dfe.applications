const {find} = require('./data');
const logger = require('./../../infrastructure/logger');
const {Op} = require('sequelize');

const isUUID = (value) => {
  return value.match(/^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}$/i) ? true : false;
};

const getServiceById = async (req, res) => {
  const serviceId = req.params.id ? req.params.id.toLowerCase() : '';
  try {
    let service;

    if (isUUID(serviceId)) {
      service = await find({
        id: {
          [Op.eq]: serviceId,
        },
      });
    }

    if (!service) {
      service = await find({
        clientId: {
          [Op.eq]: serviceId,
        },
      });
    }
    if (!service) {
      return res.status(404).send();
    }
    return res.status(200).send(service);
  } catch (e) {
    logger.error(e);
    throw e;
  }

};

module.exports = getServiceById;
