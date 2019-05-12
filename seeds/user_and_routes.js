exports.seed = async (knex, Promise) => {
  await knex("sessions").del();
  await knex("sessionRoutes").del();
  await knex("users").del();
  await knex("gyms").del();

  await knex("users").insert([
    {
      name: "testUser1",
      email: "testUser1@gmail.com",
      password: "testUser1"
    },
    {
      name: "testUser2",
      email: "testUser2@gmail.com",
      password: "testUser2"
    }
  ]);

  await knex("gyms").insert([
    {
      value: "Dogpatch Boulders"
    },
    {
      value: "Mission Cliffs"
    }
  ]);

  let routeTypeBoulderId = await knex("routeTypes")
    .where({ value: "boulder" })
    .select("id");

  let gradeIds = await knex("grades")
    .whereIn("value", ["V0", "V1", "V2", "V3", "V4", "V5"])
    .select("id");

  let finishIds = await knex("finishes")
    .whereIn("value", ["flash", "project", "send", "onsight"])
    .select("id");

  let gymId = await knex("gyms")
    .where({ value: "Dogpatch Boulders" })
    .select("id");

  let userId = await knex("users")
    .where({ email: "testUser1@gmail.com" })
    .select("id");

  dateList = [
    "2019-05-05",
    "2019-04-28",
    "2019-05-07",
    "2019-05-09",
    "2019-05-10"
  ];

  for (var j = 0; j < dateList.length; ++j) {
    let sessionId = await knex("sessions")
      .returning("id")
      .insert({
        userId: userId[0]["id"],
        gymId: gymId[0]["id"],
        date: dateList[j]
      });

    sessionsData = [];
    for (var i = 0; i < 10; ++i) {
      let gradeId = gradeIds[Math.floor(Math.random() * gradeIds.length)]["id"];
      let finishId =
        finishIds[Math.floor(Math.random() * finishIds.length)]["id"];

      let routeComboId = await knex("routeCombinations")
        .where({
          gradeId: gradeId,
          finishId: finishId,
          routeTypeId: routeTypeBoulderId[0]["id"]
        })
        .select("id");
      await knex("sessionRoutes").insert({
        sessionId: sessionId[0],
        routeComboId: routeComboId[0]["id"]
      });
    }
  }
};
