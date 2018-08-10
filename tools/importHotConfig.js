const path = require('path');
const fs = require('fs');
const repository = require('./../src/infrastructure/repository');
const { Op } = require('sequelize');
const uuid = require('uuid/v4');
const uniq = require('lodash/uniq');

const readConfigFile = (configPath) => {
  const json = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(json);
};
const addServiceChildren = async (model, source, valueFieldName, serviceId) => {
  if (!source) {
    return;
  }
  source = uniq(source);
  await model.destroy({ where: { serviceId: { [Op.eq]: serviceId } } });
  for (let i = 0; i < source.length; i++) {
    const tuple = { serviceId };
    tuple[valueFieldName] = source[i];
    await model.create(tuple);
  }
};
const upsertClient = async (client) => {
  console.info(`Upserting client ${client.client_id}`);
  let service = await repository.services.find({
    where: {
      clientId: {
        [Op.eq]: client.client_id,
      }
    }
  });
  if (service) {
    await service.update({
      name: client.friendlyName || 'DfE Sign-in',
      clientSecret: client.client_secret,
      apiSecret: client.api_secret,
      tokenEndpointAuthMethod: client.token_endpoint_auth_method,
      serviceHome: client.service_home,
      postResetUrl: client.postResetUrl,
    });
  } else {
    service = {
      id: uuid(),
      name: client.friendlyName || 'DfE Sign-in',
      clientId: client.client_id,
      clientSecret: client.client_secret,
      apiSecret: client.api_secret,
      tokenEndpointAuthMethod: client.token_endpoint_auth_method,
      serviceHome: client.service_home,
      postResetUrl: client.postResetUrl,
    };
    await repository.services.create(service);
  }

  await addServiceChildren(repository.serviceRedirects, client.redirect_uris, 'redirectUrl', service.id);
  await addServiceChildren(repository.servicePostLogoutRedirects, client.post_logout_redirect_uris, 'redirectUrl', service.id);
  await addServiceChildren(repository.serviceGrantTypes, client.grant_types, 'grantType', service.id);
  await addServiceChildren(repository.serviceResponseTypes, client.response_types, 'responseType', service.id);

  const params = Object.keys(client.params).map(key => ({ key, value: client.params[key] }));
  await repository.serviceParams.destroy({ where: { serviceId: { [Op.eq]: service.id } } });
  for (let i = 0; i < params.length; i++) {
    await repository.serviceParams.create({
      serviceId: service.id,
      paramName: params[i].key,
      paramValue: params[i].value,
    });
  }
};

(async () => {
  const configPath = process.argv[2] ? path.resolve(process.argv[2]) : undefined;
  if (!configPath) {
    throw new Error('Must specify path to config');
  }

  const clients = readConfigFile(configPath);
  for (let i = 0; i < clients.length; i++) {
    await upsertClient(clients[i]);
  }
})().then(() => {
  console.info('done');
  process.exit();
}).catch((e) => {
  console.error(e.message);
  process.exit(1);
});
