import router from "./router";
import { auth, logout } from "./auth";

// fetch que adjunta el token (Authorization: Bearer) y, si el servicio
// responde 401 (token inválido o expirado), cierra la sesión y redirige
// al inicio de sesión.
export function apiFetch(url, options = {}) {
  const headers = { Accept: "application/json", ...options.headers };
  if (auth.user) headers.Authorization = "Bearer " + auth.user.token;

  return fetch(url, { ...options, headers }).then((response) => {
    if (response.status === 401) {
      logout();
      router.push({ path: "/login", query: { expired: "1" } });
      throw new Error("Sesión expirada");
    }
    return response;
  });
}
