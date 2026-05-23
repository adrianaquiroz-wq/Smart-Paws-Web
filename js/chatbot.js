(function () {
  const respuestas = [
    {
      keys: ["horario", "hora", "atienden", "abren", "cierran"],
      text: "Nuestros horarios de atencion son de lunes a sabado, de 08:00 a 19:00. Para emergencias, consulta directamente con el personal de la veterinaria."
    },
    {
      keys: ["tipo", "atencion", "consulta", "vacuna", "vacunacion", "control", "servicio"],
      text: "Tenemos consulta general, controles, vacunacion, seguimiento medico, atencion de emergencia y registro de historial clinico digital."
    },
    {
      keys: ["agendar", "reservar", "cita", "programar"],
      text: "Para agendar una cita, inicia sesion como cliente, entra a Mi Mascota, elige tu mascota, veterinario, fecha, hora y confirma el motivo de la atencion.",
      link: { label: "Ir a Mi Mascota", href: "mi-mascota.html" }
    },
    {
      keys: ["cancelar", "anular"],
      text: "Puedes cancelar una cita desde tu panel de cliente, en la seccion Mis Citas Programadas. Solo se muestran opciones de cancelacion para citas pendientes.",
      link: { label: "Ver mis citas", href: "mi-mascota.html" }
    },
    {
      keys: ["emergencia", "urgencia", "grave", "accidente"],
      text: "Si tu mascota esta en emergencia, acude o contacta cuanto antes a la veterinaria. El sistema permite registrar atenciones de emergencia desde el panel veterinario.",
      link: { label: "Atenciones", href: "atenciones.html" }
    },
    {
      keys: ["mascota", "registrar mascota", "paciente"],
      text: "Para registrar una mascota, el veterinario debe entrar al panel y usar Registrar Mascota. Se puede guardar especie, raza, color, peso, foto y datos clinicos.",
      link: { label: "Registrar mascota", href: "registrar_mascota.html" }
    },
    {
      keys: ["contraseña", "contrasena", "clave", "recuperar", "olvide"],
      text: "Para recuperar tu contrasena, entra al login y presiona 'Olvidaste tu contrasena'. Recibiras un codigo de verificacion en tu correo.",
      link: { label: "Ir al login", href: "login.html" }
    },
    {
      keys: ["tienda", "producto", "productos", "compra", "comprar", "stock", "precio"],
      text: "En la tienda puedes ver alimentos, accesorios, juguetes, productos de higiene y camas. Si inicias sesion como cliente, puedes realizar compras.",
      link: { label: "Abrir tienda", href: "tienda.html" }
    },
    {
      keys: ["veterinario", "doctor", "medico", "especialista"],
      text: "El sistema tiene veterinarios registrados para asignar citas y atenciones. Puedes elegir uno al agendar una cita."
    }
  ];

  const chips = ["Horarios", "Agendar cita", "Emergencia", "Registrar mascota", "Tienda", "Veterinarios", "Productos", "Recuperar contrasena"];

  function normalizar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  function crearBot() {
    if (document.querySelector(".sp-chatbot")) return;

    const root = document.createElement("div");
    root.className = "sp-chatbot";
    root.innerHTML = `
      <section class="sp-chatbot-window" aria-label="Asistente Smart Paws">
        <header class="sp-chatbot-header">
          <div class="sp-chatbot-title">
            <i class="fas fa-paw"></i>
            <div>
              <strong>Asistente Smart Paws</strong>
              <span>Orientacion rapida</span>
            </div>
          </div>
          <button class="sp-chatbot-close" type="button" aria-label="Cerrar chat"><i class="fas fa-minus"></i></button>
        </header>
        <div class="sp-chatbot-messages" role="log" aria-live="polite"></div>
        <div class="sp-chatbot-actions"></div>
        <form class="sp-chatbot-form">
          <input class="sp-chatbot-input" type="text" placeholder="Escribe tu pregunta..." autocomplete="off">
          <button class="sp-chatbot-send" type="submit" aria-label="Enviar"><i class="fas fa-paper-plane"></i></button>
        </form>
      </section>
      <button class="sp-chatbot-toggle" type="button" aria-label="Abrir asistente"><i class="fas fa-comment-medical"></i></button>
    `;

    document.body.appendChild(root);

    const toggle = root.querySelector(".sp-chatbot-toggle");
    const close = root.querySelector(".sp-chatbot-close");
    const form = root.querySelector(".sp-chatbot-form");
    const input = root.querySelector(".sp-chatbot-input");
    const actions = root.querySelector(".sp-chatbot-actions");

    chips.forEach((chip) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sp-chatbot-chip";
      btn.textContent = chip;
      btn.addEventListener("click", () => enviarMensaje(chip));
      actions.appendChild(btn);
    });

    toggle.addEventListener("click", () => {
      root.classList.toggle("open");
      if (root.classList.contains("open")) input.focus();
    });

    close.addEventListener("click", () => root.classList.remove("open"));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      enviarMensaje(input.value);
      input.value = "";
    });

    agregarMensaje("bot", "Hola, soy el asistente de Smart Paws. Puedo ayudarte con horarios, citas, emergencias, mascotas, veterinarios y tienda.");
  }

  function agregarMensaje(tipo, texto, link) {
    const messages = document.querySelector(".sp-chatbot-messages");
    if (!messages) return;

    const row = document.createElement("div");
    row.className = `sp-chatbot-message ${tipo}`;

    const bubble = document.createElement("div");
    bubble.className = "sp-chatbot-bubble";
    bubble.textContent = texto;

    if (link) {
      const a = document.createElement("a");
      a.className = "sp-chatbot-link";
      a.href = link.href;
      a.innerHTML = `${link.label} <i class="fas fa-arrow-right"></i>`;
      bubble.appendChild(document.createElement("br"));
      bubble.appendChild(a);
    }

    row.appendChild(bubble);
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function mostrarEscribiendo() {
    const messages = document.querySelector(".sp-chatbot-messages");
    const row = document.createElement("div");
    row.className = "sp-chatbot-message bot sp-chatbot-typing-row";
    row.innerHTML = `<div class="sp-chatbot-bubble sp-chatbot-typing">Escribiendo...</div>`;
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function ocultarEscribiendo() {
    document.querySelector(".sp-chatbot-typing-row")?.remove();
  }

  async function enviarMensaje(valor) {
    const texto = (valor || "").trim();
    if (!texto) return;

    agregarMensaje("user", texto);
    mostrarEscribiendo();
    const respuesta = await resolverRespuesta(texto);

    setTimeout(() => {
      ocultarEscribiendo();
      agregarMensaje("bot", respuesta.text, respuesta.link);
    }, 350);
  }

  async function resolverRespuesta(texto) {
    const pregunta = normalizar(texto);

    if (pregunta.includes("producto") || pregunta.includes("tienda") || pregunta.includes("stock")) {
      const productos = await cargarJson("php/chatbot_productos.php");
      if (productos && productos.length) {
        const lista = productos.slice(0, 5).map((p) => `- ${p.nombre}: Bs ${Number(p.precio).toFixed(2)} (${p.stock} en stock)`).join("\n");
        return { text: `Estos son algunos productos disponibles:\n${lista}`, link: { label: "Ver tienda completa", href: "tienda.html" } };
      }
    }

    if (pregunta.includes("veterinario") || pregunta.includes("doctor") || pregunta.includes("medico")) {
      const veterinarios = await cargarJson("php/chatbot_veterinarios.php");
      if (veterinarios && veterinarios.length) {
        const lista = veterinarios.map((v) => `- ${v.nombre} ${v.apellido}`).join("\n");
        return { text: `Veterinarios registrados:\n${lista}` };
      }
    }

    if (pregunta.includes("mis citas") || pregunta.includes("proxima cita") || pregunta.includes("proximas citas")) {
      const citas = await cargarJson("php/chatbot_citas.php");
      if (citas && citas.length) {
        const lista = citas.slice(0, 3).map((c) => `- ${c.fecha} ${c.hora}: ${c.mascota} con ${c.vet_nombre}`).join("\n");
        return { text: `Tus proximas citas pendientes son:\n${lista}`, link: { label: "Ver panel", href: "mi-mascota.html" } };
      }
      return { text: "No encontre citas pendientes en tu sesion actual. Si no iniciaste sesion como cliente, entra primero al sistema.", link: { label: "Iniciar sesion", href: "login.html" } };
    }

    const encontrada = respuestas.find((item) => item.keys.some((key) => pregunta.includes(normalizar(key))));
    if (encontrada) return encontrada;

    return { text: "No entendi completamente tu pregunta. Puedo ayudarte con horarios, citas, emergencias, registro de mascotas, tienda, productos, veterinarios o recuperacion de contrasena." };
  }

  async function cargarJson(url) {
    try {
      const respuesta = await fetch(url, { credentials: "same-origin" });
      if (!respuesta.ok) return null;
      return await respuesta.json();
    } catch (error) {
      return null;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", crearBot);
  } else {
    crearBot();
  }
})();
