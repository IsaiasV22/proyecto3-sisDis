"use strict"

const redis = require('./redisDB');
const headers = require('./headersCORS');
const verifyToken = require('./verifyToken');

const jsonHeaders = { ...headers, 'Content-Type': 'application/json' };

// Cada entidad es un Hash de Redis: campo = _id, valor = registro en JSON.
// El contador equipos_N solo se usa para asignar ids nuevos (INCR), nunca se decrementa.
const hash = "equipos";

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
// leyendo los registros referenciados con HMGET.
async function withNames(equipos) {
  const ids = (ref) => [...new Set(equipos.map(e => e[ref]).filter(v => v !== null))];
  const lookup = async (hashName, keys) => {
    const map = {};
    if (keys.length == 0) return map;
    const values = await redis.hmget(hashName, ...keys);
    keys.forEach((k, i) => { if (values[i]) map[k] = JSON.parse(values[i]).nombre; });
    return map;
  };
  const estadios = await lookup("estadios", ids("estadio_id"));
  const ligas = await lookup("ligas", ids("liga_id"));
  return equipos.map(e => ({
    ...e,
    estadio_nombre: estadios[e.estadio_id] ?? null,
    liga_nombre: ligas[e.liga_id] ?? null,
  }));
}

exports.handler = async (event, context) => {

  if (event.httpMethod == "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  try {
    // /api/equipos o /api/equipos/<id>
    const parts = event.path.split("/");
    const id = parseInt(parts[parts.indexOf("equipos") + 1]);
    const hasId = !Number.isNaN(id);

    const findEquipo = async (id) => {
      const value = await redis.hget(hash, id);
      return value ? (await withNames([JSON.parse(value)]))[0] : null;
    };

    if (event.httpMethod == "GET" && !hasId) {
      const values = await redis.hvals(hash);
      const equipos = values.map(v => JSON.parse(v)).sort((a, b) => a._id - b._id);
      return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify(await withNames(equipos)) };
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
      // Como en el Tutorial 14, Redis asigna el id de forma atómica con INCR
      // y se ignora el _id temporal que envía el frontend.
      const newId = await redis.incr("equipos_N");
      const equipo = { _id: newId, ...pick(data) };
      await redis.hset(hash, newId, JSON.stringify(equipo));
      return { statusCode: 201, headers: jsonHeaders, body: JSON.stringify(equipo) };
    }

    const existing = await redis.hget(hash, id);

    if (data._method == "DELETE") {
      if (user.role != "admin") {
        return { statusCode: 403, headers, body: 'Solo un administrador puede eliminar registros' };
      }
      if (!existing) return { statusCode: 404, headers, body: 'Not found' };
      await redis.hdel(hash, id);
      return { statusCode: 204, headers, body: '' };
    }

    if (!existing) return { statusCode: 404, headers, body: 'Not found' };
    await redis.hset(hash, id, JSON.stringify({ _id: id, ...pick(data) }));
    return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify(await findEquipo(id)) };

  } catch (error) {
    console.log(error);
    return { statusCode: 422, headers, body: JSON.stringify(error) };
  }
};
