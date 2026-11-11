"use strict";

// Carga en MongoDB Atlas los datos del Proyecto 1 (seed-data.json) y crea
// el usuario administrador. Se puede ejecutar varias veces: reemplaza los
// datos del catálogo y actualiza el admin.
//
//   npm run seed      (lee MONGODB_URI, ADMIN_EMAIL y ADMIN_PASSWORD de .env)

const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const data = require("./seed-data.json");

async function main() {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!(MONGODB_URI && ADMIN_EMAIL && ADMIN_PASSWORD)) {
    throw new Error("Faltan MONGODB_URI, ADMIN_EMAIL o ADMIN_PASSWORD en .env");
  }

  const client = await new MongoClient(MONGODB_URI).connect();
  try {
    const db = client.db("catalogo-futbol");

    for (const name of ["ligas", "estadios", "equipos"]) {
      await db.collection(name).deleteMany({});
      await db.collection(name).insertMany(data[name]);
      console.log(`${name}: ${data[name].length} documentos`);
    }

    const users = db.collection("users");
    await users.createIndex({ email: 1 }, { unique: true });
    await users.updateOne(
      { email: ADMIN_EMAIL.toLowerCase() },
      {
        $set: {
          name: "Administrador",
          password: await bcrypt.hash(ADMIN_PASSWORD, 10),
          role: "admin",
        },
      },
      { upsert: true },
    );
    console.log(`users: admin ${ADMIN_EMAIL.toLowerCase()} listo`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
