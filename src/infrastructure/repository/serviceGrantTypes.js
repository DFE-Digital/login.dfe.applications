const Sequelize = require("sequelize").default;
const Op = Sequelize.Op;

const define = (db, schema) => {
  const model = db.define(
    "serviceGrantTypes",
    {
      serviceId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      grantType: {
        type: Sequelize.STRING,
        allowNull: false,
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
