const { mockRequest } = require('./../../utils');
const { extractParam } = require('./../../../src/app/utils/paramterExtraction');

describe('when extracting a param', () => {
  it('then it should return value from querystring if present', () => {
    const req = mockRequest({ query: { search: 'stuff' } });

    const actual = extractParam(req, 'search');

    expect(actual).toBe('stuff');
  });

  it('then it should return undefined if value not in querystring and no explicit default supplied', () => {
    const req = mockRequest();

    const actual = extractParam(req, 'search');

    expect(actual).toBeUndefined();
  });

  it('then it should return default value if value not in querystring', () => {
    const req = mockRequest();

    const actual = extractParam(req, 'search', '*');

    expect(actual).toBe('*');
  });
});
