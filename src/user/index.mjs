import express from "express";
import * as R from "ramda";

import { wardenMiddleware, routeValidationMiddleware } from "../middlewares";
import { fetchAttributes, insertAttributes } from "../db";

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
          tableName: "sessionRoutes",
          columns: { "sessions.id": "sessionRoutes.sessionId" },
          joinType: "left"
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

router.post(
  "/me/session",
  wardenMiddleware,
  routeValidationMiddleware(["gymId", "routeComboId"]),
  async function(req, res, next) {
    try {
      const userId = res.locals.userId;

      const { gymId, routeComboId } = req.body;

      // TODO write logic to create Gym record if Gym Name is passed.

      const id = await insertAttributes("sessions", {
        userId,
        gymId,
        date: new Date()
      });

      return res.json({ id });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
