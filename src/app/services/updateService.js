const { Op } = require("sequelize");
const {
  update,
  find,
  removeAllRedirectUris,
  addRedirectUri,
  removePostLogoutRedirects,
  addPostLogoutRedirect,
  removeGrantTypes,
  addGrantType,
  removeResponseTypes,
  addResponseType,
  updateServiceParamValue,
} = require("./data");
const logger = require("../../infrastructure/logger");

const patchableProperties = [
  "name",
  "description",
  "clientId",
  "apiSecret",
  "clientSecret",
  "serviceHome",
  "redirect_uris",
  "post_logout_redirect_uris",
  "grant_types",
  "response_types",
  "postResetUrl",
  "tokenEndpointAuthMethod",
  "consentTitle",
  "consentBody",
];

const validate = (req) => {
  const keys = Object.keys(req.body);

  if (keys.length === 0) {
    return `Must specify at least one property. Patchable properties ${patchableProperties}`;
  }
  const error = keys.map((key) => {
    const value = req.body[key];
    if (!patchableProperties.find((x) => x === key)) {
      return `${key} is not a patchable property. Patchable properties ${patchableProperties}`;
    }
    if (
      (key === "redirect_uris" ||
        key === "post_logout_redirect_uris" ||
        key === "grant_types" ||
        key === "response_types") &&
      !(value instanceof Array)
    ) {
      return `${key} must be an array`;
    }
    return null;
  });
  return error.find((x) => x !== null);
};

const updateService = async (req, res) => {
  const serviceId = req.params.id;
  const { correlationId } = req;

  logger.info(`Updating service ${serviceId}`, { correlationId });
  try {
    const existingService = await find({
      id: {
        [Op.eq]: serviceId,
      },
    });
    if (!existingService) {
      return res.status(404).send();
    }

    const validation = validate(req);
    if (validation) {
      return res.status(400).send(validation);
    }

    const redirectUris = req.body.redirect_uris;
    const postLogoutRedirectUri = req.body.post_logout_redirect_uris;
    const grantTypes = req.body.grant_types;
    const responseTypes = req.body.response_types;
    const { consentTitle } = req.body;
    const { consentBody } = req.body;

    if (redirectUris) {
      await removeAllRedirectUris(serviceId);
      if (redirectUris.length > 0) {
        for (let i = 0; i < redirectUris.length; i += 1) {
          await addRedirectUri(serviceId, redirectUris[i]);
        }
      }
    }

    if (postLogoutRedirectUri) {
      await removePostLogoutRedirects(serviceId);
      if (postLogoutRedirectUri.length > 0) {
        for (let i = 0; i < postLogoutRedirectUri.length; i += 1) {
          await addPostLogoutRedirect(serviceId, postLogoutRedirectUri[i]);
        }
      }
    }

    if (grantTypes) {
      await removeGrantTypes(serviceId);
      if (grantTypes.length > 0) {
        for (let i = 0; i < grantTypes.length; i += 1) {
          await addGrantType(serviceId, grantTypes[i]);
        }
      }
    }

    if (responseTypes) {
      await removeResponseTypes(serviceId);
      if (responseTypes.length > 0) {
        for (let i = 0; i < responseTypes.length; i += 1) {
          await addResponseType(serviceId, responseTypes[i]);
        }
      }
    }

    if (consentTitle) {
      await updateServiceParamValue(serviceId, "consentTitle", consentTitle);
    }

    if (consentBody) {
      await updateServiceParamValue(serviceId, "consentBody", consentBody);
    }

    await update(existingService.id, req.body);
    return res.status(202).send();
  } catch (e) {
    logger.error(`Error updating service ${serviceId}`, {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};

module.exports = updateService;
