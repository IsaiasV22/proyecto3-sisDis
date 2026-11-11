"use strict";

// Basado en /netlify/functions/auth.js del tutorial de JWT, pero el token
// viaja en el encabezado "Authorization: Bearer <token>" en lugar del body.
// Retorna el contenido del token (user_id, email, role) o null si falta,
// es inválido o expiró (jwt.verify valida firma y exp).

const jwt = require("jsonwebtoken");

module.exports = function verifyToken(event) {
  const header = event.headers.authorization || event.headers.Authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  try {
    return jwt.verify(header.slice(7), process.env.TOKEN_KEY,
      { algorithms: ["HS256"] });
  } catch (err) {
    return null;
  }
};
