const { services } = require("../../../infrastructure/repository");

const defaultQueryOpts = {
  order: [["name", "ASC"]],
};
const unusedServiceFields = ["banners", "grants", "isChildService"];
const lazyLoadedServiceAssociations = [
  "redirects",
  "postLogoutRedirects",
  "grantTypes",
  "responseTypes",
];

// REMOVE THIS once all lazy loaded associations have been given primary keys.
const removeLazyAssociations = (queryOptions) => {
  // Make a copy of queryOptions so the original isn't modified.
  const newQueryOptions = { ...queryOptions };
  newQueryOptions.include = queryOptions.include.filter(
    (x) => !lazyLoadedServiceAssociations.includes(x),
  );
  return newQueryOptions;
};

const mapEntity = async (entity, queryOptions) => {
  if (!entity) {
    return undefined;
  }

  const { include: associations } = queryOptions;

  const redirects = associations.includes("redirects")
    ? ((await entity.getRedirects()) || []).map((e) => e.redirectUrl)
    : [];
  const postLogoutRedirects = associations.includes("postLogoutRedirects")
    ? ((await entity.getPostLogoutRedirects()) || []).map((e) => e.redirectUrl)
    : [];
  const grantTypes = associations.includes("grantTypes")
    ? ((await entity.getGrantTypes()) || []).map((e) => e.grantType)
    : [];
  const responseTypes = associations.includes("responseTypes")
    ? ((await entity.getResponseTypes()) || []).map((e) => e.responseType)
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

const findAndCountAll = async (queryOptions) => {
  const optimisedOptions = removeLazyAssociations(queryOptions);
  const resultSet = await services.findAndCountAll({
    ...defaultQueryOpts,
    ...optimisedOptions,
  });
  return {
    services: await mapEntities(resultSet.rows, queryOptions),
    numberOfRecords: resultSet.count,
  };
};

const findAll = async (queryOptions) => {
  const optimisedOptions = removeLazyAssociations(queryOptions);
  const resultSet = await services.findAll({
    ...defaultQueryOpts,
    ...optimisedOptions,
  });
  return {
    services: await mapEntities(resultSet, queryOptions),
  };
};

const find = async (queryOptions) => {
  const optimisedOptions = removeLazyAssociations(queryOptions);
  const service = await services.findOne({
    ...defaultQueryOpts,
    ...optimisedOptions,
  });
  return mapEntity(service, queryOptions);
};

module.exports = {
  findAndCountAll,
  findAll,
  find,
  lazyLoadedServiceAssociations,
  unusedServiceFields,
};
