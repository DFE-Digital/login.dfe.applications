const mockTable = (allEntities) => {
  const entity = {
    findAndCountAll: jest.fn().mockReturnValue({ rows: [], count: 0 }),
    findOne: jest.fn().mockReturnValue(null),
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
    entity.findOne.mockImplementation((opts) => {
      return allEntities.find((x) => {
        if (opts.where.clientId) {
          return (x.clientId && x.clientId.toLowerCase() === opts.where.clientId)
        }
        if (opts.where.id) {
          return (x.id && x.id.toLowerCase() === opts.where.id)
        }
        return undefined;
      });
    });
  }
  return entity;
};

const mockRepository = (opts) => {
  const { services } = opts || {};

  return {
    services: mockTable(services),
  };
};

const mockServiceEntity = (id, name, description, redirects = undefined, postLogoutRedirects = undefined, grantTypes = undefined, responseTypes = undefined, params = undefined, clientId = '', assertions = undefined) => {
  return {
    id: id,
    name: name,
    description: description,
    clientId: clientId,
    children: { redirects, postLogoutRedirects, grantTypes, responseTypes, params, assertions },

    getRedirects: jest.fn().mockReturnValue(redirects),
    getPostLogoutRedirects: jest.fn().mockReturnValue(postLogoutRedirects),
    getGrantTypes: jest.fn().mockReturnValue(grantTypes),
    getResponseTypes: jest.fn().mockReturnValue(responseTypes),
    getParams: jest.fn().mockReturnValue(params),
    getAssertions: jest.fn().mockReturnValue(assertions),

    mockReset: function () {
      this.getRedirects.mockReset().mockReturnValue(children.redirects);
      this.getPostLogoutRedirects.mockReset().mockReturnValue(children.postLogoutRedirects);
      this.getGrantTypes.mockReset().mockReturnValue(children.grantTypes);
      this.getResponseTypes.mockReset().mockReturnValue(children.responseTypes);
      this.getParams.mockReset().mockReturnValue(children.params);
      this.getAssertions.mockReset().mockReturnValue(children.assertions);
    },
  };
};

module.exports = {
  mockRepository,
  mockServiceEntity,
};
