const Sequelize = require('sequelize').default;
const Op = Sequelize.Op;

const define = (db, schema) => {
  const model = db.define('serviceRedirectUris', {
    serviceId: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    redirectUrl: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false,
    tableName: 'serviceRedirectUris',
    schema,
  });
  model.removeAttribute('id');
  return model;
};

const extend = () => {
};

module.exports = {
  name: 'serviceRedirects',
  define,
  extend,
};