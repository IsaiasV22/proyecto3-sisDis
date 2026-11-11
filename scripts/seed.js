"use strict";

// Carga en Redis Cloud los datos del Proyecto 1 (seed-data.json) y crea
// el usuario administrador. Se puede ejecutar varias veces: reemplaza los
// datos del catálogo y actualiza el admin.
//
//   npm run seed   (lee REDIS_*, ADMIN_EMAIL y ADMIN_PASSWORD de .env)
//
// Estructura: un Hash por entidad (campo = _id, valor = JSON) y un contador
// <entidad>_N con el último id asignado, que usan las funciones con INCR.

const bcrypt = require("bcryptjs");
const data = require("./seed-data.json");

async function main() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!(process.env.REDIS_HOST && ADMIN_EMAIL && ADMIN_PASSWORD)) {
    throw new Error("Faltan REDIS_HOST, ADMIN_EMAIL o ADMIN_PASSWORD en .env");
  }

  const redis = require("../netlify/functions/redisDB");
  try {
    for (const name of ["ligas", "estadios", "equipos"]) {
      const records = data[name];
      await redis.del(name, name + "_N");
      const values = {};
      for (const r of records) values[r._id] = JSON.stringify(r);
      await redis.hset(name, values);
      await redis.set(name + "_N", Math.max(...records.map((r) => r._id)));
      console.log(`${name}: ${await redis.hlen(name)} registros`);
    }

    const email = ADMIN_EMAIL.toLowerCase();
    const admin = {
      name: "Administrador",
      email,
      password: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: "admin",
    };
    await redis.hset("users", email, JSON.stringify(admin));
    console.log(`users: admin ${email} listo`);
  } finally {
    await redis.quit();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
