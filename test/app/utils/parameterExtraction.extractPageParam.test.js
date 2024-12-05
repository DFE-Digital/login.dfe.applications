const { mockRequest } = require("./../../utils");
const { InvalidInputError } = require("./../../../src/app/utils");
const {
  extractPageParam,
} = require("./../../../src/app/utils/paramterExtraction");

describe("when extracting page param", () => {
  it("then it should return page value from querystring if present", () => {
    const req = mockRequest({ query: { page: 3 } });

    const actual = extractPageParam(req);

    expect(actual).toBe(3);
  });

  it("then it should return 1 if page not in querystring", () => {
    const req = mockRequest();

    const actual = extractPageParam(req);

    expect(actual).toBe(1);
  });

  it("then it should throw an InvalidInputError if page in querystring is not a number", () => {
    const req = mockRequest({ query: { page: "not_a_number" } });

    expect(() => extractPageParam(req)).toThrowError(InvalidInputError);
  });
});
