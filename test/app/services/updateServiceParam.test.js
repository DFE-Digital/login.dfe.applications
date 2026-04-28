jest.mock("./../../../src/infrastructure/logger", () =>
  require("./../../utils").mockLogger(),
);

jest.mock("./../../../src/app/services/data", () => ({
  find: jest.fn(),
  findServiceParam: jest.fn(),
  updateServiceParamValue: jest.fn(),
}));

jest.mock("./../../../src/infrastructure/config", () =>
  require("./../../utils").mockConfig(),
);

const { Op } = require("sequelize");
const { mockRequest, mockResponse } = require("./../../utils");
const {
  find,
  findServiceParam,
  updateServiceParamValue,
} = require("./../../../src/app/services/data");
const updateServiceParam = require("./../../../src/app/services/updateServiceParam");

const res = mockResponse();

const SERVICE_ID = "5360944c-6ab5-458d-be6a-a5832e3a705b";
const PARAM_NAME = "hideApprover";
const PARAM_VALUE = "true";

describe("when updating a service param", () => {
  let req;

  beforeEach(() => {
    req = mockRequest({
      params: {
        id: SERVICE_ID,
        key: PARAM_NAME,
      },
      body: {
        paramName: PARAM_NAME,
        paramValue: PARAM_VALUE,
      },
    });

    find
      .mockReset()
      .mockResolvedValue({ id: SERVICE_ID, name: "Test Service" });
    findServiceParam.mockReset().mockResolvedValue({
      serviceId: SERVICE_ID,
      paramName: PARAM_NAME,
      paramValue: "false",
    });
    updateServiceParamValue.mockReset().mockResolvedValue();

    res.mockResetAll();
  });

  describe("happy path", () => {
    it("should return 200 with updated param when service and param exist", async () => {
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        serviceId: SERVICE_ID,
        paramName: PARAM_NAME,
        paramValue: PARAM_VALUE,
      });
    });

    it("should call updateServiceParamValue with correct args", async () => {
      await updateServiceParam(req, res);
      expect(updateServiceParamValue).toHaveBeenCalledWith(
        SERVICE_ID,
        PARAM_NAME,
        PARAM_VALUE,
      );
    });

    it("should find service by id", async () => {
      await updateServiceParam(req, res);
      expect(find).toHaveBeenCalledWith({ id: { [Op.eq]: SERVICE_ID } });
    });

    it("should return 200 for hideSupport param", async () => {
      req.params.key = "hideSupport";
      req.body = { paramName: "hideSupport", paramValue: "false" };
      findServiceParam.mockResolvedValue({
        serviceId: SERVICE_ID,
        paramName: "hideSupport",
        paramValue: "true",
      });
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        serviceId: SERVICE_ID,
        paramName: "hideSupport",
        paramValue: "false",
      });
    });

    it("should return 200 for helpHidden param", async () => {
      req.params.key = "helpHidden";
      req.body = { paramName: "helpHidden", paramValue: "true" };
      findServiceParam.mockResolvedValue({
        serviceId: SERVICE_ID,
        paramName: "helpHidden",
        paramValue: "false",
      });
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("404 cases", () => {
    it("should return 404 when service does not exist", async () => {
      find.mockResolvedValue(null);
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    it("should not call findServiceParam when service does not exist", async () => {
      find.mockResolvedValue(null);
      await updateServiceParam(req, res);
      expect(findServiceParam).not.toHaveBeenCalled();
    });

    it("should return 404 when param does not exist for the service", async () => {
      findServiceParam.mockResolvedValue(null);
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledTimes(1);
    });

    it("should not call updateServiceParamValue when param does not exist", async () => {
      findServiceParam.mockResolvedValue(null);
      await updateServiceParam(req, res);
      expect(updateServiceParamValue).not.toHaveBeenCalled();
    });
  });

  describe("400 cases - body validation", () => {
    it("should return 400 when paramName is missing from body", async () => {
      req.body = { paramValue: PARAM_VALUE };
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 when paramName is an empty string", async () => {
      req.body = { paramName: "", paramValue: PARAM_VALUE };
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 when paramValue is missing from body", async () => {
      req.body = { paramName: PARAM_NAME };
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 when URL key does not match body paramName", async () => {
      req.body = { paramName: "differentParam", paramValue: PARAM_VALUE };
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("400 cases - boolean param validation", () => {
    const booleanParams = [
      "hideSupport",
      "hideApprover",
      "helpHidden",
      "allowManageInvite",
    ];

    booleanParams.forEach((param) => {
      it(`should return 400 for ${param} when value is boolean true`, async () => {
        req.params.key = param;
        req.body = { paramName: param, paramValue: true };
        findServiceParam.mockResolvedValue({
          serviceId: SERVICE_ID,
          paramName: param,
          paramValue: "false",
        });
        await updateServiceParam(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it(`should return 400 for ${param} when value is boolean false`, async () => {
        req.params.key = param;
        req.body = { paramName: param, paramValue: false };
        findServiceParam.mockResolvedValue({
          serviceId: SERVICE_ID,
          paramName: param,
          paramValue: "true",
        });
        await updateServiceParam(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it(`should return 400 for ${param} when value is 1`, async () => {
        req.params.key = param;
        req.body = { paramName: param, paramValue: 1 };
        findServiceParam.mockResolvedValue({
          serviceId: SERVICE_ID,
          paramName: param,
          paramValue: "false",
        });
        await updateServiceParam(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it(`should return 400 for ${param} when value is 0`, async () => {
        req.params.key = param;
        req.body = { paramName: param, paramValue: 0 };
        findServiceParam.mockResolvedValue({
          serviceId: SERVICE_ID,
          paramName: param,
          paramValue: "true",
        });
        await updateServiceParam(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it(`should return 400 for ${param} when value is 'yes'`, async () => {
        req.params.key = param;
        req.body = { paramName: param, paramValue: "yes" };
        findServiceParam.mockResolvedValue({
          serviceId: SERVICE_ID,
          paramName: param,
          paramValue: "false",
        });
        await updateServiceParam(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
      });
    });
  });

  describe("400 cases - URL param validation", () => {
    it("should return 400 for wsWsdlUrl when value is not a valid URL", async () => {
      req.params.key = "wsWsdlUrl";
      req.body = { paramName: "wsWsdlUrl", paramValue: "not-a-url" };
      findServiceParam.mockResolvedValue({
        serviceId: SERVICE_ID,
        paramName: "wsWsdlUrl",
        paramValue: "https://example.com",
      });
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 200 for wsWsdlUrl when value is a valid URL", async () => {
      req.params.key = "wsWsdlUrl";
      req.body = {
        paramName: "wsWsdlUrl",
        paramValue: "https://example.com/service.wsdl",
      };
      findServiceParam.mockResolvedValue({
        serviceId: SERVICE_ID,
        paramName: "wsWsdlUrl",
        paramValue: "https://old.com",
      });
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("400 cases - UUID param validation", () => {
    it("should return 400 for serviceId paramName when value is not a valid UUID", async () => {
      req.params.key = "serviceId";
      req.body = { paramName: "serviceId", paramValue: "not-a-uuid" };
      findServiceParam.mockResolvedValue({
        serviceId: SERVICE_ID,
        paramName: "serviceId",
        paramValue: SERVICE_ID,
      });
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 200 for serviceId paramName when value is a valid UUID", async () => {
      const newUuid = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
      req.params.key = "serviceId";
      req.body = { paramName: "serviceId", paramValue: newUuid };
      findServiceParam.mockResolvedValue({
        serviceId: SERVICE_ID,
        paramName: "serviceId",
        paramValue: SERVICE_ID,
      });
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("400 cases - roleSelectionConstraint validation", () => {
    it("should return 400 when roleSelectionConstraint is not a comma-separated list of UUIDs", async () => {
      req.params.key = "roleSelectionConstraint";
      req.body = {
        paramName: "roleSelectionConstraint",
        paramValue: "not-uuids,also-not",
      };
      findServiceParam.mockResolvedValue({
        serviceId: SERVICE_ID,
        paramName: "roleSelectionConstraint",
        paramValue: SERVICE_ID,
      });
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 when roleSelectionConstraint has one invalid UUID among valid ones", async () => {
      const validUuid = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
      req.params.key = "roleSelectionConstraint";
      req.body = {
        paramName: "roleSelectionConstraint",
        paramValue: `${validUuid},not-a-uuid`,
      };
      findServiceParam.mockResolvedValue({
        serviceId: SERVICE_ID,
        paramName: "roleSelectionConstraint",
        paramValue: validUuid,
      });
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 200 when roleSelectionConstraint is a valid comma-separated list of UUIDs", async () => {
      const uuid1 = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
      const uuid2 = "b2c3d4e5-f6a7-8901-bcde-f12345678901";
      req.params.key = "roleSelectionConstraint";
      req.body = {
        paramName: "roleSelectionConstraint",
        paramValue: `${uuid1},${uuid2}`,
      };
      findServiceParam.mockResolvedValue({
        serviceId: SERVICE_ID,
        paramName: "roleSelectionConstraint",
        paramValue: uuid1,
      });
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("400 cases - numeric param validation", () => {
    it("should return 400 for maximumRolesAllowed when value is not numeric", async () => {
      req.params.key = "maximumRolesAllowed";
      req.body = { paramName: "maximumRolesAllowed", paramValue: "abc" };
      findServiceParam.mockResolvedValue({
        serviceId: SERVICE_ID,
        paramName: "maximumRolesAllowed",
        paramValue: "5",
      });
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 for minimumRolesRequired when value is not numeric", async () => {
      req.params.key = "minimumRolesRequired";
      req.body = { paramName: "minimumRolesRequired", paramValue: "abc" };
      findServiceParam.mockResolvedValue({
        serviceId: SERVICE_ID,
        paramName: "minimumRolesRequired",
        paramValue: "1",
      });
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 200 for maximumRolesAllowed when value is numeric", async () => {
      req.params.key = "maximumRolesAllowed";
      req.body = { paramName: "maximumRolesAllowed", paramValue: "10" };
      findServiceParam.mockResolvedValue({
        serviceId: SERVICE_ID,
        paramName: "maximumRolesAllowed",
        paramValue: "5",
      });
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 200 for minimumRolesRequired when value is numeric", async () => {
      req.params.key = "minimumRolesRequired";
      req.body = { paramName: "minimumRolesRequired", paramValue: "2" };
      findServiceParam.mockResolvedValue({
        serviceId: SERVICE_ID,
        paramName: "minimumRolesRequired",
        paramValue: "1",
      });
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("other params", () => {
    it("should accept any string value for unknown param names", async () => {
      req.params.key = "someCustomParam";
      req.body = { paramName: "someCustomParam", paramValue: "any value here" };
      findServiceParam.mockResolvedValue({
        serviceId: SERVICE_ID,
        paramName: "someCustomParam",
        paramValue: "old value",
      });
      await updateServiceParam(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
