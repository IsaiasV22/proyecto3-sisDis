<template>
  <div id="app" class="container">
    <div class="row" style="margin-top: 5%">
      <router-link
        class="button button-primary"
        style="margin-right: 10px"
        to="/equipos"
        >Equipos
      </router-link>
      <router-link
        class="button button-primary"
        style="margin-right: 10px"
        to="/estadios"
        >Estadios
      </router-link>
      <router-link class="button button-primary" to="/ligas"
        >Ligas
      </router-link>
      <span style="float: right" v-if="auth.user">
        {{ auth.user.name }} ({{ auth.user.role }})
        <a class="button" style="margin-left: 10px" v-on:click="salir()"
          >Logout</a
        >
      </span>
      <span style="float: right" v-else>
        <router-link class="button" style="margin-right: 10px" to="/login"
          >Login</router-link
        >
        <router-link class="button" to="/register">Registro</router-link>
      </span>
    </div>
    <router-view> </router-view>
  </div>
</template>

<script>
import { auth, logout } from "./auth";

export default {
  data() {
    return { auth };
  },
  methods: {
    salir() {
      logout();
      this.$router.push("/login");
    },
  },
};
</script>
