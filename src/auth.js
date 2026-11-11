import { reactive } from "vue";

// Sesión del usuario: el token JWT y los datos que devuelve /api/login.
// Se guarda en localStorage para sobrevivir recargas (ver README).

function load() {
  try {
    const session = JSON.parse(localStorage.getItem("session"));
    // Descarta la sesión si el token ya expiró (exp viene en segundos)
    const base64 = session.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    if (payload.exp * 1000 > Date.now()) return session;
  } catch (e) {
    // sin sesión o sesión corrupta
  }
  localStorage.removeItem("session");
  return null;
}

export const auth = reactive({ user: load() });

export function login(session) {
  localStorage.setItem("session", JSON.stringify(session));
  auth.user = session;
}

export function logout() {
  localStorage.removeItem("session");
  auth.user = null;
}

export function isAdmin() {
  return auth.user?.role === "admin";
}
