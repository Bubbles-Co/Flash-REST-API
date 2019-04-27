import * as R from "ramda";

import { verifyJWTToken } from "../auth";

export function routeValidationMiddleware(paramsToValidate) {
  return function(req, res, next) {
    paramsToValidate.forEach(function(val) {
      if (!R.has(val)(req.body)) {
        return next("Invalid parameters.");
      }
    });
    return next();
  };
}

export function wardenMiddleware(req, res, next) {
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
}

export function errorHandler(err, req, res, next) {
  console.log(err);
  if (err == "unauthorized") {
    return res.sendStatus(401);
  }
  if (err == "Invalid parameters.") {
    return res.sendStatus(400);
  }
  return res.sendStatus(500);
}
