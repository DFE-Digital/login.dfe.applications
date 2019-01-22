const { mockRequest, mockResponse } = require('./expressMocks');
const { mockRepository, mockServiceEntity } = require('./repositoryMocks');

const mockLogger = () => {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
};

const mockConfig = (customConfig) => {
  return Object.assign({
    notifications: {
      connectionString: 'some-redis-connection-string',
    },
    database: {
      "host": "localhost",
      "name": "orgs",
      "username": "username",
      "password": "password",
      "dialect": "mssql",
      "schema": "dbo",
      "pool": {
        "max": 5,
        "min": 0
      }
    }
  }, customConfig);
};

module.exports = {
  mockRequest,
  mockResponse,
  mockRepository,
  mockServiceEntity,
  mockLogger,
  mockConfig
};
