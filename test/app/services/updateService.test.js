
jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());

jest.mock('./../../../src/app/services/data', () => ({
  update: jest.fn(),
  find: jest.fn(),
  removeAllRedirectUris: jest.fn(),
  addRedirectUri: jest.fn(),
  removePostLogoutRedirects: jest.fn(),
  addPostLogoutRedirect: jest.fn(),
  removeGrantTypes: jest.fn(),
  addGrantType: jest.fn(),
  removeResponseTypes: jest.fn(),
  addResponseType: jest.fn(),
}));

jest.mock('./../../../src/infrastructure/config', () => require('./../../utils').mockConfig());


const {Op} = require('sequelize');
const { mockRequest, mockResponse } = require('./../../utils');
const { update, find, removeAllRedirectUris, addRedirectUri, removePostLogoutRedirects, addPostLogoutRedirect, removeGrantTypes, addGrantType, removeResponseTypes, addResponseType} = require('./../../../src/app/services/data');
const updateService = require('./../../../src/app/services/updateService');

const res = mockResponse();

describe('when updating a service', () => {
  let req;

  beforeEach(() => {
    req = mockRequest({
      params: {
        id: 'svc1',
      },
      body: {
        name: 'Key to success (KtS)',
        description: 'A searchable',
        clientId: 'clientid',
        clientSecret: 'secret',
        apiSecret: 'secret',
        serviceHome: 'https://www.home.com',
        postResetUrl: 'https://www.postreset.com',
        redirect_uris: [
          'https://www.unit.test'
        ],
        post_logout_redirect_uris: [
          'https://www.redirect.com'
        ],
        grant_types: [
          'implicit'
        ],
        response_types: [
          'code'
        ],
      }
    });
    addResponseType.mockReset();
    removeResponseTypes.mockReset();
    addRedirectUri.mockReset();
    removeAllRedirectUris.mockReset();
    addPostLogoutRedirect.mockReset();
    removePostLogoutRedirects.mockReset();
    addGrantType.mockReset();
    removeGrantTypes.mockReset();
    update.mockReset();
    find.mockReset().mockReturnValue({
      id:'svc1',
      name: 'Service One',
      description: ''
    });

    res.mockResetAll();
  });

  it('then it should find by id', async () => {
    const id = req.params.id;
    await updateService(req, res);
    expect(find).toHaveBeenCalledTimes(1);
    expect(find.mock.calls[0][0]).toEqual({
        id: {
          [Op.eq]: id
        }
    });
  });

  it('then it should send 404 response if no service defined', async () => {
    find.mockReset().mockReturnValue(null);

    await updateService(req, res);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });


  it('then it should send 400 response if redirect_uris specified but not an array', async () => {
    req.body.redirect_uris = 'not-array';

    await updateService(req, res);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual('redirect_uris must be an array');
  });

  it('then it should send 400 response if post_logout_redirect_uris specified but not an array', async () => {
    req.body.post_logout_redirect_uris = 'not-array';

    await updateService(req, res);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual('post_logout_redirect_uris must be an array');
  });

  it('then it should send 400 response if grant_types specified but not an array', async () => {
    req.body.grant_types = 'not-array';

    await updateService(req, res);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual('grant_types must be an array');
  });

  it('then it should send 400 response if response_types specified but not an array', async () => {
    req.body.response_types = 'not-array';

    await updateService(req, res);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual('response_types must be an array');
  });

  it('then it should send 400 response if non patchable property is passed', async () => {
    req.body.notPatchable = 'not-array';

    await updateService(req, res);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send.mock.calls[0][0]).toEqual('notPatchable is not a patchable property. Patchable properties name,description,clientId,apiSecret,clientSecret,serviceHome,redirect_uris,post_logout_redirect_uris,grant_types,response_types,postResetUrl');
  });

  it('then it should remove existing redirect_uris if new redirect_uris specified', async () => {
    await updateService(req, res);

    expect(removeAllRedirectUris).toHaveBeenCalledTimes(1);
    expect(removeAllRedirectUris).toHaveBeenCalledWith(req.params.id);
  });

  it('then it should add new redirect_uris if specified', async () => {
    await updateService(req, res);

    expect(addRedirectUri).toHaveBeenCalledTimes(1);
    expect(addRedirectUri).toHaveBeenCalledWith(req.params.id, 'https://www.unit.test');
  });

  it('then it should not attempt to remove or add redirect_uris if none specified', async () => {
    req.body.redirect_uris = undefined;

    await updateService(req, res);

    expect(removeAllRedirectUris).not.toHaveBeenCalled();
    expect(addRedirectUri).not.toHaveBeenCalled();
  });

  it('then it should remove existing post_logout_redirect_uris if new post_logout_redirect_uris specified', async () => {
    await updateService(req, res);

    expect(removePostLogoutRedirects).toHaveBeenCalledTimes(1);
    expect(removePostLogoutRedirects).toHaveBeenCalledWith(req.params.id);
  });

  it('then it should add new post_logout_redirect_uris if specified', async () => {
    await updateService(req, res);

    expect(addPostLogoutRedirect).toHaveBeenCalledTimes(1);
    expect(addPostLogoutRedirect).toHaveBeenCalledWith(req.params.id, 'https://www.redirect.com');
  });

  it('then it should not attempt to remove or add post_logout_redirect_uris if none specified', async () => {
    req.body.post_logout_redirect_uris = undefined;

    await updateService(req, res);

    expect(removePostLogoutRedirects).not.toHaveBeenCalled();
    expect(addPostLogoutRedirect).not.toHaveBeenCalled();
  });

  it('then it should remove existing grant_types if new grant_types specified', async () => {
    await updateService(req, res);

    expect(removeGrantTypes).toHaveBeenCalledTimes(1);
    expect(removeResponseTypes).toHaveBeenCalledWith(req.params.id);
  });

  it('then it should add new grant_types if specified', async () => {
    await updateService(req, res);

    expect(addGrantType).toHaveBeenCalledTimes(1);
    expect(addGrantType).toHaveBeenCalledWith(req.params.id, 'implicit');
  });

  it('then it should not attempt to remove or add grant_types if none specified', async () => {
    req.body.grant_types = undefined;

    await updateService(req, res);

    expect(removeGrantTypes).not.toHaveBeenCalled();
    expect(addGrantType).not.toHaveBeenCalled();
  });

  it('then it should remove existing response_types if new response_types specified', async () => {
    await updateService(req, res);

    expect(removeResponseTypes).toHaveBeenCalledTimes(1);
    expect(removeResponseTypes).toHaveBeenCalledWith(req.params.id);
  });

  it('then it should add new response_types if specified', async () => {
    await updateService(req, res);

    expect(addResponseType).toHaveBeenCalledTimes(1);
    expect(addResponseType).toHaveBeenCalledWith(req.params.id, 'code');
  });

  it('then it should not attempt to remove or add response_types if none specified', async () => {
    req.body.response_types = undefined;

    await updateService(req, res);

    expect(removeResponseTypes).not.toHaveBeenCalled();
    expect(addResponseType).not.toHaveBeenCalled();
  });

  it('then it should return 202 status code', async () => {
    await updateService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.send).toHaveBeenCalledTimes(1);
  });




});



