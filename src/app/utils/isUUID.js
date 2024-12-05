const isUUID = (value) => {
  return value.match(
    /^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}$/i,
  )
    ? true
    : false;
};
module.exports = isUUID;
