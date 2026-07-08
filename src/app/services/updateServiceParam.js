const { Op } = require("sequelize");
const {
  find,
  findServiceParam,
  updateServiceParamValue,
  addServiceParam,
} = require("./data");
const logger = require("../../infrastructure/logger");
const { isUUID } = require("../utils");

const BOOLEAN_PARAMS = [
  "hideSupport",
  "hideApprover",
  "helpHidden",
  "allowManageInvite",
];
const NUMERIC_PARAMS = ["maximumRolesAllowed", "minimumRolesRequired"];
const URL_PARAMS = ["wsWsdlUrl"];
const UUID_PARAMS = ["serviceId"];
const UUID_LIST_PARAMS = ["roleSelectionConstraint"];

const isValidUrl = (value) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const isNumeric = (value) => /^\d+(\.\d+)?$/.test(value);

const isUuidList = (value) => {
  if (!value || value.trim() === "") return false;
  return value.split(",").every((part) => isUUID(part.trim()));
};

const validateParamValue = (paramName, paramValue) => {
  if (BOOLEAN_PARAMS.includes(paramName)) {
    if (
      typeof paramValue !== "string" ||
      (paramValue !== "true" && paramValue !== "false")
    ) {
      return `${paramName} must be the string 'true' or 'false'`;
    }
    return null;
  }
  if (NUMERIC_PARAMS.includes(paramName)) {
    if (!isNumeric(String(paramValue))) {
      return `${paramName} must be a numeric value`;
    }
    return null;
  }
  if (URL_PARAMS.includes(paramName)) {
    if (!isValidUrl(paramValue)) {
      return `${paramName} must be a valid URL`;
    }
    return null;
  }
  if (UUID_PARAMS.includes(paramName)) {
    if (!isUUID(String(paramValue))) {
      return `${paramName} must be a valid UUID`;
    }
    return null;
  }
  if (UUID_LIST_PARAMS.includes(paramName)) {
    if (!isUuidList(String(paramValue))) {
      return `${paramName} must be a comma-separated list of UUIDs`;
    }
    return null;
  }
  return null;
};

const updateServiceParam = async (req, res) => {
  const serviceId = req.params.id;
  const key = req.params.key;
  const { correlationId } = req;

  logger.info(`Updating service param ${key} for service ${serviceId}`, {
    correlationId,
  });

  try {
    const { paramName, paramValue } = req.body;

    if (
      !paramName ||
      typeof paramName !== "string" ||
      paramName.trim() === ""
    ) {
      return res.status(400).send("paramName must be a non-empty string");
    }

    if (paramValue === undefined || paramValue === null) {
      return res.status(400).send("paramValue must be provided");
    }

    if (key !== paramName) {
      return res.status(400).send("URL key does not match body paramName");
    }

    const validationError = validateParamValue(paramName, paramValue);
    if (validationError) {
      return res.status(400).send(validationError);
    }

    const existingService = await find({
      id: {
        [Op.eq]: serviceId,
      },
    });
    if (!existingService) {
      return res.status(404).send();
    }

    const existingParam = await findServiceParam(existingService.id, paramName);
    if (!existingParam) {
      await addServiceParam(existingService.id, paramName, String(paramValue));
    } else {
      await updateServiceParamValue(
        existingService.id,
        paramName,
        String(paramValue),
      );
    }

    return res.status(200).send({
      serviceId: existingService.id,
      paramName,
      paramValue: String(paramValue),
    });
  } catch (e) {
    logger.error(
      `Error updating service param ${key} for service ${serviceId}`,
      {
        correlationId,
        error: { ...e },
      },
    );
    throw e;
  }
};

module.exports = updateServiceParam;
