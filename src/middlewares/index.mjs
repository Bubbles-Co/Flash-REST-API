import * as R from 'ramda'

export function routeValidationMiddleware(paramsToValidate) {
    return function (req, res, next) {
        paramsToValidate.forEach(function (val) {
            if (!R.has(val)(req.body)) {
                res.sendStatus(500)
            }
        })
        next()
    }
}
