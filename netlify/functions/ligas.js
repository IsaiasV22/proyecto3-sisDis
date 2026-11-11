"use strict"

const clientPromise = require('./mongoDB');
const headers = require('./headersCORS');
const verifyToken = require('./verifyToken');

const jsonHeaders = { ...headers, 'Content-Type': 'application/json' };

const fields = ['nombre', 'pais', 'confederacion', 'nivel', 'fundacion', 'logo_url'];

function pick(data) {
  const doc = {};
  for (const f of fields) doc[f] = data[f] ?? null;
  return doc;
}

exports.handler = async (event, context) => {

  if (event.httpMethod == "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  try {
    const client = await clientPromise;
    const db = client.db("catalogo-futbol");
    const ligas = db.collection("ligas");

    // /api/ligas o /api/ligas/<id>
    const parts = event.path.split("/");
    const id = parseInt(parts[parts.indexOf("ligas") + 1]);
    const hasId = !Number.isNaN(id);

    if (event.httpMethod == "GET" && !hasId) {
      const result = await ligas.find({}).toArray();
      return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify(result) };
    }

    if (event.httpMethod == "GET" && hasId) {
      const liga = await ligas.findOne({ _id: id });
      if (!liga) return { statusCode: 404, headers, body: 'Not found' };
      return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify(liga) };
    }

    if (event.httpMethod != "POST") {
      return { statusCode: 404, headers, body: 'Not found' };
    }

    // Crear, editar y borrar requieren un usuario autenticado
    const user = verifyToken(event);
    if (!user) {
      return { statusCode: 401, headers, body: 'Invalid or missing token' };
    }

    const data = JSON.parse(event.body);

    if (!hasId) {
      const liga = { _id: parseInt(data._id), ...pick(data) };
      if (Number.isNaN(liga._id)) {
        return { statusCode: 400, headers, body: 'A numeric _id is required' };
      }
      await ligas.insertOne(liga);
      return { statusCode: 201, headers: jsonHeaders, body: JSON.stringify(liga) };
    }

    const existing = await ligas.findOne({ _id: id });

    if (data._method == "DELETE") {
      if (user.role != "admin") {
        return { statusCode: 403, headers, body: 'Solo un administrador puede eliminar registros' };
      }
      if (!existing) return { statusCode: 404, headers, body: 'Not found' };
      const refs = await db.collection("equipos").countDocuments({ liga_id: id });
      if (refs > 0) {
        return { statusCode: 409, headers,
          body: 'No se puede eliminar: existen equipos que referencian este registro' };
      }
      await ligas.deleteOne({ _id: id });
      return { statusCode: 204, headers, body: '' };
    }

    if (!existing) return { statusCode: 404, headers, body: 'Not found' };
    await ligas.updateOne({ _id: id }, { $set: pick(data) });
    const updated = await ligas.findOne({ _id: id });
    return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify(updated) };

  } catch (error) {
    console.log(error);
    return { statusCode: 422, headers, body: JSON.stringify(error) };
  }
};
