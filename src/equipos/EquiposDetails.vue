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
              v-model="equipo.nombre"
            />
          </div>
          <div class="six columns">
            <label for="ciudadInput">Ciudad</label>
            <input
              class="u-full-width"
              type="text"
              :disabled="show"
              v-model="equipo.ciudad"
            />
          </div>
        </div>
        <div class="row">
          <div class="six columns">
            <label for="paisInput">País</label>
            <input
              class="u-full-width"
              type="text"
              :disabled="show"
              v-model="equipo.pais"
            />
          </div>
          <div class="six columns">
            <label for="fundacionInput">Fundación</label>
            <input
              class="u-full-width"
              type="number"
              :disabled="show"
              v-model.number="equipo.fundacion"
            />
          </div>
        </div>
        <div class="row">
          <div class="twelve columns">
            <label for="escudoInput">Escudo (URL de imagen)</label>
            <input
              class="u-full-width"
              type="text"
              :disabled="show"
              v-model="equipo.escudo_url"
            />
          </div>
        </div>
        <div class="row" v-if="equipo.escudo_url">
          <div class="twelve columns">
            <img
              :src="equipo.escudo_url"
              alt="Escudo"
              style="max-height: 120px"
            />
          </div>
        </div>
        <div class="row">
          <div class="six columns">
            <label>Estadio</label>
            <select
              v-if="!show"
              class="u-full-width"
              v-model="equipo.estadio_id"
            >
              <option value="">-- Seleccione --</option>
              <option
                v-for="estadio in estadios"
                :key="estadio._id"
                :value="estadio._id"
              >
                {{ estadio.nombre }}
              </option>
            </select>
            <div v-else>
              <router-link :to="'/estadios/show/' + equipo.estadio_id">
                {{ equipo.estadio_nombre }}
              </router-link>
            </div>
          </div>
          <div class="six columns">
            <label>Liga</label>
            <select v-if="!show" class="u-full-width" v-model="equipo.liga_id">
              <option value="">-- Seleccione --</option>
              <option v-for="liga in ligas" :key="liga._id" :value="liga._id">
                {{ liga.nombre }}
              </option>
            </select>
            <div v-else>
              <router-link :to="'/ligas/show/' + equipo.liga_id">
                {{ equipo.liga_nombre }}
              </router-link>
            </div>
          </div>
          <router-link class="button button-primary" to="/equipos"
            >Back</router-link
          >
          <a
            v-if="edit"
            class="button button-primary"
            style="float: right"
            v-on:click="updateEquipo()"
            >Update</a
          >
          <a
            v-if="create"
            class="button button-primary"
            style="float: right"
            v-on:click="createEquipo()"
            >Create</a
          >
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { apiFetch } from "../api";

export default {
  props: ["create", "edit", "show"],
  data: function () {
    return {
      title: "Equipo",
      equipo: {
        _id: Math.floor(Math.random() * 100000000),
        nombre: "",
        ciudad: "",
        pais: "",
        fundacion: "",
        escudo_url: "",
        estadio_id: "",
        liga_id: "",
      },
      estadios: [],
      ligas: [],
    };
  },
  created() {
    const route = this.$route;
    if (!this.create) {
      this.findEquipo(route.params.id);
    }
    if (!this.show) {
      this.loadEstadios();
      this.loadLigas();
    }
  },
  methods: {
    findEquipo: function (id) {
      apiFetch(this.url + "/api/equipos/" + id, { headers: { Accept: "application/json" } })
        .then((response) => response.json())
        .then((result) => {
          this.equipo = result;
        });
    },
    loadEstadios: function () {
      apiFetch(this.url + "/api/estadios", { headers: { Accept: "application/json" } })
        .then((response) => response.json())
        .then((result) => {
          this.estadios = result;
        });
    },
    loadLigas: function () {
      apiFetch(this.url + "/api/ligas", { headers: { Accept: "application/json" } })
        .then((response) => response.json())
        .then((result) => {
          this.ligas = result;
        });
    },
    updateEquipo: function () {
      var id = this.$route.params.id;
      apiFetch(this.url + "/api/equipos/" + id, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(this.equipo),
      }).then((data) => {
        this.$router.push("/equipos");
      });
    },
    createEquipo: function () {
      apiFetch(this.url + "/api/equipos", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(this.equipo),
      }).then((data) => {
        this.$router.push("/equipos");
      });
    },
  },
};
</script>
