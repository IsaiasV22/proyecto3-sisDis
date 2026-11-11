"use strict";

// Cliente único en el ámbito del módulo: se reutiliza entre invocaciones (Tutorial 14 / Tarea 5)
const Redis = require('ioredis');
const client = new Redis({
  host:process.env.REDIS_HOST,
  port:process.env.REDIS_PORT,
  username:process.env.REDIS_USER,
  password:process.env.REDIS_PSW});

client.on("connect", function() {
  console.log("You are now connected");
});

module.exports = client;
