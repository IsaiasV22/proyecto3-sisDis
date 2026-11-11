<template>
  <div class="row">
    <div style="margin-top: 5%">
      <h2>{{ title }}</h2>
      <table>
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Ciudad</th>
            <th>País</th>
            <th>Capacidad</th>
            <th>Año inauguración</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="estadio in estadios" :key="estadio._id">
            <td>
              <img
                :src="estadio.imagen_url"
                alt="Estadio"
                style="height: 40px"
              />
            </td>
            <td>{{ estadio.nombre }}</td>
            <td>{{ estadio.ciudad }}</td>
            <td>{{ estadio.pais }}</td>
            <td>{{ estadio.capacidad }}</td>
            <td>{{ estadio.anio_inauguracion }}</td>
            <td>
              <router-link class="button" :to="'/estadios/show/' + estadio._id"
                >Show</router-link
              >
              <router-link
                v-if="auth.user"
                class="button"
                :to="'/estadios/edit/' + estadio._id"
                >Edit</router-link
              >
              <a
                v-if="isAdmin()"
                class="button"
                v-on:click="deleteEstadio(estadio._id)"
                >Erase</a
              >
            </td>
          </tr>
        </tbody>
      </table>
      <router-link
        v-if="auth.user"
        class="button button-primary"
        to="/estadios/create"
        >New</router-link
      >
    </div>
  </div>
</template>
<script>
import { apiFetch } from "../api";
import { auth, isAdmin } from "../auth";

export default {
  data() {
    return {
      auth,
      estadios: [],
      title: "Estadios",
    };
  },
  methods: {
    isAdmin,
    allEstadios() {
      apiFetch(this.url + "/api/estadios", { headers: { Accept: "application/json" } })
        .then((response) => response.json())
        .then((result) => {
          this.estadios = result;
        });
    },
    deleteEstadio(id) {
      apiFetch(this.url + "/api/estadios/" + id, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ _method: "DELETE" }),
      }).then((response) => {
        if (!response.ok) {
          return response.text().then((msg) => {
            alert(msg);
          });
        }
        this.allEstadios();
      });
    },
  },
  mounted() {
    this.allEstadios();
  },
};
</script>
