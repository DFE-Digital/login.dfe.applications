const mockUtils = require('../../utils');

jest.mock('./../../../src/infrastructure/repository', () => {
  const { mockRepository, mockServiceEntity } = mockUtils;

  const redirects = [
    { serviceId: 'test', redirectUrl: 'https://testing1.com' },
    { serviceId: 'test', redirectUrl: 'https://testing2.com' },
  ];
  const grants = [{ serviceId: 'test', grantType: 'authorization_code' }];
  const response = [{ serviceId: 'test', responseType: 'code' }];
  const params = [
    { serviceId: 'test', paramName: 'serviceId', paramValue: 'test' },
    { serviceId: 'test', paramName: 'allowManageInvite', paramValue: 'true' },
  ];
  const assertions = [
    {
      id: '1', serviceId: 'test', typeUrn: 'LogonName', value: '__k2s-id__',
    },
    {
      id: '1', serviceId: 'test', typeUrn: 'EmailAddress', value: '__user.email__',
    },
  ];

  return mockRepository({
    services: [
      mockServiceEntity('c5a04382-c972-4ac7-b42a-755a6b41b0de', 'Service One', 'Test', redirects, [], grants, response, params, 'svc1', []),
      mockServiceEntity('2dd5ba2c-1616-4100-9629-c11df1f2b77f', 'Service Two', 'Test', [], redirects, grants, response, params, 'svc2', []),
      mockServiceEntity('db6071bb-ef09-4b4b-b2a7-479236c307b3', 'Service Three', 'Test', redirects, redirects, grants, response, params, 'svc3', assertions),
      mockServiceEntity('fc035093-e1a8-4acf-95bc-2d455e83376c', 'Service Four', 'Test', redirects, [], grants, response, [], 'svc4', []),
      mockServiceEntity('8fda7e47-102f-45f0-ad59-da2d1d17a2e9', 'Service Five', 'Test', [], redirects, grants, response, [], 'svc5', []),
      mockServiceEntity('58efd928-23a1-42bc-915f-1083663a8c88', 'Service Six', 'Test', redirects, redirects, grants, response, [], 'svc6', assertions),
      mockServiceEntity('740194f3-2a59-4170-9541-61a366952e30', 'Service Seven', 'Test', redirects, [], grants, response, params, 'svc7', []),
      mockServiceEntity('a73630bc-afa0-4471-b1a3-f3e874d2c081', 'Service Eight', 'Test', [], redirects, grants, response, params, 'svc8', []),
      mockServiceEntity('6f66c408-aeda-4c4b-92ea-3fa5e0b4a4f6', 'Service Nine', 'Test', redirects, redirects, grants, response, params, 'svc9', assertions),
    ],
    rawAttributes: {
      id: {},
      name: {},
      description: {},
      clientId: {},
      clientSecret: {},
      apiSecret: {},
      tokenEndpointAuthMethod: {},
      serviceHome: {},
      postResetUrl: {},
      isMigrated: {},
      isChildService: {},
      isExternalService: {},
      parentId: {},
    },
    associations: {
      redirects: {},
      postLogoutRedirects: {},
      grantTypes: {},
      responseTypes: {},
      params: {},
      assertions: {},
      banners: {},
      grants: {},
    },
  });
});
jest.mock('./../../../src/infrastructure/logger', () => mockUtils.mockLogger());

const { Op } = require('sequelize');
const { services } = require('../../../src/infrastructure/repository');
const getSummaries = require('../../../src/app/serviceSummaries/getSummaries');
const summaryData = require('../../../src/app/serviceSummaries/data');

let req;
const res = mockUtils.mockResponse();
const sharedBefore = (single) => {
  req = mockUtils.mockRequest({
    params: {
      ids: single ? 'c5a04382-c972-4ac7-b42a-755a6b41b0de'
        : 'c5a04382-c972-4ac7-b42a-755a6b41b0de,8fda7e47-102f-45f0-ad59-da2d1d17a2e9,6f66c408-aeda-4c4b-92ea-3fa5e0b4a4f6',
    },
    query: {
      fields: '',
    },
  });
  res.mockResetAll();
};

const getAllowedFields = () => {
  const hiddenFields = ['banners', 'grants', 'isChildService'];
  const serviceAttributes = Object.keys(services.rawAttributes);
  const serviceAssociations = Object.keys(services.associations);
  return serviceAttributes.concat(serviceAssociations).filter((field) => !hiddenFields.includes(field));
};

/*
Testing scenarios:

- When service IDs list is empty, then a 404 error is returned.
- When no services could be found, then a 404 error is returned.
- When fields are requested that are not part of the model, then a 400 error is returned.
- When no fields are requested, then all attributes/associations are contained in the query.
- When specific attribute fields are requested, then the attributes field of the query contains them.
- When specific association fields are requested, then the include field of the query contains them.
- When a mix of attribute and association fields are requested, then the include field of the query contains them.
*/
describe('When retrieving information for either one or multiple services', () => {
  beforeEach(() => sharedBefore(true));

  it('returns a 404 response status if the IDs param is empty', async () => {
    req.params.ids = '';
    await getSummaries(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.statusMessage).toBe('No service IDs were requested.');
  });

  it('returns a 404 response status if no matching service could be found', async () => {
    req.params.ids = 'd6a04382-c972-4ac7-b42a-755a6b41b0ef';
    await getSummaries(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns a 400 response status if one requested field does not exist', async () => {
    const invalidField = 'colour';
    req.query.fields = `id,name,description,${invalidField}`;
    await getSummaries(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.statusMessage).toBe(
      `Invalid fields used: ${invalidField}! Allowed fields: ${getAllowedFields().join()}`,
    );
  });

  it('returns a 400 response status if multiple requested fields do not exist', async () => {
    const invalidFields = ['colour', 'shape'];
    req.query.fields = `id,name,description,${invalidFields.join()}`;
    await getSummaries(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.statusMessage).toBe(
      `Invalid fields used: ${invalidFields.join()}! Allowed fields: ${getAllowedFields().join()}`,
    );
  });
});

/*
Testing scenarios:

- When there are more than 50 service IDs in the request, then a 413 error is returned.
- When there is a list of multiple UUIDs, then the queryOptions 'where' contains them using IN.
- When there is a list of multiple clientIDs, then the queryOptions 'where' contains them using IN.
- Where there is a mix of UUIDs and clientIDs, then the queryOptions 'where' contains both using OR/IN.
*/
describe('When retrieving information for multiple services', () => {
  beforeEach(() => sharedBefore(false));
});

/*
Testing scenarios:

- When a single UUID is requested, then the initial queryOptions 'where' contains it with an equals.
- When a single UUID is requested but not found, then a second query is made checking for a clientId (to match original getServiceById functionality).
- When a single clientId is requested, then the queryOptions 'where' contains it with an equals.
*/
describe('When retrieving information for one service', () => {
  beforeEach(() => sharedBefore(true));
});
