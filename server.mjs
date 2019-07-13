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
import gym from "./src/gym/index.mjs";

const app = express();
const PORT = 4000;
const SALT_ROUNDS = 10;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);

app.use(bodyParser.json());
app.use(cookieParser());

// Maybe use express routers when needed.

app.post(
  "/sign-up",
  routeValidationMiddleware.bind(null, ["username", "password", "name"]),
  async (req, res, next) => {
    try {
      const { username, password, name } = req.body;
      const hashedPassword = await hashPassword(password, SALT_ROUNDS);
      const response = await createUserRecord(username, hashedPassword, name);
      const jwtToken = fetchJWTToken(response[0]);
      res.json({
        token: jwtToken,
        maxAge: 9000000000,
        httpOnly: false,
        secure: false
      });
    } catch (err) {
      next(err);
    }
  }
);

app.post(
  "/sign-in",
  routeValidationMiddleware.bind(null, ["email", "password"]),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const userAttributes = await fetchAttributes("users", { email }, [
        "id",
        "password"
      ]);
      if (R.isEmpty(userAttributes)) {
        next("unauthorized");
      }
      const { id, password: hashedPassword } = userAttributes[0];
      const isPasswordVerified = await verifyPassword(password, hashedPassword);
      if (!isPasswordVerified) {
        next("unauthorized");
      }
      const jwtToken = fetchJWTToken(id);

      res.json({
        token: jwtToken,
        maxAge: 9000000000,
        httpOnly: false,
        secure: false
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

app.post("/sign-out", (req, res) => {
  res.clearCookie("jwtToken");
  return res.sendStatus(200);
});

app.use("/user", user);

app.use("/gym", gym);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Flash API listening at ${PORT}!`));
