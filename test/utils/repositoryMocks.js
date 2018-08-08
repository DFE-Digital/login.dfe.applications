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

module.exports = {
  mockRepository,
};