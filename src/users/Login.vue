<template>
  <div class="row">
    <div class="eleven column" style="margin-top: 5%">
      <h2>{{ title }}</h2>
      <p v-if="$route.query.expired">
        Su sesión expiró. Inicie sesión de nuevo.
      </p>
      <form v-on:submit.prevent="loginUser()">
        <div class="row">
          <div class="six columns">
            <label for="emailInput">Correo</label>
            <input
              id="emailInput"
              class="u-full-width"
              type="email"
              v-model="user.email"
            />
          </div>
          <div class="six columns">
            <label for="passwordInput">Contraseña</label>
            <input
              id="passwordInput"
              class="u-full-width"
              type="password"
              v-model="user.password"
            />
          </div>
        </div>
        <p v-if="error" style="color: #c0392b">{{ error }}</p>
        <div class="row">
          <router-link class="button" to="/register"
            >¿No tiene cuenta? Regístrese</router-link
          >
          <input
            class="button-primary"
            style="float: right"
            type="submit"
            value="Login"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { login } from "../auth";

export default {
  data() {
    return {
      title: "Inicio de sesión",
      user: { email: "", password: "" },
      error: "",
    };
  },
  methods: {
    loginUser: function () {
      this.error = "";
      fetch(this.url + "/api/login", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(this.user),
      }).then((response) => {
        if (!response.ok) {
          this.error = "Correo o contraseña incorrectos";
          return;
        }
        return response.json().then((session) => {
          login(session);
          this.$router.push(this.$route.query.redirect || "/equipos");
        });
      });
    },
  },
};
</script>
