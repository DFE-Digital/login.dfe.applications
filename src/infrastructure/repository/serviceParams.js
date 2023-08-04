const Sequelize = require('sequelize').default;
const Op = Sequelize.Op;

const define = (db, schema) => {
  const model = db.define('serviceParams', {
    serviceId: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
    },
    paramName: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    paramValue: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false,
    tableName: 'serviceParams',
    schema,
  });
  model.removeAttribute('id');
  return model;
};

const extend = () => {
};

module.exports = {
  name: 'serviceParams',
  define,
  extend,
};