import knex from "knex";
import knexConfig from "../../knexfile.mjs";
import * as R from "ramda";

const knexClient = knex(knexConfig);

// TODO refactor crateUserRecord

export const createUserRecord = (username, hashedPassword, name) => {
  return knexClient("users")
    .insert({
      email: username,
      password: hashedPassword,
      name
    })
    .returning("id");
};

export const fetchAttributes = (
  tableName,
  wherePredicates,
  selectAttributes,
  joinAttributes = []
) => {
  return knexClient(tableName)
    .where(wherePredicates)
    .select(selectAttributes)
    .modify(queryBuilder => {
      if (!R.isEmpty(joinAttributes)) {
        joinAttributes.forEach(joinAttribute => {
          if (joinAttribute.joinType === "left") {
            queryBuilder.leftJoin(
              joinAttribute.tableName,
              joinAttribute.columns
            );
          } else {
            queryBuilder.join(joinAttribute.tableName, joinAttribute.columns);
          }
        });
      }
    });
};

export const insertAttributes = (tableName, data) => {
  return knexClient(tableName)
    .insert(data)
    .returning("id");
};

export const fetchSessionStats = (startDate, endDate, userId) => {
  return knexClient.raw(`
    SELECT "routeTypes"."value", COUNT("routeTypes"."value")
    from users
    join "sessions" on "sessions"."userId" = users.id
    left join "sessionRoutes" on "sessionRoutes"."sessionId" = sessions.id
    left join "routeCombinations" on "routeCombinations".id = "sessionRoutes"."routeComboId"
    left join "routeTypes" on "routeTypes".id = "routeCombinations"."routeTypeId" 
    where sessions."userId"='${userId}'
    and sessions."date" > ('${startDate}'::date)
    and sessions."date" < ('${endDate}'::date)
    group by "routeTypes"."value";
  `);
};

export const fetchSessionsCount = (startDate, endDate, userId) => {
  return knexClient.raw(`
    SELECT COUNT("sessionRoutes"."id")
    from users
    join "sessions" on "sessions"."userId" = users.id
    left join "sessionRoutes" on "sessionRoutes"."sessionId" = sessions.id
    where sessions."userId" = '${userId}'
    and sessions."date" > ('${startDate}'::date)
    and sessions."date" < ('${endDate}'::date);
  `);
};

export const fetchDateSessions = (startDate, endDate, userId) => {
  return knexClient.raw(`
    SELECT sessions."date", gyms."value" as gym, "routeTypes"."value" as type, grades."value" as grade, finishes."value" as finish
    from users
    join sessions on sessions."userId"= users.id
    left join "gyms" on "gyms".id = sessions."gymId"
    left join "sessionRoutes" on "sessionRoutes"."sessionId" = sessions.id
    left join "routeCombinations" on "routeCombinations".id = "sessionRoutes"."routeComboId"
    left join "routeTypes" on "routeTypes".id = "routeCombinations"."routeTypeId"
    left join "grades" on "grades".id = "routeCombinations"."gradeId"
    left join "finishes" on "finishes".id = "routeCombinations"."finishId"
    where users.id = '${userId}'
    and sessions."date" > ('${startDate}'::date)
    and sessions."date" < ('${endDate}'::date);
  `);
};
