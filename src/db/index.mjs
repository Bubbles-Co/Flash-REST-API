import knex from "knex";
import knexConfig from "../../knexfile.mjs";
import * as R from "ramda";

const knexClient = knex(knexConfig);

export function createUserRecord(username, hashedPassword, name) {
  return knexClient("users")
    .insert({
      email: username,
      password: hashedPassword,
      name
    })
    .returning("id");
}

export function fetchAttributes(
  tableName,
  wherePredicates,
  selectAttributes,
  joinAttributes = []
) {
  return knexClient(tableName)
    .where(wherePredicates)
    .select(selectAttributes)
    .modify(queryBuilder => {
      if (!R.isEmpty(joinAttributes)) {
        joinAttributes.forEach(joinAttribute => {
          queryBuilder.join(joinAttribute.tableName, joinAttribute.columns);
        });
      }
    });
}
