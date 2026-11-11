"use strict"

const redis = require('./redisDB');
const headers = require('./headersCORS');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.handler = async (event, context) => {

  if (event.httpMethod == "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  try {

    const data = JSON.parse(event.body);

    if (!(data.email && data.password)) {
      return { statusCode: 400, headers, body: "All input is required" };
    }

    // El hash se obtiene de Redis buscando al usuario por su email (campo del Hash "users")
    const value = await redis.hget("users", data.email.toLowerCase());
    const user = value ? JSON.parse(value) : null;

    if (user && (await bcrypt.compare(data.password, user.password))) {
      // El email es el identificador del usuario
      const token = jwt.sign(
        { user_id: user.email, email: user.email, role: user.role },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
          algorithm: "HS256",
        }
      );
      const body = { _id: user.email, name: user.name, email: user.email, role: user.role, token };
      return { statusCode: 200, headers, body: JSON.stringify(body) };
    }
    return { statusCode: 400, headers, body: 'Invalid Credentials' };
  } catch (error) {
    console.log(error);
    return { statusCode: 422, headers, body: JSON.stringify(error) };
  }
};
