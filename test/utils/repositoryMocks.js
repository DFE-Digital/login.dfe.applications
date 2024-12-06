const { Op } = require("sequelize");

const mockTable = (allEntities, extraData = {}) => {
  const entity = {
    findAndCountAll: jest.fn().mockReturnValue({ rows: [], count: 0 }),
    findAll: jest.fn().mockReturnValue([]),
    findOne: jest.fn().mockReturnValue(null),
    rawAttributes: extraData.rawAttributes,
    associations: extraData.associations,
  };
  if (allEntities) {
    entity.findAndCountAll.mockImplementation((opts) => {
      let rows = [...allEntities];
      if (opts.offset) {
        rows = rows.splice(opts.offset);
      }
      if (opts.limit) {
        rows = rows.splice(0, opts.limit);
      }
      return Promise.resolve({
        rows,
        count: allEntities.length,
      });
    });
    entity.findAll.mockImplementation((opts) => {
      const matchingEntities = allEntities.filter((x) => {
        if (opts.where[Op.or]) {
          const orValues = opts.where[Op.or];
          const idIndex = typeof orValues[0].id !== "undefined" ? 0 : 1;
          const clientIdIndex =
            typeof orValues[0].clientId !== "undefined" ? 0 : 1;
          return (
            (x.id &&
              orValues[idIndex].id[Op.in].includes(x.id.toLowerCase())) ||
            (x.clientId &&
              orValues[clientIdIndex].clientId[Op.in].includes(
                x.clientId.toLowerCase(),
              ))
          );
        }
        if (opts.where.clientId) {
          return (
            x.clientId &&
            opts.where.clientId[Op.in].includes(x.clientId.toLowerCase())
          );
        }
        if (opts.where.id) {
          return x.id && opts.where.id[Op.in].includes(x.id.toLowerCase());
        }
        return false;
      });
      return [...new Set(matchingEntities)];
    });
    entity.findOne.mockImplementation((opts) => {
      return allEntities.find((x) => {
        if (opts.where.clientId) {
          return (
            x.clientId &&
            x.clientId.toLowerCase() === opts.where.clientId[Op.eq]
          );
        }
        if (opts.where.id) {
          return x.id && x.id.toLowerCase() === opts.where.id[Op.eq];
        }
        return undefined;
      });
    });
  }
  return entity;
};

const mockRepository = (opts) => {
  const { services, ...extraData } = opts || {};

  return {
    services: mockTable(services, extraData),
  };
};

const mockServiceEntity = (
  id,
  name,
  description,
  redirects = undefined,
  postLogoutRedirects = undefined,
  grantTypes = undefined,
  responseTypes = undefined,
  params = undefined,
  clientId = "",
  assertions = undefined,
) => {
  return {
    id: id,
    name: name,
    description: description,
    clientId: clientId,
    children: {
      redirects,
      postLogoutRedirects,
      grantTypes,
      responseTypes,
      params,
      assertions,
    },

    getRedirects: jest.fn().mockReturnValue(redirects),
    getPostLogoutRedirects: jest.fn().mockReturnValue(postLogoutRedirects),
    getGrantTypes: jest.fn().mockReturnValue(grantTypes),
    getResponseTypes: jest.fn().mockReturnValue(responseTypes),
    getParams: jest.fn().mockReturnValue(params),
    params,
    getAssertions: jest.fn().mockReturnValue(assertions),
    assertions,
  };
};

module.exports = {
  mockRepository,
  mockServiceEntity,
};
