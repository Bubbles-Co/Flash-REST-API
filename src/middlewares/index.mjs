import * as R from "ramda";

import { verifyJWTToken } from "../auth";

export function routeValidationMiddleware(paramsToValidate) {
  return function(req, res, next) {
    paramsToValidate.forEach(function(val) {
      if (!R.has(val)(req.body)) {
        return res.sendStatus(500);
      }
    });
    next();
  };
}

export function wardenMiddleware(req, res, next) {
  try {
    if (!req.cookies.token) {
      return res.sendStatus(401);
    }
    const decoded = verifyJWTToken(req.cookies.token);
    console.log(decoded);
    if (decoded.userId && !R.isEmpty(decoded.userId)) {
      res.locals.userId = decoded.userId;
      next();
    } else {
      return res.sendStatus(401);
    }
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
}
