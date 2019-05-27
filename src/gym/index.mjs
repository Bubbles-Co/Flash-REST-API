import express from "express";
import * as R from "ramda";

import { wardenMiddleware, routeValidationMiddleware } from "../middlewares";
import { fetchAttributes, insertAttributes } from "../db";

const router = express.Router();

// TODO verify all endpoints have try catches.
// TODO verify all endpoints have warden.

router.use(
  "/",
  wardenMiddleware,
  routeValidationMiddleware(["gymName"]),
  async (req, res, next) => {
    try {
      const { gymName } = req.body;
      let id;
      id = await fetchAttributes(
        "gyms",
        ["id"],
        { value: gymName },
      );
      if (R.isEmpty(id)) {
        id = await insertAttributes("gyms", {
          value: gymName
        });
        id = [{ id: id[0] }];
      }
      return res.json(id);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/",
  async (req, res, next) => {
    try {
      let vals = await fetchAttributes("gyms", ["id", "value"]);
      return res.json(vals);
    } catch (err) {
      next(err);
    }
  }
)

export default router;
