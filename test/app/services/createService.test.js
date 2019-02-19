jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());
jest.mock('./../../../src/app/services/data', () => ({
  create: jest.fn(),
  addRedirectUri: jest.fn(),
  addPostLogoutRedirect: jest.fn(),
  addGrantType: jest.fn(),
  addResponseType: jest.fn(),
  addServiceParam: jest.fn(),
  find: jest.fn(),
}));

const { mockRequest, mockResponse } = require('./../../utils');
const { create, addRedirectUri, addPostLogoutRedirect, addGrantType, addResponseType, addServiceParam, find } = require('./../../../src/app/services/data');
const { Op } = require('sequelize');
const createService = require('./../../../src/app/services/createService');

const res = mockResponse();
const service = {
  name: 'service one',
  description: 'the first service',
  isExternalService: true,
  parentId: 'service-a',
  relyingParty: {
    client_id: 'service-1',
    client_secret: 'awesome-client-secret',
    api_secret: 'the-api-secret',
    token_endpoint_auth_method: 'client_secret_post',
    service_home: 'https://unit.test/start',
    postResetUrl: 'https://unit.test/auth/pwrs',
    redirect_uris: ['https://unit.test/auth/callback', 'https://unit.test2/auth/callback'],
    post_logout_redirect_uris: ['https://unit.test/signout/callback', 'https://unit.test2/signout/callback'],
    grant_types: ['authorization_code', 'refresh_token', 'implicit'],
    response_types: ['code', 'id_token'],
    params: {
      explicitConsent: 'true',
    },
  },
};
const id = 'new-service-1';
const createdService = Object.assign({}, service, id);

describe('when creating a service', () => {
  let req;

  beforeEach(() => {
    req = mockRequest({
      body: service
    });

    res.mockResetAll();

    create.mockReset().mockReturnValue(id);
    addRedirectUri.mockReset();
    addPostLogoutRedirect.mockReset();
    addGrantType.mockReset();
    addResponseType.mockReset();
    addServiceParam.mockReset();
    find.mockReset().mockImplementation((opts) => {
      let findId;
      if (opts.id) {
        findId = opts.id[Op.eq];
      } else if (opts.clientId) {
        findId = opts.clientId[Op.eq];
      }
      if (findId === id || findId === 'existing-client-id') {
        return createdService;
      }
      return undefined;
    });
  });

  it('then it should create the service', async () => {
    await createService(req, res);

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(service);
  });

  it('then it should create all redirect uris', async () => {
    await createService(req, res);

    expect(addRedirectUri).toHaveBeenCalledTimes(2);
    expect(addRedirectUri).toHaveBeenCalledWith(id, service.relyingParty.redirect_uris[0]);
    expect(addRedirectUri).toHaveBeenCalledWith(id, service.relyingParty.redirect_uris[1]);
  });

  it('then it should create all post logout redirect uris', async () => {
    await createService(req, res);

    expect(addPostLogoutRedirect).toHaveBeenCalledTimes(2);
    expect(addPostLogoutRedirect).toHaveBeenCalledWith(id, service.relyingParty.post_logout_redirect_uris[0]);
    expect(addPostLogoutRedirect).toHaveBeenCalledWith(id, service.relyingParty.post_logout_redirect_uris[1]);
  });

  it('then it should create all grant types', async () => {
    await createService(req, res);

    expect(addGrantType).toHaveBeenCalledTimes(3);
    expect(addGrantType).toHaveBeenCalledWith(id, service.relyingParty.grant_types[0]);
    expect(addGrantType).toHaveBeenCalledWith(id, service.relyingParty.grant_types[1]);
    expect(addGrantType).toHaveBeenCalledWith(id, service.relyingParty.grant_types[2]);
  });

  it('then it should create all response types', async () => {
    await createService(req, res);

    expect(addResponseType).toHaveBeenCalledTimes(2);
    expect(addResponseType).toHaveBeenCalledWith(id, service.relyingParty.response_types[0]);
    expect(addResponseType).toHaveBeenCalledWith(id, service.relyingParty.response_types[1]);
  });

  it('then it should create all service params', async () => {
    await createService(req, res);

    expect(addServiceParam).toHaveBeenCalledTimes(1);
    expect(addServiceParam).toHaveBeenCalledWith(id, 'explicitConsent', service.relyingParty.params.explicitConsent);
  });

  it('then it should find and return the newly created service', async () => {
    await createService(req, res);

    expect(find).toHaveBeenCalledTimes(2); // One of these from checking if client id already in use
    expect(find).toHaveBeenCalledWith({
      id: {
        [Op.eq]: id,
      },
    });
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(createdService);
  });

  it('then it should return bad request if request missing name', async () => {
    req.body = Object.assign({}, service, { name: undefined });

    await createService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      reasons: ['Must provide name'],
    });
  });

  it('then it should return bad request if request missing client id', async () => {
    req.body = Object.assign({}, service, { relyingParty: Object.assign({}, service.relyingParty, { client_id: undefined }) });

    await createService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      reasons: ['Must provide relyingParty.client_id'],
    });
  });

  it('then it should return bad request if client id is uuid', async () => {
    req.body = Object.assign({}, service, { relyingParty: Object.assign({}, service.relyingParty, { client_id: '020840b2-8e78-4e8c-a09c-e38e8cdd78d1' }) });

    await createService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      reasons: ['relyingParty.client_id cannot be an UUID'],
    });
  });

  it('then it should return bad request if client id is already in use', async () => {
    req.body = Object.assign({}, service, { relyingParty: Object.assign({}, service.relyingParty, { client_id: 'existing-client-id' }) });

    await createService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      reasons: ['relyingParty.client_id must be unique. existing-client-id is already assigned'],
    });
  });

  it('then it should return bad request if request missing client secret', async () => {
    req.body = Object.assign({}, service, { relyingParty: Object.assign({}, service.relyingParty, { client_secret: undefined }) });

    await createService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      reasons: ['Must provide relyingParty.client_secret'],
    });
  });

  it('then it should return bad request if client secret length less than 15 characters', async () => {
    req.body = Object.assign({}, service, { relyingParty: Object.assign({}, service.relyingParty, { client_secret: 'shortsecret' }) });

    await createService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      reasons: ['relyingParty.client_secret must be at least 15 characters'],
    });
  });

  it('then it should return bad request if request does not have at least 1 redirect uri', async () => {
    req.body = Object.assign({}, service, { relyingParty: Object.assign({}, service.relyingParty, { redirect_uris: undefined }) });

    await createService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      reasons: ['Must provide at least 1 relyingParty.redirect_uris'],
    });
  });

  it('then it should return bad request if request missing relyingParty', async () => {
    req.body = Object.assign({}, service, { relyingParty: undefined });

    await createService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      reasons: [
        'Must provide relyingParty.client_id',
        'Must provide relyingParty.client_secret',
        'Must provide at least 1 relyingParty.redirect_uris',
      ],
    });
  });
});
