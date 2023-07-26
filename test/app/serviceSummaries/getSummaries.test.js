const mockUtils = require('../../utils');

jest.mock('./../../../src/infrastructure/repository', () => {
  const { mockRepository, mockServiceEntity } = mockUtils;
  return mockRepository({
    services: [
      mockServiceEntity('svc1', 'Service One', ''),
      mockServiceEntity('svc2', 'Service Two', ''),
      mockServiceEntity('svc3', 'Service Three', ''),
      mockServiceEntity('svc4', 'Service Four', ''),
      mockServiceEntity('svc5', 'Service Five', ''),
      mockServiceEntity('svc6', 'Service Six', ''),
      mockServiceEntity('svc7', 'Service Seven', ''),
      mockServiceEntity('svc8', 'Service Eight', ''),
      mockServiceEntity('svc9', 'Service Nine', ''),
    ],
  });
});
jest.mock('./../../../src/infrastructure/logger', () => mockUtils.mockLogger());

const { Op } = require('sequelize');
const { services } = require('../../../src/infrastructure/repository');
const getSummaries = require('../../../src/app/serviceSummaries/getSummaries');
const summaryData = require('../../../src/app/serviceSummaries/data');

let req;
const res = mockUtils.mockResponse();
const sharedBefore = () => {
  req = mockUtils.mockRequest({
    params: {
      id: '',
    },
    query: {
      fields: '',
    },
  });
  res.mockResetAll();
};

/*
Testing scenarios:

- When service IDs list is empty, then a 404 error is returned.
- When no services could be found, then a 404 error is returned.
- When fields are requested that are not part of the model, then a 400 error is returned.
- When no fields are requested, then all attributes/associations are contained in the query.
- When specific attribute fields are requested, then the attributes field of the query contains them.
- When specific association fields are requested, then the include field of the query contains them.
- When a mix of attribute and association fields are requested, then the include field of the query contains them.
*/
describe('When retrieving information for either one or multiple services', () => {
  beforeEach(() => sharedBefore());
});

/*
Testing scenarios:

- When there are more than 50 service IDs in the request, then a 413 error is returned.
- When there is a list of multiple UUIDs, then the queryOptions 'where' contains them using IN.
- When there is a list of multiple clientIDs, then the queryOptions 'where' contains them using IN.
- Where there is a mix of UUIDs and clientIDs, then the queryOptions 'where' contains both using OR/IN.
*/
describe('When retrieving information for multiple services', () => {
  beforeEach(() => sharedBefore());
});

/*
Testing scenarios:

- When a single UUID is requested, then the initial queryOptions 'where' contains it with an equals.
- When a single UUID is requested but not found, then a second query is made checking for a clientId (to match original getServiceById functionality).
- When a single clientId is requested, then the queryOptions 'where' contains it with an equals.
*/
describe('When retrieving information for one service', () => {
  beforeEach(() => sharedBefore());
});
