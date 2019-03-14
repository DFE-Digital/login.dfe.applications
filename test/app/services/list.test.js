jest.mock('./../../../src/infrastructure/repository', () => {
  const { mockRepository, mockServiceEntity } = require('./../../utils');
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
jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());

const { Op } = require('sequelize');
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

  it('then it should query repository with parent id condition if query param specified', async () => {
    req.query.parent = 'parent-1';

    await list(req, res);

    expect(services.findAndCountAll).toHaveBeenCalledTimes(1);
    expect(services.findAndCountAll).toHaveBeenCalledWith({
      where: {
        parentId: {
          [Op.eq]: 'parent-1',
        },
      },
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

  it('then it should send 400 response if specified page is invalid', async () => {
    req.query.page = 'not-a-number';

    await list(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      error: 'not-a-number is not a valid value for page. Expected a number'
    });
  });

  it('then it should send 400 response if specified pageSize is invalid', async () => {
    req.query.pageSize = 'not-a-number';

    await list(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      error: 'not-a-number is not a valid value for pageSize. Expected a number'
    });
  });
});
