import express from "express";
import * as R from "ramda";

import { wardenMiddleware, routeValidationMiddleware } from "../middlewares";
import {
  fetchAttributes,
  insertAttributes,
  fetchSessionStats,
  fetchSessionsCount,
  fetchDateSessions
} from "../db";

const router = express.Router();

// TODO fix validation middleware.

router.get("/me", wardenMiddleware, async (req, res, next) => {
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

router.get("/me/sessions", wardenMiddleware, async (req, res, next) => {
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
  routeValidationMiddleware.bind(null, ["gymId", "routeComboIds"]),
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

router.get("/me/session_stats", wardenMiddleware, async (req, res, next) => {
  try {
    const { userId } = res.locals;
    const { startDate, endDate } = req.query;
    const result = await fetchSessionStats(startDate, endDate, userId);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/me/sessions_count", wardenMiddleware, async (req, res, next) => {
  try {
    const { userId } = res.locals;
    const { startDate, endDate } = req.query;
    const result = await fetchSessionsCount(startDate, endDate, userId);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/me/sessions/dates", wardenMiddleware, async (req, res, next) => {
  try {
    const { userId } = res.locals;
    const { startDate, endDate } = req.query;
    const result = await fetchDateSessions(startDate, endDate, userId);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
