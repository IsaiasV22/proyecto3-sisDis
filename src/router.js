import { createRouter, createWebHistory } from "vue-router";
import { auth } from "./auth";

import EquiposIndex from "./equipos/EquiposIndex.vue";
import EquiposDetails from "./equipos/EquiposDetails.vue";
import EstadiosIndex from "./estadios/EstadiosIndex.vue";
import EstadiosDetails from "./estadios/EstadiosDetails.vue";
import LigasIndex from "./ligas/LigasIndex.vue";
import LigasDetails from "./ligas/LigasDetails.vue";
import Login from "./users/Login.vue";
import Register from "./users/Register.vue";

// Crear, editar y borrar requieren sesión
const requiresAuth = { requiresAuth: true };

const routes = [
  { path: "/equipos", component: EquiposIndex, props: true },
  {
    path: "/equipos/show/:id",
    component: EquiposDetails,
    props: { show: true },
  },
  {
    path: "/equipos/edit/:id",
    component: EquiposDetails,
    props: { edit: true },
    meta: requiresAuth,
  },
  {
    path: "/equipos/create",
    component: EquiposDetails,
    props: { create: true },
    meta: requiresAuth,
  },
  {
    path: "/equipos/delete/:id",
    component: EquiposDetails,
    props: { delete: true },
    meta: requiresAuth,
  },

  { path: "/estadios", component: EstadiosIndex, props: true },
  {
    path: "/estadios/show/:id",
    component: EstadiosDetails,
    props: { show: true },
  },
  {
    path: "/estadios/edit/:id",
    component: EstadiosDetails,
    props: { edit: true },
    meta: requiresAuth,
  },
  {
    path: "/estadios/create",
    component: EstadiosDetails,
    props: { create: true },
    meta: requiresAuth,
  },
  {
    path: "/estadios/delete/:id",
    component: EstadiosDetails,
    props: { delete: true },
    meta: requiresAuth,
  },

  { path: "/ligas", component: LigasIndex, props: true },
  { path: "/ligas/show/:id", component: LigasDetails, props: { show: true } },
  {
    path: "/ligas/edit/:id",
    component: LigasDetails,
    props: { edit: true },
    meta: requiresAuth,
  },
  {
    path: "/ligas/create",
    component: LigasDetails,
    props: { create: true },
    meta: requiresAuth,
  },
  {
    path: "/ligas/delete/:id",
    component: LigasDetails,
    props: { delete: true },
    meta: requiresAuth,
  },

  { path: "/login", component: Login },
  { path: "/register", component: Register },

  { path: "/", component: EquiposIndex, props: true },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.user) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }
});

export default router;
