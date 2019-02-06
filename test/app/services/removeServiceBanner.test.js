jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());

jest.mock('./../../../src/app/services/data', () => ({
  removeServiceBanner: jest.fn(),
}));

const { removeServiceBanner } = require('./../../../src/app/services/data');
const deleteServiceBanner = require('./../../../src/app/services/removeServiceBanner');
const { mockRequest, mockResponse } = require('./../../utils');
const res = mockResponse();

describe('when deleting a service banner', () => {
  let req;
  beforeEach(() => {
    req = mockRequest({
      params: {
        id: 'serviceId',
        bid: 'bannerId',
      },
    });
    removeServiceBanner.mockReset();
  });

  it('then it should delete service banner', async () => {
    await deleteServiceBanner(req, res);
    expect(removeServiceBanner).toHaveBeenCalledTimes(1);
    expect(removeServiceBanner.mock.calls[0][0]).toBe('serviceId');
    expect(removeServiceBanner.mock.calls[0][1]).toBe('bannerId');
  });
  
});
