const Sequelize = require("sequelize").default;
const Op = Sequelize.Op;

const define = (db, schema) => {
  const model = db.define(
    "tokens",
    {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      jti: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      grantId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      kind: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      exp: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      sid: {
        type: Sequelize.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: "tokens",
      schema,
    },
  );
  return model;
};

const extend = (models) => {
  models.tokens.belongsTo(models.grants, {
    as: "Grant",
    foreignKey: "grantId",
  });
};

module.exports = {
  name: "tokens",
  define,
  extend,
};
