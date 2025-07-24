const Sequelize = require("sequelize").default;

const define = (db, schema) => {
  const model = db.define(
    "serviceRedirectUris",
    {
      serviceId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      redirectUrl: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      timestamps: false,
      tableName: "serviceRedirectUris",
      schema,
    },
  );
  model.removeAttribute("id");
  return model;
};

const extend = () => {};

module.exports = {
  name: "serviceRedirects",
  define,
  extend,
};
