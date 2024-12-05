const { upsertServiceBanner } = require("./data");
const logger = require("../../infrastructure/logger");

const validate = (req) => {
  const model = {
    banner: {
      bannerId: req.body.id,
      serviceId: req.params.id,
      name: req.body.name,
      title: req.body.title,
      message: req.body.message,
      validFrom: req.body.validFrom,
      validTo: req.body.validTo,
      isActive: req.body.isActive,
    },
    errors: [],
  };
  if (!model.banner.serviceId) {
    model.errors.push("serviceId must be specified");
  }
  if (!model.banner.name) {
    model.errors.push("name must be specified");
  }
  if (!model.banner.title) {
    model.errors.push("title must be specified");
  }
  if (!model.banner.message) {
    model.errors.push("message must be specified");
  }
  return model;
};

const upsertBanner = async (req, res) => {
  const model = validate(req);
  if (model.errors.length > 0) {
    return res.status(400).json({
      errors: model.errors,
    });
  }

  const { correlationId } = req;
  try {
    logger.info("Processing upsert service banner request.", { correlationId });
    const banner = await upsertServiceBanner(
      model.banner.bannerId,
      model.banner.serviceId,
      model.banner.name,
      model.banner.title,
      model.banner.message,
      model.banner.validFrom,
      model.banner.validTo,
      model.banner.isActive,
    );

    return res.status(202).json(banner);
  } catch (e) {
    logger.error("Error processing upsert service banner request", {
      correlationId,
      error: { ...e },
    });
    throw e;
  }
};

module.exports = upsertBanner;
