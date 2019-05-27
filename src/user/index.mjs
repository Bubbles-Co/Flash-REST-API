import express from "express";
import * as R from "ramda";

import { wardenMiddleware, routeValidationMiddleware } from "../middlewares";
import { fetchAttributes, insertAttributes } from "../db";

const router = express.Router();

// TODO fix validation middleware.

router.get("/me", wardenMiddleware, async (req, res, next) => {
  try {
    const userId = res.locals.userId;
    let user = await fetchAttributes(
      "users",
      ["name", "email"],
      { id: userId }
    );
    if (!R.isEmpty(user)) {
      user = user[0];
    }
    return res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get("/me/sessions", wardenMiddleware, async (req, res, next) => {
  try {
    const userId = res.locals.userId;
    let user = await fetchAttributes(
      "users",
      ["users.id"],
      { "users.id": userId },
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

// router.post("/me/session/:id", (req, res, next) => {
//   console.log(req.params.id);
//   res.sendStatus(200);
// });

// router.get("/me/session/:id", (req, res, next) => {
//   console.log(req.params.id);
//   res.sendStatus(200);
// });

router.post(
  "/me/session",
  wardenMiddleware,
  routeValidationMiddleware(["gymId", "routeComboIds"]),
  async (req, res, next) => {
    try {
      const userId = res.locals.userId;

      const { gymId, routeComboIds } = req.body;

      const sessionId = await insertAttributes("sessions", {
        userId,
        gymId,
        date: new Date()
      });

      const sessionRoutes = routeComboIds.map(routeComboId => ({
        routeComboId,
        sessionId: sessionId[0]
      }));

      console.log(sessionRoutes);

      const sessionRoutesId = await insertAttributes(
        "sessionRoutes",
        sessionRoutes
      );

      return res.json({ sessionId, sessionRoutesId });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
