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
              v-model="estadio.nombre"
            />
          </div>
          <div class="six columns">
            <label for="ciudadInput">Ciudad</label>
            <input
              class="u-full-width"
              type="text"
              :disabled="show"
              v-model="estadio.ciudad"
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
              v-model="estadio.pais"
            />
          </div>
          <div class="six columns">
            <label for="capacidadInput">Capacidad</label>
            <input
              class="u-full-width"
              type="number"
              :disabled="show"
              v-model.number="estadio.capacidad"
            />
          </div>
        </div>
        <div class="row">
          <div class="six columns">
            <label for="anioInput">Año de inauguración</label>
            <input
              class="u-full-width"
              type="number"
              :disabled="show"
              v-model.number="estadio.anio_inauguracion"
            />
          </div>
          <div class="six columns">
            <label for="imagenInput">Imagen (URL)</label>
            <input
              class="u-full-width"
              type="text"
              :disabled="show"
              v-model="estadio.imagen_url"
            />
          </div>
        </div>
        <div class="row" v-if="estadio.imagen_url">
          <div class="twelve columns">
            <img
              :src="estadio.imagen_url"
              alt="Estadio"
              style="max-height: 160px"
            />
          </div>
        </div>
        <div class="row">
          <router-link class="button button-primary" to="/estadios"
            >Back</router-link
          >
          <a
            v-if="edit"
            class="button button-primary"
            style="float: right"
            v-on:click="updateEstadio()"
            >Update</a
          >
          <a
            v-if="create"
            class="button button-primary"
            style="float: right"
            v-on:click="createEstadio()"
            >Create</a
          >
        </div>
      </form>
      <div class="row" v-if="show && equiposVinculados.length">
        <div class="twelve columns">
          <h4>Equipos que juegan en este estadio</h4>
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
      title: "Estadio",
      estadio: {
        _id: Math.floor(Math.random() * 100000000),
        nombre: "",
        ciudad: "",
        pais: "",
        capacidad: "",
        anio_inauguracion: "",
        imagen_url: "",
      },
      equiposVinculados: [],
    };
  },
  created() {
    const route = this.$route;
    if (!this.create) {
      this.findEstadio(route.params.id);
    }
    if (this.show) {
      this.loadEquiposVinculados(route.params.id);
    }
  },
  methods: {
    findEstadio: function (id) {
      apiFetch(this.url + "/api/estadios/" + id, { headers: { Accept: "application/json" } })
        .then((response) => response.json())
        .then((result) => {
          this.estadio = result;
        });
    },
    loadEquiposVinculados: function (id) {
      apiFetch(this.url + "/api/equipos", { headers: { Accept: "application/json" } })
        .then((response) => response.json())
        .then((result) => {
          this.equiposVinculados = result.filter(
            (equipo) => equipo.estadio_id === Number(id),
          );
        });
    },
    updateEstadio: function () {
      var id = this.$route.params.id;
      apiFetch(this.url + "/api/estadios/" + id, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(this.estadio),
      }).then((data) => {
        this.$router.push("/estadios");
      });
    },
    createEstadio: function () {
      apiFetch(this.url + "/api/estadios", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(this.estadio),
      }).then((data) => {
        this.$router.push("/estadios");
      });
    },
  },
};
</script>
