const path = require("path");
const fs = require("fs");
const repository = require("./../src/infrastructure/repository");
const { Op } = require("sequelize");
const { v4: uuid } = require("uuid");
const uniq = require("lodash/uniq");
const { promisify } = require("util");

class Scripter {
  start(saveToPath) {
    this.stream = fs.createWriteStream(saveToPath, "utf8");
  }

  async finish() {
    return new Promise((resolve, reject) => {
      this.stream.end((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async write(data) {
    return new Promise((resolve, reject) => {
      this.stream.write(data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  stringify(data) {
    if (data === null || data === undefined) {
      return "NULL";
    }
    return `'${data.toString().replace(/\'/gi, "''")}'`;
  }

  async updateService(service) {
    const {
      id,
      name,
      clientId,
      clientSecret,
      apiSecret,
      tokenEndpointAuthMethod,
      serviceHome,
      postResetUrl,
    } = service;
    const sql =
      `\n\nUPDATE [service] SET name=${this.stringify(name)}, clientId=${this.stringify(clientId)}, clientSecret=${this.stringify(clientSecret)}, apiSecret=${this.stringify(apiSecret)}, ` +
      `tokenEndpointAuthMethod=${this.stringify(tokenEndpointAuthMethod)}, serviceHome=${this.stringify(serviceHome)}, postResetUrl=${this.stringify(postResetUrl)} ` +
      `WHERE id='${id}'`;
    await this.write(sql);
  }

  async createService(service) {
    const {
      id,
      name,
      description,
      clientId,
      clientSecret,
      apiSecret,
      tokenEndpointAuthMethod,
      serviceHome,
      postResetUrl,
    } = service;
    const sql =
      "\n\nINSERT INTO [service] (id, name, description, clientId, clientSecret, apiSecret, tokenEndpointAuthMethod, serviceHome, postResetUrl) " +
      `VALUES (${this.stringify(id)}, ${this.stringify(name)}, ${this.stringify(description)}, ${this.stringify(clientId)}, ${this.stringify(clientSecret)}, ` +
      `${this.stringify(apiSecret)}, ${this.stringify(tokenEndpointAuthMethod)}, ${this.stringify(serviceHome)}, ${this.stringify(postResetUrl)})`;
    await this.write(sql);
  }

  async clearChildren(tableName, serviceId) {
    const sql = `\nDELETE FROM [${tableName}] WHERE serviceId='${serviceId}'`;
    await this.write(sql);
  }

  async createChild(tableName, tuple) {
    let fields = "";
    let values = "";

    Object.keys(tuple).forEach((key) => {
      if (fields.length > 0) {
        fields += ", ";
      }
      fields += key;

      if (values.length > 0) {
        values += ", ";
      }
      values += this.stringify(tuple[key]);
    });

    const sql = `\nINSERT INTO [${tableName}] (${fields}) VALUES (${values})`;
    await this.write(sql);
  }
}

const scripter = new Scripter();

const readConfigFile = (configPath) => {
  const json = fs.readFileSync(configPath, "utf8");
  return JSON.parse(json);
};
const addServiceChildren = async (model, source, valueFieldName, serviceId) => {
  if (!source) {
    return;
  }
  source = uniq(source);
  await scripter.clearChildren(model.tableName, serviceId);
  for (let i = 0; i < source.length; i++) {
    const tuple = { serviceId };
    tuple[valueFieldName] = source[i];
    await scripter.createChild(model.tableName, tuple);
  }
};
const upsertClient = async (client) => {
  console.info(`Upserting client ${client.client_id}`);
  let service = await repository.services.findOne({
    where: {
      clientId: {
        [Op.eq]: client.client_id,
      },
    },
  });
  if (!service && client.params && client.params.serviceId) {
    service = await repository.services.findOne({
      where: {
        id: {
          [Op.eq]: client.params.serviceId,
        },
      },
    });
  }

  if (service) {
    service = Object.assign(service, {
      name: client.friendlyName || "DfE Sign-in",
      clientSecret: client.client_secret,
      apiSecret: client.api_secret,
      tokenEndpointAuthMethod: client.token_endpoint_auth_method,
      serviceHome: client.service_home,
      postResetUrl: client.postResetUrl,
    });
    await scripter.updateService(service);
  } else {
    service = {
      id:
        client.params && client.params.serviceId
          ? client.params.serviceId
          : uuid(),
      name: client.friendlyName || "DfE Sign-in",
      clientId: client.client_id,
      clientSecret: client.client_secret,
      apiSecret: client.api_secret,
      tokenEndpointAuthMethod: client.token_endpoint_auth_method,
      serviceHome: client.service_home,
      postResetUrl: client.postResetUrl,
    };
    await scripter.createService(service);
  }

  await addServiceChildren(
    repository.serviceRedirects,
    client.redirect_uris,
    "redirectUrl",
    service.id,
  );
  await addServiceChildren(
    repository.servicePostLogoutRedirects,
    client.post_logout_redirect_uris,
    "redirectUrl",
    service.id,
  );
  await addServiceChildren(
    repository.serviceGrantTypes,
    client.grant_types,
    "grantType",
    service.id,
  );
  await addServiceChildren(
    repository.serviceResponseTypes,
    client.response_types,
    "responseType",
    service.id,
  );

  const params = Object.keys(client.params).map((key) => ({
    key,
    value: client.params[key],
  }));
  await scripter.clearChildren("serviceParams", service.id);
  for (let i = 0; i < params.length; i++) {
    await scripter.createChild("serviceParams", {
      serviceId: service.id,
      paramName: params[i].key,
      paramValue: params[i].value,
    });
  }
  // const params = Object.keys(client.params).map(key => ({ key, value: client.params[key] }));
  // await repository.serviceParams.destroy({ where: { serviceId: { [Op.eq]: service.id } } });
  // for (let i = 0; i < params.length; i++) {
  //   await repository.serviceParams.create({
  //     serviceId: service.id,
  //     paramName: params[i].key,
  //     paramValue: params[i].value,
  //   });
  // }
};

(async () => {
  const configPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : undefined;
  if (!configPath) {
    throw new Error("Must specify path to config");
  }

  const outputPath = process.argv[3]
    ? path.resolve(process.argv[3])
    : undefined;
  if (!configPath) {
    throw new Error("Must specify path to output to");
  }

  const clients = readConfigFile(configPath);

  scripter.start(outputPath);
  for (let i = 0; i < clients.length; i++) {
    await upsertClient(clients[i]);
  }
  await scripter.finish();
})()
  .then(() => {
    console.info("done");
    process.exit();
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
