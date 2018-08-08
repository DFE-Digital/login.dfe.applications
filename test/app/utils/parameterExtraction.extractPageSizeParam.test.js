const { mockRequest } = require('./../../utils');
const { InvalidInputError } = require('./../../../src/app/utils');
const { extractPageSizeParam } = require('./../../../src/app/utils/paramterExtraction');

describe('when extracting pageSize param', () => {
  it('then it should return pageSize value from querystring if present', () => {
    const req = mockRequest({ query: { pageSize: 100 } });

    const actual = extractPageSizeParam(req);

    expect(actual).toBe(100);
  });

  it('then it should return 1 if pageSize not in querystring', () => {
    const req = mockRequest();

    const actual = extractPageSizeParam(req);

    expect(actual).toBe(25);
  });

  it('then it should throw an InvalidInputError if pageSize in querystring is not a number', () => {
    const req = mockRequest({ query: { pageSize: 'not_a_number' } });

    expect(() => extractPageSizeParam(req)).toThrowError(InvalidInputError);
  });
});
