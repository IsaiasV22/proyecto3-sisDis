<template>
  <div class="row">
    <div class="eleven column" style="margin-top: 5%">
      <h2>{{ title }}</h2>
      <form>
        <div class="row">
          <div class="six columns">
            <label for="nombreInput">Nombre</label>
            <input
              class="u-full-width"
              type="text"
              :disabled="show"
              v-model="liga.nombre"
            />
          </div>
          <div class="six columns">
            <label for="paisInput">País</label>
            <input
              class="u-full-width"
              type="text"
              :disabled="show"
              v-model="liga.pais"
            />
          </div>
        </div>
        <div class="row">
          <div class="six columns">
            <label for="confederacionInput">Confederación</label>
            <input
              class="u-full-width"
              type="text"
              :disabled="show"
              v-model="liga.confederacion"
            />
          </div>
          <div class="six columns">
            <label for="nivelInput">Nivel</label>
            <input
              class="u-full-width"
              type="text"
              :disabled="show"
              v-model="liga.nivel"
            />
          </div>
        </div>
        <div class="row">
          <div class="six columns">
            <label for="fundacionInput">Fundación</label>
            <input
              class="u-full-width"
              type="number"
              :disabled="show"
              v-model.number="liga.fundacion"
            />
          </div>
          <div class="six columns">
            <label for="logoInput">Logo (URL)</label>
            <input
              class="u-full-width"
              type="text"
              :disabled="show"
              v-model="liga.logo_url"
            />
          </div>
        </div>
        <div class="row" v-if="liga.logo_url">
          <div class="twelve columns">
            <img :src="liga.logo_url" alt="Liga" style="max-height: 120px" />
          </div>
        </div>
        <div class="row">
          <router-link class="button button-primary" to="/ligas"
            >Back</router-link
          >
          <a
            v-if="edit"
            class="button button-primary"
            style="float: right"
            v-on:click="updateLiga()"
            >Update</a
          >
          <a
            v-if="create"
            class="button button-primary"
            style="float: right"
            v-on:click="createLiga()"
            >Create</a
          >
        </div>
      </form>
      <div class="row" v-if="show && equiposVinculados.length">
        <div class="twelve columns">
          <h4>Equipos que juegan en esta liga</h4>
          <ul>
            <li v-for="equipo in equiposVinculados" :key="equipo._id">
              <router-link :to="'/equipos/show/' + equipo._id">{{
                equipo.nombre
              }}</router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiFetch } from "../api";

export default {
  props: ["create", "edit", "show"],
  data: function () {
    return {
      title: "Liga",
      liga: {
        _id: Math.floor(Math.random() * 100000000),
        nombre: "",
        pais: "",
        confederacion: "",
        nivel: "",
        fundacion: "",
        logo_url: "",
      },
      equiposVinculados: [],
    };
  },
  created() {
    const route = this.$route;
    if (!this.create) {
      this.findLiga(route.params.id);
    }
    if (this.show) {
      this.loadEquiposVinculados(route.params.id);
    }
  },
  methods: {
    findLiga: function (id) {
      apiFetch(this.url + "/api/ligas/" + id, { headers: { Accept: "application/json" } })
        .then((response) => response.json())
        .then((result) => {
          this.liga = result;
        });
    },
    loadEquiposVinculados: function (id) {
      apiFetch(this.url + "/api/equipos", { headers: { Accept: "application/json" } })
        .then((response) => response.json())
        .then((result) => {
          this.equiposVinculados = result.filter(
            (equipo) => equipo.liga_id === Number(id),
          );
        });
    },
    updateLiga: function () {
      var id = this.$route.params.id;
      apiFetch(this.url + "/api/ligas/" + id, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(this.liga),
      }).then((data) => {
        this.$router.push("/ligas");
      });
    },
    createLiga: function () {
      apiFetch(this.url + "/api/ligas", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(this.liga),
      }).then((data) => {
        this.$router.push("/ligas");
      });
    },
  },
};
</script>
