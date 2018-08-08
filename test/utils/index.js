const { mockRequest, mockResponse } = require('./expressMocks');
const { mockRepository } = require('./repositoryMocks');

const mockLogger = () => {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
};

module.exports = {
  mockRequest,
  mockResponse,
  mockRepository,
  mockLogger,
};
