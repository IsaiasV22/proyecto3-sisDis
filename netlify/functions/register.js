"use strict"

const clientPromise = require('./mongoDB');
const headers = require('./headersCORS');
const bcrypt = require("bcryptjs");

exports.handler = async (event, context) => {

  if (event.httpMethod == "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  try {
    const data = JSON.parse(event.body);

    if (!(data.name && data.email && data.password)) {
      return { statusCode: 400, headers, body: "All input is required" };
    }

    const client = await clientPromise;
    const users = client.db("catalogo-futbol").collection("users");

    const email = data.email.toLowerCase();

    if (await users.findOne({ email })) {
      return { statusCode: 409, headers, body: "User already exists" };
    }

    // La contraseña nunca se guarda en texto plano, solo su hash
    const password = await bcrypt.hash(data.password, 10);

    await users.insertOne({ name: data.name, email, password, role: "user" });

    return { statusCode: 201, headers, body: "User created" };
  } catch (error) {
    console.log(error);
    return { statusCode: 422, headers, body: JSON.stringify(error) };
  }
};
