"use strict"

const clientPromise = require('./mongoDB');
const headers = require('./headersCORS');
const verifyToken = require('./verifyToken');

const jsonHeaders = { ...headers, 'Content-Type': 'application/json' };

const fields = ['nombre', 'ciudad', 'pais', 'fundacion', 'escudo_url', 'estadio_id', 'liga_id'];

function pick(data) {
  const doc = {};
  for (const f of fields) doc[f] = data[f] ?? null;
  // Las referencias son _id numéricos de estadios y ligas
  for (const ref of ['estadio_id', 'liga_id']) {
    doc[ref] = doc[ref] === null || doc[ref] === '' ? null : parseInt(doc[ref]);
  }
  return doc;
}

// Equivalente al LEFT JOIN del Proyecto 1: agrega estadio_nombre y liga_nombre
function withNames(match) {
  return [
    { $match: match },
    { $lookup: { from: "estadios", localField: "estadio_id", foreignField: "_id", as: "estadio" } },
    { $lookup: { from: "ligas", localField: "liga_id", foreignField: "_id", as: "liga" } },
    { $unwind: { path: "$estadio", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$liga", preserveNullAndEmptyArrays: true } },
    { $addFields: { estadio_nombre: "$estadio.nombre", liga_nombre: "$liga.nombre" } },
    { $project: { estadio: 0, liga: 0 } },
  ];
}

exports.handler = async (event, context) => {

  if (event.httpMethod == "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  try {
    const client = await clientPromise;
    const equipos = client.db("catalogo-futbol").collection("equipos");

    // /api/equipos o /api/equipos/<id>
    const parts = event.path.split("/");
    const id = parseInt(parts[parts.indexOf("equipos") + 1]);
    const hasId = !Number.isNaN(id);

    const findEquipo = async (id) =>
      (await equipos.aggregate(withNames({ _id: id })).toArray())[0];

    if (event.httpMethod == "GET" && !hasId) {
      const result = await equipos.aggregate(withNames({})).toArray();
      return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify(result) };
    }

    if (event.httpMethod == "GET" && hasId) {
      const equipo = await findEquipo(id);
      if (!equipo) return { statusCode: 404, headers, body: 'Not found' };
      return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify(equipo) };
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
      const equipo = { _id: parseInt(data._id), ...pick(data) };
      if (Number.isNaN(equipo._id)) {
        return { statusCode: 400, headers, body: 'A numeric _id is required' };
      }
      await equipos.insertOne(equipo);
      return { statusCode: 201, headers: jsonHeaders, body: JSON.stringify(equipo) };
    }

    const existing = await equipos.findOne({ _id: id });

    if (data._method == "DELETE") {
      if (user.role != "admin") {
        return { statusCode: 403, headers, body: 'Solo un administrador puede eliminar registros' };
      }
      if (!existing) return { statusCode: 404, headers, body: 'Not found' };
      await equipos.deleteOne({ _id: id });
      return { statusCode: 204, headers, body: '' };
    }

    if (!existing) return { statusCode: 404, headers, body: 'Not found' };
    await equipos.updateOne({ _id: id }, { $set: pick(data) });
    return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify(await findEquipo(id)) };

  } catch (error) {
    console.log(error);
    return { statusCode: 422, headers, body: JSON.stringify(error) };
  }
};
