import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import {
  hashPassword,
  fetchJWTToken,
  verifyPassword
} from "./src/auth/index.mjs";
import { createUserRecord, fetchUsersAttributes } from "./src/db/index.mjs";
import {
  routeValidationMiddleware,
  wardenMiddleware
} from "./src/middlewares/index.mjs";
import { appendFile } from "fs";

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
        httpOnly: true,
        secure: true
      });
      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
);

app.post(
  "/sign-in",
  routeValidationMiddleware(["username", "password"]),
  async function(req, res) {
    try {
      const { username, password } = req.body;
      const userAttributes = await fetchUsersAttributes(
        "users",
        { email: username },
        ["id", "password"]
      );
      const { id, password: hashedPassword } = userAttributes[0];
      const isPasswordVerified = await verifyPassword(password, hashedPassword);
      if (!isPasswordVerified) {
        throw new error("Password and username don't match");
      }
      const token = fetchJWTToken(id);
      res.cookie("token", token, {
        maxAge: 900000,
        httpOnly: true,
        secure: false
      });
      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  }
);

app.post("/sign-out", function(req, res) {
  res.clearCookie("token");
  return res.sendStatus(200);
});

app.get("/users/sessions", wardenMiddleware, function(req, res) {
  return res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Flash API listening at ${PORT}!`));
