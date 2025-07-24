const Sequelize = require("sequelize").default;

const define = (db, schema) => {
  const model = db.define(
    "serviceGrantTypes",
    {
      serviceId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      grantType: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      timestamps: false,
      tableName: "serviceGrantTypes",
      schema,
    },
  );
  model.removeAttribute("id");
  return model;
};

const extend = () => {};

module.exports = {
  name: "serviceGrantTypes",
  define,
  extend,
};
