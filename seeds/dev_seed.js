let boulderGrades = [
  "V0",
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6",
  "V7",
  "V9",
  "V10",
  "V11",
  "V12",
  "V13",
  "V14",
  "V15",
  "V16",
  "Vb"
];

let ropeGrades = [
  "5.4",
  "5.5",
  "5.6",
  "5.7",
  "5.8",
  "5.9",
  "5.10a",
  "5.10b",
  "5.10c",
  "5.10d",
  "5.11a",
  "5.11b",
  "5.11c",
  "5.11d",
  "5.12a",
  "5.12b",
  "5.12c",
  "5.12d",
  "5.13a",
  "5.13b",
  "5.13c",
  "5.13d",
  "5.14a",
  "5.14b",
  "5.14c",
  "5.14d",
  "5.15a",
  "5.15b",
  "5.15c",
  "5.15d"
];

let routeTypes = ["boulder", "top-rope", "sport", "trad", "ice", "mixed"];

exports.seed = async function(knex, Promise) {
  // Table : routeTypes
  await knex("routeTypeGrades").del();
  await knex("grades").del();
  await knex("finishes").del();
  await knex("routeTypes").del();

  await knex("routeTypes").insert([
    {
      value: "boulder"
    },
    {
      value: "top-rope"
    },
    {
      value: "sport"
    },
    {
      value: "trad"
    },
    {
      value: "ice"
    },
    {
      value: "mixed"
    }
  ]);

  // Table : grades
  const grades = [...boulderGrades, ...ropeGrades].map(grade => ({
    value: grade
  }));
  await knex("grades").insert(grades);

  // Table : routeTypeGrades
  let routeTypeBoulderId = await knex("routeTypes")
    .where({
      value: "boulder"
    })
    .select("id");

  if (routeTypeBoulderId.length > 0) {
    routeTypeBoulderId = routeTypeBoulderId[0].id;
  }

  const boulderGradesIds = await knex("grades")
    .whereIn("value", boulderGrades)
    .select("id");

  const boulderRouteTypeGrades = boulderGradesIds.map(({ id: gradeId }) => ({
    gradeId,
    routeTypeId: routeTypeBoulderId
  }));

  const restRouteTypeIds = await knex("routeTypes")
    .whereIn("value", ["top-rope", "sport", "trad", "ice", "mixed"])
    .select("id");

  const restGradesIds = await knex("grades")
    .whereIn("value", ropeGrades)
    .select("id");

  restRouteTypeGrades = restRouteTypeIds.reduce((acc, { id: routeTypeId }) => {
    restGradesIds.forEach(({ id: gradeId }) => {
      acc.push({
        gradeId,
        routeTypeId
      });
    });
    return acc;
  }, []);

  await knex("routeTypeGrades").insert([
    ...boulderRouteTypeGrades,
    ...restRouteTypeGrades
  ]);

  // Table : finish
  await knex("finishes").insert([
    {
      value: "project"
    },
    {
      value: "send"
    },
    {
      value: "flash"
    },
    {
      value: "onsight"
    }
  ]);
};

// routeCombinations;
