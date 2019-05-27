import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import * as R from "ramda";
import cors from "cors";

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
import gym from "./src/gym";
import finishes from "./src/finishes";
import grades from "./src/grades";

const app = express();
const PORT = 3000;
const SALT_ROUNDS = 10;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

// Maybe use express routers when needed.

app.post(
  "/sign-up",
  routeValidationMiddleware(["username", "password", "name"]),
  async (req, res, next) => {
    try {
      const { username, password, name } = req.body;
      const hashedPassword = await hashPassword(password, SALT_ROUNDS);
      const response = await createUserRecord(username, hashedPassword, name);
      const token = fetchJWTToken(response[0]);
      res.cookie("token", token, {
        maxAge: 9000000000,
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
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const userAttributes = await fetchAttributes(
        "users",
        ["id", "password"],
        { email: username },
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
        maxAge: 9000000000,
        httpOnly: false,
        secure: false
      });
      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

app.post("/sign-out", (req, res) => {
  res.clearCookie("token");
  return res.sendStatus(200);
});

app.use("/user", user);

app.use("/gym", gym);

app.use("/finishes", finishes);

app.use("/grades", grades);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Flash API listening at ${PORT}!`));
