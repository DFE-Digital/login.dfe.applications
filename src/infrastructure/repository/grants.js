const Sequelize = require("sequelize").default;
const Op = Sequelize.Op;

const define = (db, schema) => {
  const model = db.define(
    "grants",
    {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      jti: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      serviceId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      scope: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      organisationId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      organisationName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: "grants",
      schema,
    },
  );
  return model;
};

const extend = (models) => {
  models.grants.belongsTo(models.services, {
    as: "Service",
    foreignKey: "serviceId",
  });
};

module.exports = {
  name: "grants",
  define,
  extend,
};
