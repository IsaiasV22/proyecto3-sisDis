<template>
  <div class="row">
    <div style="margin-top: 5%">
      <h2>{{ title }}</h2>
      <table>
        <thead>
          <tr>
            <th>Escudo</th>
            <th>Nombre</th>
            <th>Ciudad</th>
            <th>País</th>
            <th>Fundación</th>
            <th>Estadio</th>
            <th>Liga</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="equipo in equipos" :key="equipo._id">
            <td>
              <img :src="equipo.escudo_url" alt="Escudo" style="height: 40px" />
            </td>
            <td>{{ equipo.nombre }}</td>
            <td>{{ equipo.ciudad }}</td>
            <td>{{ equipo.pais }}</td>
            <td>{{ equipo.fundacion }}</td>
            <td>{{ equipo.estadio_nombre }}</td>
            <td>{{ equipo.liga_nombre }}</td>
            <td>
              <router-link class="button" :to="'/equipos/show/' + equipo._id"
                >Show</router-link
              >
              <router-link
                v-if="auth.user"
                class="button"
                :to="'/equipos/edit/' + equipo._id"
                >Edit</router-link
              >
              <a
                v-if="isAdmin()"
                class="button"
                v-on:click="deleteEquipo(equipo._id)"
                >Erase</a
              >
            </td>
          </tr>
        </tbody>
      </table>
      <router-link
        v-if="auth.user"
        class="button button-primary"
        to="/equipos/create"
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
      equipos: [],
      title: "Equipos",
    };
  },
  methods: {
    isAdmin,
    allEquipos() {
      apiFetch(this.url + "/api/equipos", { headers: { Accept: "application/json" } })
        .then((response) => response.json())
        .then((result) => {
          this.equipos = result;
        });
    },
    deleteEquipo(id) {
      apiFetch(this.url + "/api/equipos/" + id, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ _method: "DELETE" }),
      }).then((response) => {
        if (!response.ok) {
          return response.text().then((msg) => {
            alert(msg);
          });
        }
        this.allEquipos();
      });
    },
  },
  mounted() {
    this.allEquipos();
  },
};
</script>
