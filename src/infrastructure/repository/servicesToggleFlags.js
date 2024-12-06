const Sequelize = require("sequelize").default;

const define = (db, schema) => {
  const model = db.define(
    "toggeFlags",
    {
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      serviceName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      flag: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: "ToggleFlags",
      schema,
    },
  );
  model.removeAttribute("id");
  return model;
};

module.exports = {
  name: "servicesToggleFlags",
  define,
};
