import express from "express";
import * as R from "ramda";

import { wardenMiddleware } from "../middlewares";
import { fetchAttributes } from "../db";

const router = express.Router();

router.get("/me", wardenMiddleware, async function(req, res, next) {
  try {
    const userId = res.locals.userId;
    let user = await fetchAttributes("users", { id: userId }, [
      "name",
      "email"
    ]);
    if (!R.isEmpty(user)) {
      user = user[0];
    }
    return res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get("/me/sessions", wardenMiddleware, async function(req, res, next) {
  try {
    const userId = res.locals.userId;
    let user = await fetchAttributes(
      "users",
      { "users.id": userId },
      ["users.id"],
      [
        {
          tableName: "sessions",
          columns: { "users.id": "sessions.userId" }
        },
        {
          tableName: "sessions",
          columns: { "users.id": "sessions.userId" }
        }
      ]
    );
    if (!R.isEmpty(user)) {
      user = user[0];
    }
    return res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
