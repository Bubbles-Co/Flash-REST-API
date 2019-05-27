import express from "express";

import { wardenMiddleware } from "../middlewares";
import { fetchAttributes } from "../db";

const router = express.Router();

// TODO verify all endpoints have try catches.
// TODO verify all endpoints have warden.

router.get(
  "/",
  wardenMiddleware,
  async (req, res, next) => {
    try {
      let vals = await fetchAttributes("finishes", ["id", "value"]);
      return res.json(vals);
    } catch (err) {
      next(err);
    }
  }
)


export default router;
