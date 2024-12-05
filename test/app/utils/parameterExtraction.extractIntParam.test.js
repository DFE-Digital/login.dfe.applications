const { mockRequest } = require("./../../utils");
const { InvalidInputError } = require("./../../../src/app/utils");
const {
  extractIntParam,
} = require("./../../../src/app/utils/paramterExtraction");

describe("when extracting an int param", () => {
  it("then it should return value from querystring if present", () => {
    const req = mockRequest({ query: { num: 100 } });

    const actual = extractIntParam(req, "num");

    expect(actual).toBe(100);
  });

  it("then it should return 0 if value not in querystring and no explicit default supplied", () => {
    const req = mockRequest();

    const actual = extractIntParam(req, "num");

    expect(actual).toBe(0);
  });

  it("then it should return default value if value not in querystring", () => {
    const req = mockRequest();

    const actual = extractIntParam(req, "num", 92);

    expect(actual).toBe(92);
  });

  it("then it should throw an InvalidInputError if value in querystring is not a number", () => {
    const req = mockRequest({ query: { num: "not_a_number" } });

    expect(() => extractIntParam(req, "num")).toThrowError(InvalidInputError);
  });
});
