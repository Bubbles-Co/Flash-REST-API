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
  selectAttributes,
  wherePredicates = [],
  joinAttributes = []
) => {
  return knexClient(tableName)
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
      if (!R.isEmpty(wherePredicates)) {
        queryBuilder.where(wherePredicates);
      }
    });
};

export const insertAttributes = (tableName, data) => {
  return knexClient(tableName)
    .insert(data)
    .returning("id");
};
