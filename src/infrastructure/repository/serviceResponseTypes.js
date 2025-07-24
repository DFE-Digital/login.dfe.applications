const Sequelize = require("sequelize").default;

const define = (db, schema) => {
  const model = db.define(
    "serviceResponseTypes",
    {
      serviceId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      responseType: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
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
