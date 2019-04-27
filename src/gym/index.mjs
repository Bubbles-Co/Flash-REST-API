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
        {
          value: gymName
        },
        ["id"]
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

export default router;
