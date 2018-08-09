const {find} = require('./data');
const logger = require('./../../infrastructure/logger');

const getServiceById = async (req, res) => {
  const serviceId = req.params.id ? req.params.id.toLowerCase() : '';
  try {
    const service = await find({
      id: {
        [Op.eq]: serviceId,
      },
    });
    if (!service) {
      res.status(404).send();
    }
    res.status(200).send(service);
  } catch (e) {
    logger.error(e);
    res.status(500).send(e);
  }

};

module.exports = getServiceById;
