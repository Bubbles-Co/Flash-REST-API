import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import * as R from "ramda";

import {
  hashPassword,
  fetchJWTToken,
  verifyPassword
} from "./src/auth/index.mjs";
import { createUserRecord, fetchAttributes } from "./src/db/index.mjs";
import {
  routeValidationMiddleware,
  errorHandler
} from "./src/middlewares/index.mjs";
import user from "./src/user";

const app = express();
const PORT = 3000;
const SALT_ROUNDS = 10;

app.use(bodyParser.json());
app.use(cookieParser());

// Maybe use express routers when needed.

app.post(
  "/sign-up",
  routeValidationMiddleware(["username", "password", "name"]),
  async function(req, res) {
    try {
      const { username, password, name } = req.body;
      const hashedPassword = await hashPassword(password, SALT_ROUNDS);
      const response = await createUserRecord(username, hashedPassword, name);
      const token = fetchJWTToken(response[0]);
      res.cookie("token", token, {
        maxAge: 900000,
        httpOnly: false,
        secure: false
      });
      return res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }
);

app.post(
  "/sign-in",
  routeValidationMiddleware(["username", "password"]),
  async function(req, res, next) {
    try {
      const { username, password } = req.body;
      const userAttributes = await fetchAttributes(
        "users",
        { email: username },
        ["id", "password"]
      );
      if (R.isEmpty(userAttributes)) {
        next("unauthorized");
      }
      const { id, password: hashedPassword } = userAttributes[0];
      const isPasswordVerified = await verifyPassword(password, hashedPassword);
      if (!isPasswordVerified) {
        next("unauthorized");
      }
      const token = fetchJWTToken(id);
      res.cookie("token", token, {
        maxAge: 900000,
        httpOnly: false,
        secure: false
      });
      return res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }
);

app.post("/sign-out", function(req, res) {
  res.clearCookie("token");
  return res.sendStatus(200);
});

app.use("/user", user);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Flash API listening at ${PORT}!`));
