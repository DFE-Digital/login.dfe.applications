jest.mock("./../../../src/infrastructure/repository", () => {
  const { mockRepository, mockServiceEntity } = require("./../../utils");
  return mockRepository({
    services: [mockServiceEntity("svc1", "Service One", "")],
  });
});

jest.mock("./../../../src/infrastructure/logger", () =>
  require("./../../utils").mockLogger(),
);

const { Op } = require("sequelize");
const { mockRequest, mockResponse } = require("./../../utils");
const { services } = require("./../../../src/infrastructure/repository");
const getServicesById = require("./../../../src/app/services/getServiceById");

const res = mockResponse();

describe("when getting users of services", () => {
  let req;

  beforeEach(() => {
    req = mockRequest({
      params: {
        id: "5360944c-6ab5-458d-be6a-a5832e3a705b",
      },
    });

    res.mockResetAll();
  });

  it("then it should find by clientId", async () => {
    req.params.id = "gias";
    await getServicesById(req, res);
    expect(services.findOne).toHaveBeenCalledTimes(1);
    expect(services.findOne.mock.calls[0][0]).toEqual({
      order: [["name", "ASC"]],
      include: ["params", "assertions"],
      where: {
        clientId: {
          [Op.eq]: "gias",
        },
      },
    });
  });

  it("then it should find by id", async () => {
    const id = req.params.id;
    await getServicesById(req, res);
    expect(services.findOne).toHaveBeenCalledTimes(2);
    expect(services.findOne.mock.calls[0][0]).toEqual({
      order: [["name", "ASC"]],
      include: ["params", "assertions"],
      where: {
        id: {
          [Op.eq]: id,
        },
      },
    });
  });

  it("then it should send 404 response if no service defined", async () => {
    await getServicesById(req, res);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledTimes(1);
  });
});
