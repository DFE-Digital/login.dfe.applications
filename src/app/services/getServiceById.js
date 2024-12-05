const { Op } = require("sequelize");
const { find } = require("./data");
const logger = require("../../infrastructure/logger");
const { isUUID } = require("../utils");

const getServiceById = async (req, res) => {
  const serviceId = req.params.id ? req.params.id.toLowerCase() : "";
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
    const { correlationId } = req;
    logger.error("getServiceById", { correlationId, error: { ...e } });
    throw e;
  }
};

module.exports = getServiceById;
