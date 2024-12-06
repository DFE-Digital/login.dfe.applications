const Sequelize = require("sequelize").default;

const define = (db, schema) => {
  const model = db.define(
    "serviceResponseTypes",
    {
      serviceId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      responseType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: "serviceResponseTypes",
      schema,
    },
  );
  model.removeAttribute("id");
  return model;
};

const extend = () => {};

module.exports = {
  name: "serviceResponseTypes",
  define,
  extend,
};
