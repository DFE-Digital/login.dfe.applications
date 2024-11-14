const { Op } = require('sequelize');
const {
  find,
  findAll,
  unusedServiceFields,
} = require('./data');
const logger = require('../../infrastructure/logger');
const { isUUID } = require('../utils');
const dataModel = require('../../infrastructure/repository');

const validateServiceIds = (serviceIds) => {
  let statusMessage = null;
  let statusCode = null;

  if (!serviceIds) {
    statusCode = 404;
    statusMessage = 'No service IDs were requested.';
  }

  if (serviceIds.length > 50) {
    statusCode = 400;
    statusMessage = 'Maximum of 50 service IDs per request.';
  }

  return { statusCode, statusMessage };
};

const buildWhere = (ids, clientIds) => {
  let where;

  if (ids.length > 0 && clientIds.length > 0) {
    where = {
      [Op.or]: [
        { id: { [Op.in]: ids } },
        { clientId: { [Op.in]: clientIds } },
      ],
    };
  } else if (ids.length > 0) {
    where = (ids.length > 1) ? { id: { [Op.in]: ids } } : { id: { [Op.eq]: ids[0] } };
  } else {
    where = (clientIds.length > 1) ? { clientId: { [Op.in]: clientIds } } : { clientId: { [Op.eq]: clientIds[0] } };
  }

  return where;
};

const getSingleService = async (queryOptions, queryIds, queryClientIds) => {
  let result = await find(queryOptions);

  // Maintains previous functionality when getting a single service, where if it cannot be found by ID, it tries with clientId.
  if (!result && queryIds.length === 1) {
    const swappedIdOptions = queryOptions;
    swappedIdOptions.where = buildWhere(queryClientIds, queryIds);
    result = await find(swappedIdOptions);
  }
  return result;
};

const getMultipleServices = async (queryOptions) => findAll(queryOptions);

const getSummaries = async (req, res) => {
  const serviceIds = (req.params.ids) ? req.params.ids.toLowerCase().split(',') : '';

  const idsValidation = validateServiceIds(serviceIds);
  if (idsValidation.statusCode !== null) {
    res.statusMessage = idsValidation.statusMessage;
    return res.status(idsValidation.statusCode).send();
  }
  const queryIds = [];
  const queryClientIds = [];
  serviceIds.forEach((id) => (isUUID(id) ? queryIds.push(id) : queryClientIds.push(id)));

  const fields = (req.query.fields) ? [...new Set(req.query.fields.split(','))] : [];
  // The below attributes/associations are not used in the returned object.
  const serviceAttributes = Object.keys(dataModel.services.rawAttributes).filter(
    (field) => !unusedServiceFields.includes(field),
  );
  const serviceAssociations = Object.keys(dataModel.services.associations).filter(
    (field) => !unusedServiceFields.includes(field),
  );
  const allowedFields = serviceAttributes.concat(serviceAssociations);

  if (fields && !fields.every((field) => allowedFields.includes(field))) {
    const unknownFields = fields.filter((field) => !allowedFields.includes(field));
    res.statusMessage = `Invalid fields used: ${unknownFields.join()}! Allowed fields: ${allowedFields.join()}`;
    return res.status(400).send();
  }
  const queryAttributes = [];
  const queryAssociations = [];
  fields.forEach((field) => (serviceAttributes.includes(field) ? queryAttributes.push(field)
    : queryAssociations.push(field)
  ));

  const queryOptions = {
    where: buildWhere(queryIds, queryClientIds),
    attributes: queryAttributes.length > 0 || fields.length > 0 ? queryAttributes : serviceAttributes,
    include: queryAssociations.length > 0 || fields.length > 0 ? queryAssociations : serviceAssociations,
  };

  try {
    const serviceInfo = (serviceIds.length > 1) ? await getMultipleServices(queryOptions)
      : await getSingleService(queryOptions, queryIds, queryClientIds);

    if (!serviceInfo) {
      return res.status(404).send();
    }

    return res.status(200).send(serviceInfo);
  } catch (e) {
    logger.error(e, { ...e });
    throw e;
  }
};

module.exports = getSummaries;
