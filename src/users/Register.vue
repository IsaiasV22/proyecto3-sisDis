<template>
  <div class="row">
    <div class="eleven column" style="margin-top: 5%">
      <h2>{{ title }}</h2>
      <form v-on:submit.prevent="registerUser()">
        <div class="row">
          <div class="twelve columns">
            <label for="nameInput">Nombre</label>
            <input
              id="nameInput"
              class="u-full-width"
              type="text"
              v-model="user.name"
            />
          </div>
        </div>
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
          <router-link class="button" to="/login"
            >¿Ya tiene cuenta? Inicie sesión</router-link
          >
          <input
            class="button-primary"
            style="float: right"
            type="submit"
            value="Registrarse"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: "Registro de usuario",
      user: { name: "", email: "", password: "" },
      error: "",
    };
  },
  methods: {
    registerUser: function () {
      this.error = "";
      fetch(this.url + "/api/register", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(this.user),
      }).then((response) => {
        if (response.status === 409) {
          this.error = "Ya existe un usuario con ese correo";
        } else if (!response.ok) {
          this.error = "Debe completar todos los campos";
        } else {
          this.$router.push("/login");
        }
      });
    },
  },
};
</script>
