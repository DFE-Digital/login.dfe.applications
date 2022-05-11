jest.mock('./../../../src/infrastructure/repository', () => {
  const { mockRepository, mockServiceEntity } = require('../../utils');
  return mockRepository({
    services: [
      mockServiceEntity('svc1', 'Service One', '', true, false),
      mockServiceEntity('svc2', 'Service Two', '', true, false),
      mockServiceEntity('svc3', 'Service Three', '', true, true),
      mockServiceEntity('svc4', 'Service Four: ', '', false, true),
    ],
  });
});

jest.mock('./../../../src/infrastructure/logger', () => require('../../utils').mockLogger());

const { Op } = require('sequelize');
const { mockRequest, mockResponse } = require('../../utils');
const { services } = require('../../../src/infrastructure/repository');
const listIdOnlyServices = require('../../../src/app/services/listIdOnlyServices');
const servicesData = require('../../../src/app/services/data/index');

const res = mockResponse();

describe('When getting ID only services to show', () => {
  const req = mockRequest();

  it('then it should send a json response', async () => {
    await listIdOnlyServices(req, res);
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it('then it should query repository', async () => {
    await listIdOnlyServices(req, res);
    expect(services.findAll).toHaveBeenCalledTimes(1);
    expect(services.findAll).toHaveBeenCalledWith(
      {
        where: {
          [Op.and]: [
            { isIdOnlyService: true },
            { isHiddenService: false },
          ],
        },
        order: [
          ['name', 'ASC'],
        ],
      },
    );
  });
  it('then it should return only the ID only services to show', async () => {
    await listIdOnlyServices(req, res);
    console.log(res.json.mock.calls[0][0].idOnlyServices)
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json.mock.calls[0][0]).toMatchObject(
      {
        idOnlyServices: [
          {
            id: 'svc1',
            name: 'Service One',
            description: '',
            clientId: '',
            isExternalService: undefined,
            isMigrated: undefined,
            parentId: undefined,
            isIdOnlyService: true,
            isHiddenService: false
          },
          {
            id: 'svc2',
            name: 'Service Two',
            description: '',
            clientId: '',
            isExternalService: undefined,
            isMigrated: undefined,
            parentId: undefined,
            isIdOnlyService: true,
            isHiddenService: false
          }
        ]
      }
    )
  });
});
