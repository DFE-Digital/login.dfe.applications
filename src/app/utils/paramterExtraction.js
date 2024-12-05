const InvalidInputError = require("./InvalidInputError");

const extractParam = (req, name, defaultValue = undefined) => {
  const key = Object.keys(req.query).find(
    (x) => x.toLowerCase() === name.toLowerCase(),
  );
  return key ? req.query[key] : defaultValue;
};
const extractIntParam = (req, name, defaultValue = 0) => {
  const value = extractParam(req, name, defaultValue);
  if (!value) {
    return defaultValue;
  }

  const int = parseInt(value.toString());
  if (isNaN(int)) {
    throw new InvalidInputError(
      `${value} is not a valid value for ${name}. Expected a number`,
    );
  }
  return int;
};
const extractPageParam = (req) => {
  return extractIntParam(req, "page", 1);
};
const extractPageSizeParam = (req) => {
  return extractIntParam(req, "pageSize", 25);
};

module.exports = {
  extractPageParam,
  extractPageSizeParam,
  extractIntParam,
  extractParam,
};
