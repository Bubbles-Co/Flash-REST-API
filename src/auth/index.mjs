import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const hashPassword = async (plainTextPassword, saltRounds) => {
  return bcrypt.hash(plainTextPassword, saltRounds);
};

export const verifyPassword = async (plainTextPassword, hashedPassword) => {
  return bcrypt.compare(plainTextPassword, hashedPassword);
};

export const fetchJWTToken = userId => {
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
};

export const verifyJWTToken = token => {
  const options = fetchJWTVerifyOptions();
  const decoded = jwt.verify(token, process.env.JWT_PRIVATE_SECRET, options);
  return decoded;
};

const fetchJWTSignOptions = (clientId = "https://sidbox.info") => {
  return {
    expiresIn: "9000000000s",
    algorithm: "HS256",
    audience: clientId
  };
};

const fetchJWTVerifyOptions = (clientId = "https://sidbox.info") => {
  return {
    expiresIn: "12h",
    algorithm: ["HS256"],
    audience: clientId
  };
};
