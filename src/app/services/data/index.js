const { services } = require('./../../../infrastructure/repository');

const defaultQueryOpts = {
  order: [
    ['name', 'ASC'],
  ],
  include: ['redirects', 'postLogoutRedirects', 'grantTypes', 'params'],
};

const mapEntity = (entity) => {
  if (!entity) {
    return undefined;
  }

  const grantTypes = entity.grantTypes.filter(e => e.grantType != null).map(e => e.grantType);
  const paramsArray = entity.params.filter(e => e.paramName != null);
  const params = {};
  paramsArray.forEach(({ paramName, paramValue }) => {
    params[paramName] = paramValue;
  });

  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
    relyingParty: {
      client_id: entity.clientId,
      client_secret: entity.clientSecret,
      api_secret: entity.apiSecret || undefined,
      token_endpoint_auth_method: entity.tokenEndpointAuthMethod || undefined,
      service_home: entity.serviceHome || undefined,
      postResetUrl: entity.postResetUrl || undefined,
      redirect_uris: entity.redirects.filter(e => e.redirectUrl != null).map(e => e.redirectUrl),
      post_logout_redirect_uris: entity.postLogoutRedirects.filter(e => e.redirectUrl != null).map(e => e.redirectUrl),
      grant_types: grantTypes.length > 0 ? grantTypes : undefined,
      params: params,
    },
  };
};

const findAndCountAll = async (where, offset, limit) => {
  const resultset = await services.findAndCountAll(Object.assign({}, defaultQueryOpts, {
    where,
    limit,
    offset,
  }));
  return {
    services: resultset.rows.map(mapEntity),
    numberOfRecords: resultset.count,
  };
};

const findAll = async (where) => {
  const resultset = await services.findAll(Object.assign({}, defaultQueryOpts, {
    where,
  }));
  return {
    services: resultset.map(mapEntity),
  };
};

const find = async (where) => {
  const service = await services.find(Object.assign({}, defaultQueryOpts, {
    where,
  }));
  return mapEntity(service);
};

module.exports = {
  findAndCountAll,
  findAll,
  find,
};