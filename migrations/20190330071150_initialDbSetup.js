exports.up = async function(knex, Promise) {
  await knex.raw('create extension if not exists "uuid-ossp"');

  const hasUsersTable = await knex.schema.hasTable("users");
  if (!hasUsersTable) {
    await knex.schema.createTable("users", function(table) {
      table
        .uuid("id")
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table
        .string("email")
        .unique()
        .notNullable();
      table.string("name").notNullable();
      table.string("password").notNullable();
      table.timestamps(true, true);
    });
  }

  const hasGymsTable = await knex.schema.hasTable("gyms");
  if (!hasGymsTable) {
    await knex.schema.createTable("gyms", function(table) {
      table
        .uuid("id")
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table
        .string("value")
        .notNullable()
        .unique();
      table.timestamps(true, true);
    });
  }

  const hasTagsTable = await knex.schema.hasTable("tags");
  if (!hasTagsTable) {
    await knex.schema.createTable("tags", function(table) {
      table
        .uuid("id")
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table
        .string("value")
        .unique()
        .notNullable();
      table.timestamps(true, true);
    });
  }

  const hasGradesTable = await knex.schema.hasTable("grades");
  if (!hasGradesTable) {
    await knex.schema.createTable("grades", function(table) {
      table
        .uuid("id")
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table
        .string("value")
        .unique()
        .notNullable();
      table.timestamps(true, true);
    });
  }

  const hasFinishesTable = await knex.schema.hasTable("finishes");
  if (!hasFinishesTable) {
    await knex.schema.createTable("finishes", function(table) {
      table
        .uuid("id")
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table
        .string("value")
        .unique()
        .notNullable();
      table.timestamps(true, true);
    });
  }

  const routeTypesTable = await knex.schema.hasTable("routeTypes");
  if (!routeTypesTable) {
    await knex.schema.createTable("routeTypes", function(table) {
      table
        .uuid("id")
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table
        .string("value")
        .unique()
        .notNullable();
      table.timestamps(true, true);
    });
  }

  const hasSessionsTable = await knex.schema.hasTable("sessions");
  if (!hasSessionsTable) {
    await knex.schema.createTable("sessions", function(table) {
      table
        .uuid("id")
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table.uuid("userId").notNullable();
      table.uuid("gymId").notNullable();
      table.timestamp("date").notNullable();
      table.timestamps(true, true);

      table
        .foreign("userId")
        .references("id")
        .inTable("users");
      table
        .foreign("gymId")
        .references("id")
        .inTable("gyms");
    });
  }

  const hasRouteCombinationsTable = await knex.schema.hasTable(
    "routeCombinations"
  );
  if (!hasRouteCombinationsTable) {
    await knex.schema.createTable("routeCombinations", function(table) {
      table
        .uuid("id")
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table.uuid("routeTypeId").notNullable();
      table.uuid("gradeId").notNullable();
      table.uuid("finishId").notNullable();
      table.timestamps(true, true);

      table
        .foreign("routeTypeId")
        .references("id")
        .inTable("routeTypes");
      table
        .foreign("gradeId")
        .references("id")
        .inTable("grades");
      table
        .foreign("finishId")
        .references("id")
        .inTable("finishes");

      table.unique(["routeTypeId", "gradeId", "finishId"]);
    });
  }

  const hasSessionRoutes = await knex.schema.hasTable("sessionRoutes");
  if (!hasSessionRoutes) {
    await knex.schema.createTable("sessionRoutes", function(table) {
      table
        .uuid("id")
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table.uuid("sessionID").notNullable();
      table.uuid("routeComboId").notNullable();
      table.timestamps(true, true);

      table
        .foreign("sessionID")
        .references("id")
        .inTable("routeTypes");
      table
        .foreign("routeComboId")
        .references("id")
        .inTable("routeCombinations");
    });
  }

  const hasSessionTags = await knex.schema.hasTable("sessionTags");
  if (!hasSessionTags) {
    await knex.schema.createTable("sessionTags", function(table) {
      table
        .uuid("id")
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table.uuid("sessionID").notNullable();
      table.uuid("tagId").notNullable();
      table.timestamps(true, true);

      table
        .foreign("sessionID")
        .references("id")
        .inTable("sessions");
      table
        .foreign("tagId")
        .references("id")
        .inTable("tags");

      table.unique(["sessionID", "tagId"]);
    });
  }

  const hasRouteTypeGrades = await knex.schema.hasTable("routeTypeGrades");
  if (!hasRouteTypeGrades) {
    await knex.schema.createTable("routeTypeGrades", function(table) {
      table
        .uuid("id")
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table.uuid("gradeId").notNullable();
      table.uuid("routeTypeId").notNullable();

      table
        .foreign("gradeId")
        .references("id")
        .inTable("grades");
      table
        .foreign("routeTypeId")
        .references("id")
        .inTable("routeTypes");
    });
  }
};

exports.down = async function(knex, Promise) {
  await knex.raw('drop extension if exists "uuid-ossp" cascade');
  await knex.schema.dropTableIfExists("routeTypeGrades");
  await knex.schema.dropTableIfExists("sessionRoutes");
  await knex.schema.dropTableIfExists("sessionTags");
  await knex.schema.dropTableIfExists("sessions");
  await knex.schema.dropTableIfExists("routeCombinations");
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("gyms");
  await knex.schema.dropTableIfExists("tags");
  await knex.schema.dropTableIfExists("routeTypes");
  await knex.schema.dropTableIfExists("finishes");
  await knex.schema.dropTableIfExists("grades");
};
