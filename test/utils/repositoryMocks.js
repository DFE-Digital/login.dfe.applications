const mockTable = (allEntities) => {
  const entity = {
    findAndCountAll: jest.fn().mockReturnValue({ rows: [], count: 0 }),
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
  }
  return entity;
};
const mockRepository = (opts) => {
  const { services } = opts || {};

  return {
    services: mockTable(services),
  };
};

const mockServiceEntity = (id, name, description, redirects = undefined, postLogoutRedirects = undefined, grantTypes = undefined, responseTypes = undefined, params = undefined) => {
  return {
    id: id,
    name: name,
    description: description,

    children: { redirects, postLogoutRedirects, grantTypes, responseTypes, params },

    getRedirects: jest.fn().mockReturnValue(redirects),
    getPostLogoutRedirects: jest.fn().mockReturnValue(postLogoutRedirects),
    getGrantTypes: jest.fn().mockReturnValue(grantTypes),
    getResponseTypes: jest.fn().mockReturnValue(responseTypes),
    getParams: jest.fn().mockReturnValue(params),

    mockReset: function () {
      this.getRedirects.mockReset().mockReturnValue(children.redirects);
      this.getPostLogoutRedirects.mockReset().mockReturnValue(children.postLogoutRedirects);
      this.getGrantTypes.mockReset().mockReturnValue(children.grantTypes);
      this.getResponseTypes.mockReset().mockReturnValue(children.responseTypes);
      this.getParams.mockReset().mockReturnValue(children.params);
    },
  };
};

module.exports = {
  mockRepository,
  mockServiceEntity,
};