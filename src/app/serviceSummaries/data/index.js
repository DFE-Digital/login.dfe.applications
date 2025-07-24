const { services } = require("../../../infrastructure/repository");

const defaultQueryOpts = {
  order: [["name", "ASC"]],
};
const unusedServiceFields = [
  "redirects",
  "postLogoutRedirects",
  "grantTypes",
  "responseTypes",
  "banners",
  "grants",
  "isChildService",
];

const mapEntity = async (entity, queryOptions) => {
  if (!entity) {
    return undefined;
  }

  const { include: associations } = queryOptions;

  const redirects = associations.includes("redirects")
    ? (entity.redirects || []).map((e) => e.redirectUrl)
    : [];
  const postLogoutRedirects = associations.includes("postLogoutRedirects")
    ? (entity.postLogoutRedirects || []).map((e) => e.redirectUrl)
    : [];
  const grantTypes = associations.includes("grantTypes")
    ? (entity.grantTypes || []).map((e) => e.grantType)
    : [];
  const responseTypes = associations.includes("responseTypes")
    ? (entity.responseTypes || []).map((e) => e.responseType)
    : [];
  const paramsArray = (entity.params || []).filter((e) => e.paramName != null);
  const params = {};
  paramsArray.forEach(({ paramName, paramValue }) => {
    params[paramName] = paramValue;
  });
  const assertions = (entity.assertions || []).map((e) => ({
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
    parentId: entity.parentId || undefined,
    relyingParty: {
      client_id: entity.clientId,
      client_secret: entity.clientSecret,
      api_secret: entity.apiSecret || undefined,
      token_endpoint_auth_method: entity.tokenEndpointAuthMethod || undefined,
      service_home: entity.serviceHome || undefined,
      postResetUrl: entity.postResetUrl || undefined,
      redirect_uris: associations.includes("redirects") ? redirects : undefined,
      post_logout_redirect_uris: associations.includes("postLogoutRedirects")
        ? postLogoutRedirects
        : undefined,
      grant_types: grantTypes.length > 0 ? grantTypes : undefined,
      response_types: responseTypes.length > 0 ? responseTypes : undefined,
      params: associations.includes("params") ? params : undefined,
    },
    saml: associations.includes("assertions") ? saml : undefined,
  };
};

const mapEntities = async (entities, queryOptions) =>
  Promise.all(entities.map((entity) => mapEntity(entity, queryOptions)));

// Note: Not currently used by anything.  It was intending to be used as part of
// NSA-7220, but that seems to have stalled.  Possibly remove this if not needed
// in the future?
const findAndCountAll = async (queryOptions) => {
  const resultSet = await services.findAndCountAll({
    ...defaultQueryOpts,
    distinct: true,
  });
  return {
    services: await mapEntities(resultSet.rows, queryOptions),
    numberOfRecords: resultSet.count,
  };
};

const findAll = async (queryOptions) => {
  const resultSet = await services.findAll({
    ...defaultQueryOpts,
  });
  return {
    services: await mapEntities(resultSet, queryOptions),
  };
};

const find = async (queryOptions) => {
  const service = await services.findOne({
    ...defaultQueryOpts,
  });
  return mapEntity(service, queryOptions);
};

module.exports = {
  findAndCountAll,
  findAll,
  find,
  unusedServiceFields,
};
