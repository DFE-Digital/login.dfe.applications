const { grants, tokens } = require("./../../../../infrastructure/repository");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { v4: uuid } = require("uuid");

const defaultGrantQueryOpts = {
  order: [["createdAt", "DESC"]],
};

const mapGrantEntities = async (entities) => {
  const mapped = [];
  for (let i = 0; i < entities.length; i++) {
    mapped.push(await mapGrantFromEntity(entities[i]));
  }
  return mapped;
};

const mapGrantFromEntity = (entity) => {
  return {
    grantId: entity.id,
    userId: entity.userId,
    email: entity.email,
    jti: entity.jti,
    serviceId: entity.serviceId,
    scope: entity.scope,
    organisationId: entity.organisationId,
    organisationName: entity.organisationName,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
};

const mapTokenEntities = async (entities) => {
  const mapped = [];
  for (let i = 0; i < entities.length; i++) {
    mapped.push(await mapTokenFromEntity(entities[i]));
  }
  return mapped;
};

const mapTokenFromEntity = (entity) => {
  return {
    id: entity.id,
    grantId: entity.grantId,
    active: entity.active,
    kind: entity.kind,
    exp: entity.exp,
    jti: entity.jti,
    sid: entity.sid,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
};

const upsertGrant = async (
  grantId,
  userId,
  email,
  jti,
  serviceId,
  scope,
  organisationId,
  organisationName,
) => {
  let entity = await grants.findOne({
    where: {
      id: {
        [Op.eq]: grantId,
      },
    },
  });
  if (entity) {
    entity.jti = jti;
    await entity.save();
    return mapGrantFromEntity(entity);
  }

  entity = {
    id: grantId,
    userId,
    email,
    jti,
    serviceId,
    scope,
    organisationId,
    organisationName,
  };
  await grants.create(entity);
  return mapGrantFromEntity(entity);
};

const findAndCountAllGrants = async (where, offset, limit) => {
  const resultset = await grants.findAndCountAll(
    Object.assign({}, defaultGrantQueryOpts, {
      where,
      limit,
      offset,
    }),
  );
  return {
    grants: await mapGrantEntities(resultset.rows),
    numberOfRecords: resultset.count,
  };
};

const findAndCountAllTokens = async (where, offset, limit) => {
  const resultset = await tokens.findAndCountAll(
    Object.assign({}, defaultGrantQueryOpts, {
      where,
      limit,
      offset,
    }),
  );
  return {
    tokens: await mapTokenEntities(resultset.rows),
    numberOfRecords: resultset.count,
  };
};

const createToken = async (grantId, active, kind, exp, jti, sid) => {
  const entity = {
    id: uuid(),
    grantId,
    active,
    kind,
    exp,
    jti,
    sid,
  };

  await tokens.create(entity);
  return mapTokenFromEntity(entity);
};

const updateToken = async (grantId, jti, active) => {
  let entity = await tokens.findOne({
    where: {
      grantId: {
        [Op.eq]: grantId,
      },
      jti: {
        [Op.eq]: jti,
      },
    },
  });
  if (entity) {
    entity.active = active;
    await entity.save();
    return mapTokenFromEntity(entity);
  }
};

module.exports = {
  upsertGrant,
  findAndCountAllGrants,
  createToken,
  updateToken,
  findAndCountAllTokens,
};
