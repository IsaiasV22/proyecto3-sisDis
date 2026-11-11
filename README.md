## Referencias de proyectos anteriores

Estos proyectos no se copian al repositorio; se leen desde su ruta original.

> ⚠️ No copiar los archivos `.env` de estos proyectos: contienen secretos.

### Proyecto 2 — base principal (Netlify Functions + JWT + Vue)

Ruta: `/Users/isaias/Documents/Universidad-Licenciatura/SisDistribuidos/proyecto2/proyecto2-sistemas-distribuidos/`

| Archivo                                                   | Uso en el Proyecto 3                                                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `netlify.toml`                                            | Reutilizar tal cual (redirect `/api/*` → funciones y fallback de la SPA).                                           |
| `netlify/functions/login.js`                              | Login con JWT; cambiar solo el acceso a datos.                                                                      |
| `netlify/functions/register.js`                           | Registro con hash bcrypt; cambiar solo el acceso a datos.                                                           |
| `netlify/functions/verifyToken.js`                        | Validación del token (401/403); reutilizable.                                                                       |
| `netlify/functions/headersCORS.js`                        | Encabezados CORS; reutilizable.                                                                                     |
| `netlify/functions/ligas.js`, `equipos.js`, `estadios.js` | CRUD de las entidades; reescribir consultas de MongoDB a Redis.                                                     |
| `netlify/functions/mongoDB.js`                            | Conexión a MongoDB; se reemplaza por `redisDB.js`.                                                                  |
| `scripts/seed.js`, `scripts/seed-data.json`               | Datos del Proyecto 1 (12 principales, 6 por secundaria, con imágenes); adaptar el seed a Redis.                     |
| `src/`                                                    | Frontend Vue completo (`auth.js`, `api.js`, `router.js`, `users/Login.vue`, `users/Register.vue`); cambios mínimos. |
| `package.json`                                            | Dependencias; reemplazar `mongodb` por `ioredis`.                                                                   |
| `CLAUDE.md`, `README.md`                                  | Plantillas de documentación.                                                                                        |

### Tarea 5 — patrón de Redis en Netlify Functions

Ruta: `/Users/isaias/Documents/Universidad-Licenciatura/SisDistribuidos/tarea5/tarea5-sisDis/backend/`

| Archivo                                                                                              | Uso en el Proyecto 3                                                            |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `netlify/functions/redisDB.js`                                                                       | Conexión con `ioredis` (`REDIS_HOST`, `REDIS_PORT`, `REDIS_USER`, `REDIS_PSW`). |
| `netlify/functions/bookFind.js`, `bookFindAll.js`, `bookInsert.js`, `bookUpdate.js`, `bookDelete.js` | Patrón de CRUD sobre Redis.                                                     |
| `.env.example`                                                                                       | Formato de las variables de entorno de Redis.                                   |

### Proyecto 1 — especificación original (opcional)

Ruta: `/Users/isaias/Documents/Universidad-Licenciatura/SisDistribuidos/proyecto1/proyecto1-sistemas-distribuidos/`

Sirve para consultar el comportamiento original del servicio REST (`worker/index.js`) y el esquema (`schema.sql`).

## Preguntas pendientes antes de empezar

1. **Punto de partida del código:** ¿se copia el código del Proyecto 2 a este repositorio y se migra, o se empieza vacío usando el Proyecto 2 solo como referencia?
2. **Estructura de datos en Redis:** ¿se sigue el patrón del Tutorial 14 (cada registro como cadena JSON) o se usa otra estructura, por ejemplo un Hash por entidad? El enunciado dice "cada entidad pasa a ser un elemento de Redis y cada registro un valor".
3. **Conexión a Redis:** ¿variables separadas (`REDIS_HOST`, `REDIS_PORT`, `REDIS_USER`, `REDIS_PSW`), como en el tutorial y la Tarea 5, o una sola URL de conexión, como menciona el enunciado ("cadena de conexión")?
4. **Sitio en Netlify:** ¿se reutiliza el sitio del Proyecto 2 o se crea uno nuevo?
