/**
 * Tests for the computed visibility fields added to mapEntity in
 * src/app/services/data/index.js:
 *   isHiddenForApprover, isHiddenForSupport, isHiddenForHelp
 *
 * mapEntity is not exported directly, so we test via find().
 */

const makeEntity = (overrides = {}) => {
  const base = {
    id: "test-svc-1",
    name: "Test Service",
    description: "A test service",
    clientId: "test-client",
    clientSecret: "test-secret-value",
    apiSecret: undefined,
    tokenEndpointAuthMethod: undefined,
    serviceHome: undefined,
    postResetUrl: undefined,
    isExternalService: false,
    isIdOnlyService: false,
    isHiddenService: false,
    isMigrated: true,
    parentId: undefined,
    params: [],
    assertions: [],
    getRedirects: jest.fn().mockResolvedValue([]),
    getPostLogoutRedirects: jest.fn().mockResolvedValue([]),
    getGrantTypes: jest.fn().mockResolvedValue([]),
    getResponseTypes: jest.fn().mockResolvedValue([]),
  };
  return Object.assign({}, base, overrides);
};

const makeParams = (obj) =>
  Object.entries(obj).map(([paramName, paramValue]) => ({
    paramName,
    paramValue,
  }));

// We mock the repository module before requiring the data layer.
// Do NOT use jest.requireActual here — the real repository asserts DB credentials on load.
jest.mock("./../../../../src/infrastructure/repository", () => ({
  services: {
    findOne: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    findAndCountAll: jest.fn().mockResolvedValue({ rows: [], count: 0 }),
    create: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn(),
  },
  serviceRedirects: { destroy: jest.fn(), create: jest.fn() },
  servicePostLogoutRedirects: { destroy: jest.fn(), create: jest.fn() },
  serviceGrantTypes: { destroy: jest.fn(), create: jest.fn() },
  serviceResponseTypes: { destroy: jest.fn(), create: jest.fn() },
  serviceBanners: {
    destroy: jest.fn(),
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
  },
  serviceParams: {
    destroy: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock("./../../../../src/infrastructure/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

const { services } = require("./../../../../src/infrastructure/repository");
const { find } = require("./../../../../src/app/services/data");

describe("mapEntity — computed visibility fields", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Role-based service (isIdOnlyService = false) ──────────────────────────

  describe("role-based service (isIdOnlyService = false)", () => {
    it("isHiddenForApprover=true when hideApprover='true' (string)", async () => {
      services.findOne.mockResolvedValue(
        makeEntity({ params: makeParams({ hideApprover: "true" }) }),
      );
      const result = await find({});
      expect(result.isHiddenForApprover).toBe(true);
      expect(result.isHiddenForSupport).toBe(false);
      expect(result.isHiddenForHelp).toBe(false);
    });

    it("isHiddenForSupport=true when hideSupport='true' (string)", async () => {
      services.findOne.mockResolvedValue(
        makeEntity({ params: makeParams({ hideSupport: "true" }) }),
      );
      const result = await find({});
      expect(result.isHiddenForApprover).toBe(false);
      expect(result.isHiddenForSupport).toBe(true);
      expect(result.isHiddenForHelp).toBe(false);
    });

    it("isHiddenForHelp=true when helpHidden='true' (string)", async () => {
      services.findOne.mockResolvedValue(
        makeEntity({ params: makeParams({ helpHidden: "true" }) }),
      );
      const result = await find({});
      expect(result.isHiddenForApprover).toBe(false);
      expect(result.isHiddenForSupport).toBe(false);
      expect(result.isHiddenForHelp).toBe(true);
    });

    it("integer 1 treated as truthy for all three (S6)", async () => {
      services.findOne.mockResolvedValue(
        makeEntity({
          params: makeParams({
            hideApprover: 1,
            hideSupport: 1,
            helpHidden: 1,
          }),
        }),
      );
      const result = await find({});
      expect(result.isHiddenForApprover).toBe(true);
      expect(result.isHiddenForSupport).toBe(true);
      expect(result.isHiddenForHelp).toBe(true);
    });

    it('treats string "1" as truthy for role-based hide params', async () => {
      services.findOne.mockResolvedValue(
        makeEntity({
          params: makeParams({
            hideApprover: "1",
            hideSupport: "1",
            helpHidden: "1",
          }),
        }),
      );
      const result = await find({});
      expect(result.isHiddenForApprover).toBe(true);
      expect(result.isHiddenForSupport).toBe(true);
      expect(result.isHiddenForHelp).toBe(true);
    });

    it("boolean true treated as truthy for all three", async () => {
      services.findOne.mockResolvedValue(
        makeEntity({
          params: makeParams({
            hideApprover: true,
            hideSupport: true,
            helpHidden: true,
          }),
        }),
      );
      const result = await find({});
      expect(result.isHiddenForApprover).toBe(true);
      expect(result.isHiddenForSupport).toBe(true);
      expect(result.isHiddenForHelp).toBe(true);
    });

    it("string 'false' treated as falsy — all three fields=false", async () => {
      services.findOne.mockResolvedValue(
        makeEntity({
          params: makeParams({
            hideApprover: "false",
            hideSupport: "false",
            helpHidden: "false",
          }),
        }),
      );
      const result = await find({});
      expect(result.isHiddenForApprover).toBe(false);
      expect(result.isHiddenForSupport).toBe(false);
      expect(result.isHiddenForHelp).toBe(false);
    });

    it("absent params (empty array) — all three fields=false", async () => {
      services.findOne.mockResolvedValue(makeEntity({ params: [] }));
      const result = await find({});
      expect(result.isHiddenForApprover).toBe(false);
      expect(result.isHiddenForSupport).toBe(false);
      expect(result.isHiddenForHelp).toBe(false);
    });
  });

  // ─── ID-only service (isIdOnlyService = true) ──────────────────────────────

  describe("ID-only service (isIdOnlyService = true)", () => {
    it("S0: all four flags=integer 1 → all three fields=true", async () => {
      services.findOne.mockResolvedValue(
        makeEntity({
          isIdOnlyService: true,
          isHiddenService: 1,
          params: makeParams({
            hideApprover: 1,
            hideSupport: 1,
            helpHidden: 1,
          }),
        }),
      );
      const result = await find({});
      expect(result.isHiddenForApprover).toBe(true);
      expect(result.isHiddenForSupport).toBe(true);
      expect(result.isHiddenForHelp).toBe(true);
    });

    it("S1: all four flags=string 'true' → all three fields=true", async () => {
      services.findOne.mockResolvedValue(
        makeEntity({
          isIdOnlyService: true,
          isHiddenService: "true",
          params: makeParams({
            hideApprover: "true",
            hideSupport: "true",
            helpHidden: "true",
          }),
        }),
      );
      const result = await find({});
      expect(result.isHiddenForApprover).toBe(true);
      expect(result.isHiddenForSupport).toBe(true);
      expect(result.isHiddenForHelp).toBe(true);
    });

    it("S2: isHiddenService=0 even with all params truthy → all three fields=false", async () => {
      services.findOne.mockResolvedValue(
        makeEntity({
          isIdOnlyService: true,
          isHiddenService: 0,
          params: makeParams({
            hideApprover: "true",
            hideSupport: "true",
            helpHidden: "true",
          }),
        }),
      );
      const result = await find({});
      expect(result.isHiddenForApprover).toBe(false);
      expect(result.isHiddenForSupport).toBe(false);
      expect(result.isHiddenForHelp).toBe(false);
    });

    it("S3: only hideApprover=true, others false → all three fields=false", async () => {
      services.findOne.mockResolvedValue(
        makeEntity({
          isIdOnlyService: true,
          isHiddenService: true,
          params: makeParams({
            hideApprover: "true",
            hideSupport: "false",
            helpHidden: "false",
          }),
        }),
      );
      const result = await find({});
      expect(result.isHiddenForApprover).toBe(false);
      expect(result.isHiddenForSupport).toBe(false);
      expect(result.isHiddenForHelp).toBe(false);
    });

    it("S4: only hideSupport=true, others false → all three fields=false", async () => {
      services.findOne.mockResolvedValue(
        makeEntity({
          isIdOnlyService: true,
          isHiddenService: true,
          params: makeParams({
            hideApprover: "false",
            hideSupport: "true",
            helpHidden: "false",
          }),
        }),
      );
      const result = await find({});
      expect(result.isHiddenForApprover).toBe(false);
      expect(result.isHiddenForSupport).toBe(false);
      expect(result.isHiddenForHelp).toBe(false);
    });

    it("S5: only helpHidden=true, others false → all three fields=false", async () => {
      services.findOne.mockResolvedValue(
        makeEntity({
          isIdOnlyService: true,
          isHiddenService: true,
          params: makeParams({
            hideApprover: "false",
            hideSupport: "false",
            helpHidden: "true",
          }),
        }),
      );
      const result = await find({});
      expect(result.isHiddenForApprover).toBe(false);
      expect(result.isHiddenForSupport).toBe(false);
      expect(result.isHiddenForHelp).toBe(false);
    });

    it("S8: no params at all → all three fields=false (no crash)", async () => {
      services.findOne.mockResolvedValue(
        makeEntity({
          isIdOnlyService: true,
          isHiddenService: true,
          params: [],
        }),
      );
      const result = await find({});
      expect(result.isHiddenForApprover).toBe(false);
      expect(result.isHiddenForSupport).toBe(false);
      expect(result.isHiddenForHelp).toBe(false);
    });
  });

  // ─── Top-level placement check ─────────────────────────────────────────────

  describe("field placement", () => {
    it("computed fields are at the top level, not nested inside relyingParty", async () => {
      services.findOne.mockResolvedValue(
        makeEntity({ params: makeParams({ hideApprover: "true" }) }),
      );
      const result = await find({});
      expect(result).toHaveProperty("isHiddenForApprover");
      expect(result).toHaveProperty("isHiddenForSupport");
      expect(result).toHaveProperty("isHiddenForHelp");
      expect(result.relyingParty).not.toHaveProperty("isHiddenForApprover");
      expect(result.relyingParty).not.toHaveProperty("isHiddenForSupport");
      expect(result.relyingParty).not.toHaveProperty("isHiddenForHelp");
    });
  });
});
