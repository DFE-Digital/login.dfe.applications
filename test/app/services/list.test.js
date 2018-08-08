jest.mock('./../../../src/infrastructure/repository', () => require('./../../utils').mockRepository({
  services: [
    { id: 'svc1', name: 'Service One', description: '' },
    { id: 'svc2', name: 'Service Two', description: '' },
    { id: 'svc3', name: 'Service Three', description: '' },
    { id: 'svc4', name: 'Service Four', description: '' },
    { id: 'svc5', name: 'Service Five', description: '' },
    { id: 'svc6', name: 'Service Six', description: '' },
    { id: 'svc7', name: 'Service Seven', description: '' },
    { id: 'svc8', name: 'Service Eight', description: '' },
    { id: 'svc9', name: 'Service Nine', description: '' },
  ]
}));

const { mockRequest, mockResponse } = require('./../../utils');
const { services } = require('./../../../src/infrastructure/repository');
const list = require('./../../../src/app/services/list');

const res = mockResponse();

describe('when listing services', () => {
  let req;

  beforeEach(() => {
    req = mockRequest({
      query: {
        page: 3,
        pageSize: 3,
      },
    });

    res.mockResetAll();
  });

  it('then it should send a json response', async () => {
    await list(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it('then it should query repository with paging', async () => {
    await list(req, res);

    expect(services.findAndCountAll).toHaveBeenCalledTimes(1);
    expect(services.findAndCountAll).toHaveBeenCalledWith({
      order: [
        ['name', 'ASC'],
      ],
      limit: 3,
      offset: 6,
    });
  });

  it('then it should include paging information in response', async () => {
    await list(req, res);

    expect(res.json.mock.calls[0][0]).toMatchObject({
      page: 3,
      numberOfPages: 3,
      numberOfRecords: 9,
    });
  });

  it('then it should include page of services in response', async () => {
    await list(req, res);

    expect(res.json.mock.calls[0][0]).toMatchObject({
      services: [
        { id: 'svc7', name: 'Service Seven', description: '' },
        { id: 'svc8', name: 'Service Eight', description: '' },
        { id: 'svc9', name: 'Service Nine', description: '' },
      ],
    });
  });
});
