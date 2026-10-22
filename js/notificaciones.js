// notificaciones.js — Notification API (paso 15)
// Esta es la API del NAVEGADOR (no el sistema push completo, que necesitaría un
// servidor con claves VAPID). Sirve para mostrar avisos del lado del cliente y
// para entender el permiso que el usuario debe conceder.
// Nota: solo funciona en https:// o en localhost (GitHub Pages ya es https).

const ICONO_NOTIFICACION = "img/logo.png";

// "Notification" no existe en todos los navegadores/contextos; se comprueba primero
function notificacionesSoportadas() {
  return "Notification" in window;
}

// Muestra una notificación del sistema, pero SOLO si el usuario ya dio permiso.
// Si hay un Service Worker registrado se usa showNotification (es lo que exige
// Android); si no, se usa new Notification. Devuelve true si se mostró.
async function mostrarNotificacion(titulo, opciones = {}) {
  if (!notificacionesSoportadas() || Notification.permission !== "granted") return false;

  const config = { icon: ICONO_NOTIFICACION, ...opciones };
  try {
    if ("serviceWorker" in navigator) {
      const registro = await navigator.serviceWorker.getRegistration();
      if (registro) {
        await registro.showNotification(titulo, config);
        return true;
      }
    }
    new Notification(titulo, config);
    return true;
  } catch (error) {
    console.error("No se pudo mostrar la notificación:", error);
    return false;
  }
}

// La llama carrito.js cada vez que se agrega un producto.
// Con el mismo "tag", una notificación nueva reemplaza a la anterior
// en lugar de apilarse si agregas varios productos seguidos.
function notificarProductoAgregado(nombre) {
  mostrarNotificacion("Pedido agregado", {
    body: `${nombre} se agregó a tu carrito.`,
    tag: "pedido-agregado",
  });
}

// Ajusta el botón y el mensaje según el permiso que ya tenga el navegador
function actualizarEstadoNotificaciones() {
  const boton = document.getElementById("btn-notificar");
  const mensaje = document.getElementById("notificaciones-mensaje");
  if (!boton || !mensaje) return; // por si la sección no está en el HTML

  if (!notificacionesSoportadas()) {
    boton.disabled = true;
    mensaje.textContent = "Este navegador no soporta notificaciones.";
    return;
  }

  // Notification.permission vale "default" (aún no se pregunta), "granted" o "denied"
  const permiso = Notification.permission;

  if (permiso === "granted") {
    boton.disabled = true;
    boton.textContent = "Notificaciones activadas ✓";
    mensaje.textContent = "Te avisaremos cuando agregues un pedido.";
  } else if (permiso === "denied") {
    boton.disabled = true;
    boton.textContent = "Notificaciones bloqueadas";
    mensaje.textContent = "Las bloqueaste. Puedes permitirlas desde el candado de la barra de direcciones.";
  } else {
    boton.disabled = false;
    boton.textContent = "Activar notificaciones";
    mensaje.textContent = "";
  }
}

async function pedirPermisoNotificaciones() {
  const mensaje = document.getElementById("notificaciones-mensaje");

  if (!notificacionesSoportadas()) {
    mensaje.textContent = "Este navegador no soporta notificaciones.";
    return;
  }

  // Notification.requestPermission() abre el diálogo del navegador
  // ("bloquear" / "permitir") y devuelve una promesa con la respuesta del usuario.
  const permiso = await Notification.requestPermission();
  actualizarEstadoNotificaciones();

  if (permiso === "granted") {
    // Notificación de prueba: title, y luego un objeto con opciones
    mostrarNotificacion("Kristal Bubble Bar", {
      body: "¡Listo! Te avisaremos cuando agregues un pedido.",
      tag: "bienvenida",
    });
  } else if (permiso === "denied") {
    mensaje.textContent = "No diste permiso para notificaciones.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const boton = document.getElementById("btn-notificar");
  if (boton) boton.addEventListener("click", pedirPermisoNotificaciones);
  actualizarEstadoNotificaciones();
});