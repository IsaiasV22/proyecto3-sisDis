# Catálogo de equipos de fútbol (Proyecto 3)

Proyecto 3: EIF-508 Sistemas Distribuidos.

**Estudiante:** Isaías Víquez Soto

**Tema asignado:** 14. Catálogo de equipos de fútbol

**URL desplegada:** https://proyecto3-sisdis-isaiasviquez.netlify.app

## Cuentas para probar

| Rol | Correo | Contraseña | Puede |
|---|---|---|---|
| `admin` | El definido en `ADMIN_EMAIL` al ejecutar el seed | El definido en `ADMIN_PASSWORD` | Ver, crear, editar y borrar |
| `user` | La que se cree en **Registro** | La que se escoja | Ver, crear y editar (borrar responde 403) |

Para ver el catálogo no hace falta iniciar sesión. Los datos originales se restauran con `npm run seed`.

## Variables de entorno

| Variable | Uso |
|---|---|
| `REDIS_HOST` | Host (endpoint público) de la base de datos en Redis Cloud, sin el puerto |
| `REDIS_PORT` | Puerto del endpoint de Redis Cloud |
| `REDIS_USER` | Usuario de Redis Cloud (por defecto `default`) |
| `REDIS_PSW` | Contraseña de ese usuario |
| `TOKEN_KEY` | Clave secreta para firmar los JWT (HS256). Debe ser una cadena aleatoria de al menos 32 caracteres |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Solo para `scripts/seed.js` (desarrollo local): credenciales del administrador |

Los cuatro valores `REDIS_*` se obtienen en Redis Cloud, en *Databases → (la base) → Connect*.

**En Netlify:** en *Site configuration → Environment variables* se agregan `REDIS_HOST`, `REDIS_PORT`, `REDIS_USER`, `REDIS_PSW` y `TOKEN_KEY`, y luego se vuelve a desplegar.

**En desarrollo local:** se crea un archivo `.env` en la raíz con todas las variables. Git lo ignora y no forma parte de la entrega. Para generar una `TOKEN_KEY`:

```
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Desarrollo local

Se necesita Netlify CLI (`npm install -g netlify-cli`).

```
npm install
npm run seed      # carga los datos del Proyecto 1 y el usuario admin en Redis Cloud
netlify dev       # SPA + funciones en http://localhost:8888
npm run build     # genera dist/, el directorio que publica Netlify
```

## Servicio REST

`netlify.toml` redirige `/api/*` a las funciones de `netlify/functions/`, de modo que se mantienen las rutas del Proyecto 1:

| Operación | Ruta | Autenticación |
|---|---|---|
| Listar | `GET /api/<entidad>` | Pública |
| Consultar | `GET /api/<entidad>/<id>` | Pública |
| Crear | `POST /api/<entidad>` | Token |
| Editar | `POST /api/<entidad>/<id>` | Token |
| Borrar | `POST /api/<entidad>/<id>` con `{"_method":"DELETE"}` | Token con rol `admin` |
| Registro | `POST /api/register` | — |
| Inicio de sesión | `POST /api/login` (devuelve el JWT) | — |

El token viaja en el encabezado `Authorization: Bearer <token>`. Cada función protegida valida la firma y la expiración (2 horas) y responde:

- **401** si el token falta, es inválido o expiró;
- **403** si un usuario sin rol `admin` intenta borrar;
- **409** si se intenta borrar un estadio o una liga que todavía usa algún equipo.

## Detalles

**Descripción.** Es la continuación del Proyecto 2: el servicio REST sigue en **Netlify Functions** con **autenticación JWT**, pero la base de datos pasó de MongoDB Atlas a **Redis Cloud**. El frontend en Vue.js no cambió.

**Estructura en Redis.** Cada entidad es un elemento de Redis (un **Hash**) y cada registro es un valor de ese Hash, guardado como JSON:

| Llave | Tipo | Campo → valor |
|---|---|---|
| `equipos` (principal) | Hash | `_id` → nombre, ciudad, país, fundación, escudo, `estadio_id`, `liga_id` |
| `estadios` (secundaria) | Hash | `_id` → nombre, ciudad, país, capacidad, año de inauguración, imagen |
| `ligas` (secundaria) | Hash | `_id` → nombre, país, confederación, nivel, fundación, logo |
| `users` | Hash | correo → nombre, correo, contraseña (hash bcrypt), rol (`user` o `admin`) |
| `equipos_N`, `estadios_N`, `ligas_N` | String | Último id asignado |

Las relaciones se mantienen con referencias: `estadio_id` y `liga_id` de cada equipo son el `_id` de un estadio y de una liga. Al consultar equipos, la función busca esos registros con `HMGET` y agrega `estadio_nombre` y `liga_nombre`.

**Diferencias con el Tutorial 14.**

- *Un Hash por entidad en lugar de una llave por registro (`book_<id>`).* En el tutorial, el listado recorre las llaves de `1` a `book_N` y el borrado hace `DECR book_N`. Si se borra un registro intermedio, el listado devuelve un `null`, deja fuera el último registro y el siguiente `INCR` puede repetir un id existente. Con un Hash, el listado usa `HVALS` y el borrado `HDEL`, sin depender del contador. Además, coincide con el enunciado: "cada entidad pasa a ser un elemento de Redis y cada registro un valor".
- *El contador `<entidad>_N` solo crece.* Como en el tutorial, la función asigna el id nuevo con `INCR` (el `_id` que envía el frontend es temporal y se ignora), pero nunca se decrementa, así que los ids no se repiten.
- *Una función por recurso en lugar de una por operación.* Las redirecciones de Netlify distinguen solo la ruta, no el método ni el cuerpo, así que cada función (`equipos.js`, `estadios.js`, `ligas.js`) decide la operación según el método, el id y `_method`.
- *Usuarios indexados por correo.* El login busca directamente con `HGET users <correo>`, y el registro usa `HSETNX` para rechazar correos repetidos (409) de forma atómica.

**Conexión a Redis.** `netlify/functions/redisDB.js` crea un único cliente `ioredis` a nivel de módulo, por lo que se reutiliza entre invocaciones de la misma instancia de la función. Netlify Functions no tiene IPs fijas, así que la base de Redis Cloud no debe restringir el acceso por IP.

**Token en `localStorage`.** El material del curso recomienda cookies HTTP-only, pero JavaScript no puede leer esas cookies y entonces no podría armar el encabezado `Authorization: Bearer` que exige el enunciado.

**URL del backend.** Como en el tutorial, el frontend llama al backend publicado: la URL está en `app.config.globalProperties.url` (`src/main.js`) y cada llamada usa `this.url + '/api/...'`. Para probar solo las funciones locales, se pueden llamar con curl en `http://localhost:8888/api/...`.

## Entrega

```
git archive -o proyecto3.zip HEAD
```

El `.zip` contiene solo los archivos versionados: no incluye `node_modules`, `.env` ni `docs/`.
