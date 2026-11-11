import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "./css/normalize.css";
import "./css/skeleton.css";

const app = createApp(App);

// URL del sitio publicado en Netlify (backend), como en el tutorial
app.config.globalProperties.url = "https://proyecto2-sisdis-isaiasviquez.netlify.app";

app.use(router).mount("#app");
