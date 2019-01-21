const { services } = require('./../../../infrastructure/repository');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const defaultQueryOpts = {
  order: [
    ['name', 'ASC'],
  ],
};

const mapEntity = async (entity) => {
  if (!entity) {
    return undefined;
  }

  const redirects = (await entity.getRedirects() || []).map(e => e.redirectUrl);
  const postLogoutRedirects = (await entity.getPostLogoutRedirects() || []).map(e => e.redirectUrl);
  const grantTypes = (await entity.getGrantTypes() || []).map(e => e.grantType);
  const responseTypes = (await entity.getResponseTypes() || []).map(e => e.responseType);
  const paramsArray = (await entity.getParams() || []).filter(e => e.paramName != null);
  const params = {};
  paramsArray.forEach(({ paramName, paramValue }) => {
    params[paramName] = paramValue;
  });
  const assertions = (await entity.getAssertions() || []).map(e => ({
    type: e.typeUrn,
    value: e.value,
    friendlyName: e.friendlyName || undefined,
  }));

  let saml;
  if (assertions.length > 0) {
    saml = {
      assertions,
    };
  }

  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
    isExternalService: entity.isExternalService,
    isMigrated: entity.isMigrated,
    relyingParty: {
      client_id: entity.clientId,
      client_secret: entity.clientSecret,
      api_secret: entity.apiSecret || undefined,
      token_endpoint_auth_method: entity.tokenEndpointAuthMethod || undefined,
      service_home: entity.serviceHome || undefined,
      postResetUrl: entity.postResetUrl || undefined,
      redirect_uris: redirects,
      post_logout_redirect_uris: postLogoutRedirects,
      grant_types: grantTypes.length > 0 ? grantTypes : undefined,
      response_types: responseTypes.length > 0 ? responseTypes : undefined,
      params: params,
    },
    saml,
  };
};

const mapEntities = async (entities) => {
  const mapped = [];
  for (let i = 0; i < entities.length; i++) {
    mapped.push(await mapEntity(entities[i]));
  }
  return mapped;
};

const findAndCountAll = async (where, offset, limit) => {
  const resultset = await services.findAndCountAll(Object.assign({}, defaultQueryOpts, {
    where,
    limit,
    offset,
  }));
  return {
    services: await mapEntities(resultset.rows),
    numberOfRecords: resultset.count,
  };
};

const findAll = async (where) => {
  const resultset = await services.findAll(Object.assign({}, defaultQueryOpts, {
    where,
  }));
  return {
    services: await mapEntities(resultset.rows),
  };
};

const find = async (where) => {
  const service = await services.find(Object.assign({}, defaultQueryOpts, {
    where,
  }));
  return mapEntity(service);
};

const update = async (service, correlationId) => {
  const existing = await services.find({
    where: {
      id: {
        [Op.eq]: service.id,
      },
    }
  });

  if (!existing) {
    return null;
  }

  await existing.updateAttributes({
    name: service.name,
    description: service.description,
    clientId: service.client_id,
    clientSecret: service.client_secret,
    apiSecret: service.api_secret,
    serviceHome: service.service_home,
  })
};


module.exports = {
  findAndCountAll,
  findAll,
  find,
  update
};
