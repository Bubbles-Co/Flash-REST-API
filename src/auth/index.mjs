import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function hashPassword(plainTextPassword, saltRounds) {
  return bcrypt.hash(plainTextPassword, saltRounds);
}

export async function verifyPassword(plainTextPassword, hashedPassword) {
  return bcrypt.compare(plainTextPassword, hashedPassword);
}

export function fetchJWTToken(userId) {
  const payload = {
    userId
  };
  const jwtSignOptions = fetchJWTSignOptions();
  const token = jwt.sign(
    payload,
    process.env.JWT_PRIVATE_SECRET,
    jwtSignOptions
  );
  return token;
}

export function verifyJWTToken(token) {
  const options = fetchJWTVerifyOptions();
  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_SECRET, options);
  return decoded;
}

function fetchJWTSignOptions(clientId = "https://sidbox.info") {
  return {
    expiresIn: "12h",
    algorithm: "HS256",
    audience: clientId
  };
}

function fetchJWTVerifyOptions(clientId = "https://sidbox.info") {
  return {
    expiresIn: "12h",
    algorithm: ["HS256"],
    audience: clientId
  };
}
