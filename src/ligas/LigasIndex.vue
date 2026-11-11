<template>
  <div class="row">
    <div style="margin-top: 5%">
      <h2>{{ title }}</h2>
      <table>
        <thead>
          <tr>
            <th>Logo</th>
            <th>Nombre</th>
            <th>País</th>
            <th>Confederación</th>
            <th>Nivel</th>
            <th>Fundación</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="liga in ligas" :key="liga._id">
            <td>
              <img :src="liga.logo_url" alt="Liga" style="height: 40px" />
            </td>
            <td>{{ liga.nombre }}</td>
            <td>{{ liga.pais }}</td>
            <td>{{ liga.confederacion }}</td>
            <td>{{ liga.nivel }}</td>
            <td>{{ liga.fundacion }}</td>
            <td>
              <router-link class="button" :to="'/ligas/show/' + liga._id"
                >Show</router-link
              >
              <router-link
                v-if="auth.user"
                class="button"
                :to="'/ligas/edit/' + liga._id"
                >Edit</router-link
              >
              <a
                v-if="isAdmin()"
                class="button"
                v-on:click="deleteLiga(liga._id)"
                >Erase</a
              >
            </td>
          </tr>
        </tbody>
      </table>
      <router-link
        v-if="auth.user"
        class="button button-primary"
        to="/ligas/create"
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
      ligas: [],
      title: "Ligas / Torneos",
    };
  },
  methods: {
    isAdmin,
    allLigas() {
      apiFetch(this.url + "/api/ligas", { headers: { Accept: "application/json" } })
        .then((response) => response.json())
        .then((result) => {
          this.ligas = result;
        });
    },
    deleteLiga(id) {
      apiFetch(this.url + "/api/ligas/" + id, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ _method: "DELETE" }),
      }).then((response) => {
        if (!response.ok) {
          return response.text().then((msg) => {
            alert(msg);
          });
        }
        this.allLigas();
      });
    },
  },
  mounted() {
    this.allLigas();
  },
};
</script>
