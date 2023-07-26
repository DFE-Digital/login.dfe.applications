const mockRequest = (customRequest = undefined) => {
  const request = Object.assign({
    get: jest.fn(),
    correlationId: 'unit-tests',
    query: {},
  }, customRequest);
  return request;
};

const mockResponse = (customResponse = undefined) => {
  const response = Object.assign({
    send: jest.fn(),
    status: jest.fn(),
    json: jest.fn(),
    contentType: jest.fn(),
    statusMessage: '',
  }, customResponse);
  response.mockResetAll = function () {
    this.send.mockReset().mockReturnValue(this);
    this.status.mockReset().mockReturnValue(this);
    this.json.mockReset().mockReturnValue(this);
    this.contentType.mockReset().mockReturnValue(this);
  };
  response.mockResetAll();
  return response;
};

module.exports = {
  mockRequest,
  mockResponse,
};
