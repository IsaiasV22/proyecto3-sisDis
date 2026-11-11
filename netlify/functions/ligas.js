"use strict"

const redis = require('./redisDB');
const headers = require('./headersCORS');
const verifyToken = require('./verifyToken');

const jsonHeaders = { ...headers, 'Content-Type': 'application/json' };

// Cada entidad es un Hash de Redis: campo = _id, valor = registro en JSON.
// El contador ligas_N solo se usa para asignar ids nuevos (INCR), nunca se decrementa.
const hash = "ligas";

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
    // /api/ligas o /api/ligas/<id>
    const parts = event.path.split("/");
    const id = parseInt(parts[parts.indexOf("ligas") + 1]);
    const hasId = !Number.isNaN(id);

    if (event.httpMethod == "GET" && !hasId) {
      const values = await redis.hvals(hash);
      const result = values.map(v => JSON.parse(v)).sort((a, b) => a._id - b._id);
      return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify(result) };
    }

    if (event.httpMethod == "GET" && hasId) {
      const value = await redis.hget(hash, id);
      if (!value) return { statusCode: 404, headers, body: 'Not found' };
      return { statusCode: 200, headers: jsonHeaders, body: value };
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
      // Como en el Tutorial 14, Redis asigna el id de forma atómica con INCR
      // y se ignora el _id temporal que envía el frontend.
      const newId = await redis.incr("ligas_N");
      const record = { _id: newId, ...pick(data) };
      await redis.hset(hash, newId, JSON.stringify(record));
      return { statusCode: 201, headers: jsonHeaders, body: JSON.stringify(record) };
    }

    const existing = await redis.hget(hash, id);

    if (data._method == "DELETE") {
      if (user.role != "admin") {
        return { statusCode: 403, headers, body: 'Solo un administrador puede eliminar registros' };
      }
      if (!existing) return { statusCode: 404, headers, body: 'Not found' };
      const equipos = (await redis.hvals("equipos")).map(v => JSON.parse(v));
      if (equipos.some(e => e.liga_id === id)) {
        return { statusCode: 409, headers,
          body: 'No se puede eliminar: existen equipos que referencian este registro' };
      }
      await redis.hdel(hash, id);
      return { statusCode: 204, headers, body: '' };
    }

    if (!existing) return { statusCode: 404, headers, body: 'Not found' };
    const updated = { _id: id, ...pick(data) };
    await redis.hset(hash, id, JSON.stringify(updated));
    return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify(updated) };

  } catch (error) {
    console.log(error);
    return { statusCode: 422, headers, body: JSON.stringify(error) };
  }
};
