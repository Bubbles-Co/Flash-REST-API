import * as R from "ramda";

import { verifyJWTToken } from "../auth";

export const routeValidationMiddleware = paramsToValidate => {
  return (req, res, next) => {
    paramsToValidate.forEach(val => {
      if (!R.has(val)(req.body)) {
        return next("Invalid parameters.");
      }
    });
    return next();
  };
};

export const wardenMiddleware = (req, res, next) => {
  try {
    if (!req.cookies.token) {
      return next("unauthorized");
    }
    const decoded = verifyJWTToken(req.cookies.token);
    if (decoded.userId && !R.isEmpty(decoded.userId)) {
      res.locals.userId = decoded.userId;
      return next();
    } else {
      return next("unauthorized");
    }
  } catch (err) {
    return next(err);
  }
};

export const errorHandler = (err, req, res, next) => {
  console.log(err);
  if (err == "unauthorized") {
    return res.sendStatus(401);
  }
  if (err == "Invalid parameters.") {
    return res.sendStatus(400);
  }
  return res.sendStatus(500);
};
