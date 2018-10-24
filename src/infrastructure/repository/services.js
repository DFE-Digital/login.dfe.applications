const Sequelize = require('sequelize').default;
const Op = Sequelize.Op;

const define = (db, schema) => {
  return db.define('service', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    clientId: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    clientSecret: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    apiSecret: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    tokenEndpointAuthMethod: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    serviceHome: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    postResetUrl: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    isMigrated: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    isExternalService: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  }, {
    timestamps: false,
    tableName: 'service',
    schema,
  });
};

const extend = ({ services, serviceRedirects, servicePostLogoutRedirects, serviceGrantTypes, serviceResponseTypes, serviceParams, serviceAssertions }) => {
  services.hasMany(serviceRedirects, { foreignKey: 'serviceId', sourceKey: 'id', as: 'redirects' });
  services.hasMany(servicePostLogoutRedirects, { foreignKey: 'serviceId', sourceKey: 'id', as: 'postLogoutRedirects' });
  services.hasMany(serviceGrantTypes, { foreignKey: 'serviceId', sourceKey: 'id', as: 'grantTypes' });
  services.hasMany(serviceResponseTypes, { foreignKey: 'serviceId', sourceKey: 'id', as: 'responseTypes' });
  services.hasMany(serviceParams, { foreignKey: 'serviceId', sourceKey: 'id', as: 'params' });
  services.hasMany(serviceAssertions, { foreignKey: 'serviceId', sourceKey: 'id', as: 'assertions' });
};

module.exports = {
  name: 'services',
  define,
  extend,
};
