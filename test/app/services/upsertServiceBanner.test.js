jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());

jest.mock('./../../../src/app/services/data', () => ({
  upsertServiceBanner: jest.fn(),
}));

jest.mock('./../../../src/infrastructure/config', () => require('./../../utils').mockConfig());

const { mockRequest, mockResponse } = require('./../../utils');
const { upsertServiceBanner } = require('./../../../src/app/services/data');
const upsertBanner = require('./../../../src/app/services/upsertServiceBanner');
const res = mockResponse();

describe('when upserting a banner for a service', () => {
  let req;
  let banner;

  beforeEach(() => {
    req = mockRequest({
      params: {
        id: 'serviceId',
      },
      body: {
        serviceId: 'serviceId',
        name: 'banner name',
        title: 'banner title',
        message: 'banner message',
        validFrom: '2019-01-01',
        validTo: '2019-01-02',
        createdAt: '2019-01-01',
        updatedAt: '2019-01-01',
        isActive: true,
      }
    });

    res.mockResetAll();

    banner = {
      id: 'bannerId',
      serviceId: 'serviceId',
      name: 'banner name',
      title: 'banner title',
      message: 'banner message',
      validFrom: '2019-01-01',
      validTo: '2019-01-02',
      createdAt: '2019-01-01',
      updatedAt: '2019-01-01',
      isActive: true,
    };
    upsertServiceBanner.mockReset().mockReturnValue(banner);
  });

  it('then it should create banner if no bannerId in body', async () => {
    await upsertBanner(req, res);

    expect(upsertServiceBanner).toHaveBeenCalledTimes(1);
    expect(upsertServiceBanner).toHaveBeenCalledWith(
      undefined,
      'serviceId',
      'banner name',
      'banner title',
      'banner message',
      '2019-01-01',
      '2019-01-02',
      true,
    );
  });

  it('then it should update banner if bannerId in body', async () => {
    req.body.id = 'bannerId';
    await upsertBanner(req, res);

    expect(upsertServiceBanner).toHaveBeenCalledTimes(1);
    expect(upsertServiceBanner).toHaveBeenCalledWith(
      'bannerId',
      'serviceId',
      'banner name',
      'banner title',
      'banner message',
      '2019-01-01',
      '2019-01-02',
      true,
    );
  });

  it('then it should return banner as json with accepted status', async () => {
    await upsertBanner(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(banner);
  });

  it('then it should return 400 status code if serviceId not provided', async () => {
    req.params.id = undefined;

    await upsertBanner(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      errors: [
        'serviceId must be specified',
      ],
    });
  });

  it('then it should return 400 status code if name not provided', async () => {
    req.body.name = undefined;

    await upsertBanner(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      errors: [
        'name must be specified',
      ],
    });
  });

  it('then it should return 400 status code if title not provided', async () => {
    req.body.title = undefined;

    await upsertBanner(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      errors: [
        'title must be specified',
      ],
    });
  });

  it('then it should return 400 status code if message not provided', async () => {
    req.body.message = undefined;

    await upsertBanner(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      errors: [
        'message must be specified',
      ],
    });
  });
});
