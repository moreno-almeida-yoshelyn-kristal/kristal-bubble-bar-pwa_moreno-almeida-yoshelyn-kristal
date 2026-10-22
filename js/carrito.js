// carrito.js — Almacenamiento local y "sincronización" offline/online
// Aquí usamos localStorage: una caja de guardado que vive DENTRO del navegador
// y sobrevive aunque cierres la pestaña o se vaya el internet.

const CLAVE_CARRITO = "kristal-bubble-bar-carrito";

// Lee el carrito guardado en localStorage (si no hay nada, regresa un array vacío)
function leerCarrito() {
  const guardado = localStorage.getItem(CLAVE_CARRITO); // localStorage solo guarda texto
  return guardado ? JSON.parse(guardado) : []; // JSON.parse convierte ese texto de vuelta a un array
}

// Guarda el array del carrito en localStorage (JSON.stringify lo convierte a texto)
function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  // NUEVO: si el carrito cambia sin internet, queda "pendiente" de enviarse
  if (!navigator.onLine) marcarPendiente(true);
}

// NUEVO: muestra un aviso (toast) que aparece, se queda unos segundos y desaparece solo.
// El contenedor se crea la primera vez, así que no hace falta tocar el HTML.
function mostrarToast(mensaje) {
  let contenedor = document.getElementById("toasts");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "toasts";
    contenedor.setAttribute("role", "status");     // los lectores de pantalla lo anuncian
    contenedor.setAttribute("aria-live", "polite");
    document.body.appendChild(contenedor);
  }

  const toast = document.createElement("div");
  toast.className = "toast";

  const icono = document.createElement("span");
  icono.className = "toast__icono";
  icono.textContent = "✓";

  const texto = document.createElement("span");
  texto.textContent = mensaje; // textContent (no innerHTML) para no meter HTML del nombre

  toast.append(icono, texto);
  contenedor.appendChild(toast);

  // Se quita solo: primero se desvanece y luego se elimina del DOM
  setTimeout(() => {
    toast.classList.add("toast--salida");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, 2500);
}

// Agrega un producto al carrito (o le sube la cantidad si ya estaba)
function agregarAlCarrito(producto) {
  const carrito = leerCarrito();
  const existente = carrito.find((item) => item.id === producto.id);

  // NUEVO: la foto del producto (según cómo se llame el campo en catalogo.json)
  const foto = producto.imagen || producto.foto || producto.img || "";

  if (existente) {
    existente.cantidad += 1;
    if (!existente.foto) existente.foto = foto; // por si se agregó antes de guardar fotos
  } else {
    carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, foto: foto, cantidad: 1 });
  }

  guardarCarrito(carrito);
  pintarCarrito();
  mostrarToast(`Agregaste ${producto.nombre} al carrito`); // NUEVO

  // NUEVO (paso 15): aviso del navegador, solo si el usuario ya dio permiso.
  // La función vive en js/notificaciones.js; se comprueba por si ese archivo no está cargado.
  if (typeof notificarProductoAgregado === "function") notificarProductoAgregado(producto.nombre);
}

// Sube o baja la cantidad de un producto ya en el carrito con los botones +/-;
// si la cantidad llega a 0, el producto se quita solo.
function cambiarCantidad(id, delta) {
  const carrito = leerCarrito();
  const item = carrito.find((item) => item.id === id);
  if (!item) return;

  item.cantidad += delta;
  const actualizado = item.cantidad <= 0 ? carrito.filter((item) => item.id !== id) : carrito;

  guardarCarrito(actualizado);
  pintarCarrito();
}

// Quita un producto del carrito sin importar su cantidad
function quitarDelCarrito(id) {
  const carrito = leerCarrito().filter((item) => item.id !== id);
  guardarCarrito(carrito);
  pintarCarrito();
}

// Dibuja el carrito en pantalla a partir de lo que hay en localStorage.
// La cantidad va en su propia columna (con botones - / +), separada del
// nombre y del precio.
function pintarCarrito() {
  const carrito = leerCarrito();
  const lista = document.getElementById("carrito-lista");
  const total = document.getElementById("carrito-total");
  if (!lista || !total) return; // por si la sección del carrito aún no está en el HTML

  lista.innerHTML = "";
  let suma = 0;

  if (carrito.length === 0) {
    lista.innerHTML = '<li class="carrito-vacio">Tu carrito está vacío. ¡Agrega tu bebida favorita!</li>';
  }

  carrito.forEach((item) => {
    const subtotal = item.precio * item.cantidad;
    suma += subtotal;

    // NUEVO: si el producto tiene foto, se dibuja dentro de la misma columna del nombre
    const foto = item.foto
      ? `<img src="${item.foto}" alt="${item.nombre}" class="carrito-foto" width="48" height="48">`
      : "";

    const li = document.createElement("li");
    li.innerHTML = `
      <span class="carrito-nombre">${foto}${item.nombre}</span>
      <span class="carrito-cantidad">
        <button type="button" data-accion="restar" data-id="${item.id}" aria-label="Quitar una unidad de ${item.nombre}">−</button>
        <span class="carrito-cantidad__valor">${item.cantidad}</span>
        <button type="button" data-accion="sumar" data-id="${item.id}" aria-label="Agregar una unidad de ${item.nombre}">+</button>
      </span>
      <span class="carrito-precio">$${subtotal}</span>
      <button type="button" class="carrito-quitar" data-accion="quitar" data-id="${item.id}">Quitar</button>
    `;
    lista.appendChild(li);
  });

  total.textContent = suma;
}

// Un solo listener en <ul id="carrito-lista"> atiende los clics de TODOS los
// botones +/-/Quitar (delegación de eventos), incluso los que se crean después
// dinámicamente cada vez que pintarCarrito() vuelve a dibujar la lista.
function manejarClicCarrito(evento) {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;

  const id = Number(boton.dataset.id);
  if (boton.dataset.accion === "sumar") cambiarCantidad(id, 1);
  if (boton.dataset.accion === "restar") cambiarCantidad(id, -1);
  if (boton.dataset.accion === "quitar") quitarDelCarrito(id);
}

// ---- Sincronización (paso 14) ----
// "Pendiente" = el carrito cambió o se quiso sincronizar mientras no había
// internet. Se guarda en localStorage para que no se pierda si cierras la pestaña.
const CLAVE_PENDIENTE = "kristal-bubble-bar-pendiente";

function hayPendiente() {
  return localStorage.getItem(CLAVE_PENDIENTE) === "1";
}

function marcarPendiente(valor) {
  if (valor) localStorage.setItem(CLAVE_PENDIENTE, "1");
  else localStorage.removeItem(CLAVE_PENDIENTE);
}

// Simula el envío al servidor. En una app real aquí iría:
// fetch("https://mi-api.com/carrito", { method: "POST", headers: {...}, body: JSON.stringify(carrito) })
function enviarCarrito(carrito) {
  return new Promise((resolver) => {
    console.log("Enviando carrito al servidor (simulado):", carrito);
    setTimeout(() => resolver({ ok: true }), 800);
  });
}

// Envía el carrito si hay conexión; si no, lo deja pendiente.
// desdeReconexion = true cuando se llama porque volvió el internet.
async function sincronizarCarrito(desdeReconexion = false) {
  const mensaje = document.getElementById("carrito-mensaje");
  const carrito = leerCarrito();

  if (!navigator.onLine) {
    // navigator.onLine: propiedad del navegador que dice si hay conexión
    marcarPendiente(true);
    mensaje.textContent = "Sin conexión: el carrito se sincronizará cuando vuelva el internet.";
    return;
  }

  if (carrito.length === 0) {
    marcarPendiente(false);
    mensaje.textContent = "Tu carrito está vacío, no hay nada que sincronizar.";
    return;
  }

  mensaje.textContent = "Sincronizando carrito…";
  try {
    await enviarCarrito(carrito);
    marcarPendiente(false);
    mensaje.textContent = "Carrito sincronizado con el servidor (simulado). ✓";
    mostrarToast(desdeReconexion
      ? "Volvió la conexión: tu carrito se sincronizó"
      : "Carrito sincronizado correctamente");
  } catch (error) {
    marcarPendiente(true);
    mensaje.textContent = "No se pudo sincronizar. Lo intentaremos cuando haya conexión.";
  }
}

// Pone en la pastilla de arriba a la izquierda "conectado" o "sin conexión"
function actualizarEstadoConexion() {
  const pastilla = document.getElementById("estado-conexion");
  if (!pastilla) return; // por si el indicador no está en el HTML
  const enLinea = navigator.onLine;
  pastilla.textContent = enLinea ? "conectado" : "sin conexión";
  pastilla.classList.toggle("pill--offline", !enLinea);
}

// Evento "online": volvió el internet. Solo se envía si había algo pendiente.
function alVolverConexion() {
  actualizarEstadoConexion();
  if (hayPendiente()) {
    document.getElementById("carrito-mensaje").textContent = "Volvió la conexión: enviando tu carrito…";
    sincronizarCarrito(true);
  } else {
    mostrarToast("Volvió la conexión");
  }
}

// Evento "offline": se perdió el internet.
function alPerderConexion() {
  actualizarEstadoConexion();
  document.getElementById("carrito-mensaje").textContent = "Se perdió la conexión. Tus cambios se guardan en este dispositivo.";
  mostrarToast("Sin conexión");
}

document.addEventListener("DOMContentLoaded", () => {
  pintarCarrito();
  actualizarEstadoConexion(); // muestra el estado correcto desde que abre la página
  document.getElementById("carrito-lista").addEventListener("click", manejarClicCarrito);
  // () => ... para no pasarle el objeto del clic como parámetro a sincronizarCarrito
  document.getElementById("btn-sincronizar").addEventListener("click", () => sincronizarCarrito());

  // Estos dos eventos del navegador avisan cuando se pierde o regresa la conexión
  window.addEventListener("online", alVolverConexion);
  window.addEventListener("offline", alPerderConexion);

  // Si quedó algo pendiente de una visita anterior y ya hay internet, se envía al abrir
  if (navigator.onLine && hayPendiente()) sincronizarCarrito(true);
});