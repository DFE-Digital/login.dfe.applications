jest.mock("./../../../src/infrastructure/logger", () =>
  require("./../../utils").mockLogger(),
);

jest.mock("./../../../src/app/services/data", () => ({
  listServiceBanners: jest.fn(),
}));
jest.mock("./../../../src/infrastructure/config", () =>
  require("./../../utils").mockConfig(),
);

const { mockRequest, mockResponse } = require("./../../utils");
const { listServiceBanners } = require("./../../../src/app/services/data");
const listBannersForService = require("./../../../src/app/services/listServiceBanners");
const res = mockResponse();

describe("when listing banners for a service", () => {
  let req;
  let pageOfBanners;

  beforeEach(() => {
    req = mockRequest({
      params: {
        id: "serviceId",
      },
    });

    res.mockResetAll();

    pageOfBanners = {
      banners: [
        {
          id: "bannerId",
          serviceId: "serviceId",
          name: "banner name",
          title: "banner title",
          message: "banner message",
          validFrom: "2019-01-01",
          validTo: "2019-01-02",
          createdAt: "2019-01-01",
          updatedAt: "2019-01-01",
        },
      ],
      page: 1,
      numberOfPages: 1,
      totalNumberOfRecords: 1,
    };
    listServiceBanners.mockReset().mockReturnValue(pageOfBanners);
  });

  it("then it should return page of service banners json", async () => {
    await listBannersForService(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(pageOfBanners);
  });

  it("then it should get page of banners using default page and pageSize if not provided", async () => {
    await listBannersForService(req, res);

    expect(listServiceBanners).toHaveBeenCalledTimes(1);
    expect(listServiceBanners).toHaveBeenCalledWith("serviceId", 1, 25);
  });

  it("then it should get page of banners using provided page and pageSize if specified", async () => {
    req.query = {
      page: 2,
      pageSize: 1,
    };
    await listBannersForService(req, res);

    expect(listServiceBanners).toHaveBeenCalledTimes(1);
    expect(listServiceBanners).toHaveBeenCalledWith("serviceId", 2, 1);
  });

  it("then it should return bad request if page number not a number", async () => {
    req.query = {
      page: "not-a-number",
    };

    await listBannersForService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      error: "not-a-number is not a valid value for page. Expected a number",
    });
  });

  it("then it should return bad request if page size not a number", async () => {
    req.query = {
      pageSize: "not-a-number",
    };

    await listBannersForService(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      error:
        "not-a-number is not a valid value for pageSize. Expected a number",
    });
  });
});
