import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'

import { hashPassword, fetchJWTSignOptions } from './src/auth/index.mjs'
import { createUserRecord } from './src/db/index.mjs'
import { routeValidationMiddleware } from './src/middlewares/index.mjs'

const app = express()
const PORT = 3000
const SALT_ROUNDS = 10

app.use(bodyParser.json())
app.use(cookieParser())

// Maybe use express routers when needed.

app.post('/sign-up', routeValidationMiddleware(['username', 'password', 'name']), async function (req, res) {
    try {
        const { username, password, name } = req.body
        const hashedPassword = await hashPassword(password, SALT_ROUNDS)
        const response = await createUserRecord(username, hashedPassword, name)
        const payload = {
            userId: response[0]
        }
        const jwtSignOptions = fetchJWTSignOptions()
        const token = jwt.sign(payload, process.env.JWT_PRIVATE_SECRET, jwtSignOptions)
        res.cookie('token', token, { maxAge: 900000, httpOnly: true })
        res.sendStatus(200)
    } catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.post('/sign-in', function (req, res) {
    // Get the user email and password
    // Use bcrypt to hash and salt the password.
    // Fetch user's hashed password using the email.
    // Compare password hashes
})

app.post('/sign-out', function (req, res) {

})

app.listen(PORT, () => console.log(`Flash API listening at ${PORT}!`))