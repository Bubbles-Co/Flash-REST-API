import knex from "knex";
import knexConfig from "../../knexfile.mjs";

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

export function fetchUsersAttributes(
  tableName,
  wherePredicates,
  selectAttributes
) {
  return knexClient(tableName)
    .where(wherePredicates)
    .select(selectAttributes);
}
