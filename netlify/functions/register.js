"use strict"

const redis = require('./redisDB');
const headers = require('./headersCORS');
const bcrypt = require("bcryptjs");

// Los usuarios viven en el Hash "users": campo = email, valor = usuario en JSON.
exports.handler = async (event, context) => {

  if (event.httpMethod == "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  try {
    const data = JSON.parse(event.body);

    if (!(data.name && data.email && data.password)) {
      return { statusCode: 400, headers, body: "All input is required" };
    }

    const email = data.email.toLowerCase();

    // La contraseña nunca se guarda en texto plano, solo su hash
    const password = await bcrypt.hash(data.password, 10);
    const user = { name: data.name, email, password, role: "user" };

    // HSETNX solo escribe si el email no existe todavía (evita duplicados de forma atómica)
    const created = await redis.hsetnx("users", email, JSON.stringify(user));
    if (!created) {
      return { statusCode: 409, headers, body: "User already exists" };
    }

    return { statusCode: 201, headers, body: "User created" };
  } catch (error) {
    console.log(error);
    return { statusCode: 422, headers, body: JSON.stringify(error) };
  }
};
