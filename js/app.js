// app.js — muestra el estado de conexión (el Service Worker se registra en index.html)
function actualizarPildoraConexion() {
  const pildora = document.getElementById("estado-conexion");
  if (!pildora) return;
  const enLinea = navigator.onLine;
  pildora.textContent = enLinea ? "conectado" : "sin conexión";
  pildora.classList.toggle("pill--offline", !enLinea);
}

document.addEventListener("DOMContentLoaded", actualizarPildoraConexion);
window.addEventListener("online", actualizarPildoraConexion);
window.addEventListener("offline", actualizarPildoraConexion);