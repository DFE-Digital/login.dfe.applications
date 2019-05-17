jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/app/services/data', () => ({
  destroy: jest.fn(),
  find: jest.fn(),
}));

const { mockRequest, mockResponse } = require('./../../utils');
const { destroy, find } = require('./../../../src/app/services/data');
const { Op } = require('sequelize');
const deleteService = require('./../../../src/app/services/deleteService');

const res = mockResponse();

const parentService = {
  id: 'service-a',
};
const childService = {
  id: 'service-b',
  parentId: parentService.id,
};

const services = [parentService, childService];

describe('when deleting a child service', () => {
  let req;

  beforeEach(() => {
    req = mockRequest({
      params: {
        id: 'service-b',
      }
    });

    res.mockResetAll();

    // destroy.mockReset().mockReturnValue(id);

    find.mockReset().mockImplementation((opts) => {
      let findId;
      if (opts.id) {
        findId = opts.id[Op.eq];
      } else if (opts.clientId) {
        findId = opts.clientId[Op.eq];
      }
      return services.find((s) => s.id === findId);
    });
  });

  it('then it should delete the service', async () => {
    await deleteService(req, res);

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(destroy).toHaveBeenCalledWith('service-b');
  });

  it('then it should retuen 404 request child service does not exist', async () => {
    req.params.id = 'rando-service-id';

    await deleteService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);

  });

  it('then it should return 400 if not a child service (no parent)', async () => {
    req.params.id = parentService.id;

    await deleteService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);

  });

});
