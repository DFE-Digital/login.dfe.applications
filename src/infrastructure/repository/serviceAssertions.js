const Sequelize = require("sequelize").default;
const Op = Sequelize.Op;

const define = (db, schema) => {
  const model = db.define(
    "serviceAssertions",
    {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      serviceId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      typeUrn: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      friendlyName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: false,
      tableName: "serviceAssertions",
      schema,
    },
  );
  return model;
};

const extend = () => {};

module.exports = {
  name: "serviceAssertions",
  define,
  extend,
};
