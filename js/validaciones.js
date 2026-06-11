/**
 * validaciones.js — Smart Paws
 * Validación en tiempo real de inputs: Solo letras / Solo números
 * Integrado con el sistema de diseño existente (css/style.css)
 */

(function () {
  'use strict';

  /* ── Expresiones regulares ───────────────────────────────────── */
  const SOLO_LETRAS  = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]*$/;
  const SOLO_DIGITOS = /^\d*$/;

  /* ── Mensajes internos del badge ─────────────────────────────── */
  const MSG = {
    letras:  '<i class="fas fa-exclamation-circle"></i>&nbsp;Solo letras',
    numeros: '<i class="fas fa-exclamation-circle"></i>&nbsp;Solo números',
  };

  /* ── Clases CSS del badge (definidas en css/style.css) ───────── */
  const BADGE_CLASS = {
    letras:  'val-badge error-letras',
    numeros: 'val-badge error-numeros',
  };

  /**
   * Mapa de campos que necesitan validación.
   * Clave  → id del <input>
   * Valor  → 'letras' | 'numeros'
   *
   * Si el campo no existe en la página actual,
   * getElementById devuelve null y se omite sin error.
   */
  const CAMPOS = {
    /* ── login.html — Sección Registro ── */
    'reg-nombre':         'letras',
    'reg-apellido':       'letras',
    'reg-celular':        'numeros',  // type="tel" no bloquea letras por defecto
    'reg-especialidad':   'letras',

    /* ── login.html — Login como Veterinario ── */
    'login-especialidad': 'letras',

    /* ── registrar_cliente.html ── */
    'cli-nombre':         'letras',
    'cli-apellido':       'letras',

    /* ── registrar_atencion.html ── */
    'asistente_nombre':   'letras',
    'em_nombre':          'letras',
  };

  /* ─────────────────────────────────────────────────────────────────
   * adjuntar()
   * Envuelve el input en un .val-wrapper (flex-row) y añade el
   * badge de error a la derecha. Escucha el evento 'input' para
   * mostrar/ocultar el badge en tiempo real.
   * ───────────────────────────────────────────────────────────────── */
  function adjuntar(input, tipo) {
    const regex = tipo === 'letras' ? SOLO_LETRAS : SOLO_DIGITOS;

    /* 1. Crear wrapper flex-row que reemplaza al input in-place */
    const wrapper = document.createElement('div');
    wrapper.className = 'val-wrapper';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    /* 2. Crear badge de error */
    const badge = document.createElement('span');
    badge.className = BADGE_CLASS[tipo];
    badge.innerHTML = MSG[tipo];
    wrapper.appendChild(badge);

    /* 3. Escuchar escritura en tiempo real */
    input.addEventListener('input', function () {
      // Campo vacío = sin error (el 'required' del navegador lo gestiona)
      const esValido = this.value === '' || regex.test(this.value);
      badge.classList.toggle('visible', !esValido);
      this.classList.toggle('input-invalid', !esValido);
    });
  }

  /* ─────────────────────────────────────────────────────────────────
   * adjuntarEntero()  — FIX P2: Campo Carnet
   *
   * Para inputs type="number" que sólo deben aceptar enteros positivos.
   * El problema: type="number" del navegador permite teclear 'e', 'E',
   * '+', '-', '.' (son caracteres válidos en notación científica).
   * Esta función los bloquea físicamente a nivel de keydown y muestra
   * el badge "Solo números" cuando el usuario intenta usarlos.
   * También sanitiza el pegado desde el portapapeles.
   * ───────────────────────────────────────────────────────────────── */
  function adjuntarEntero(input) {
    /* Teclas de control que siempre deben pasar (navegación, edición) */
    const TECLAS_PERMITIDAS = new Set([
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ]);

    /* 1. Wrapper + badge (mismo patrón visual que adjuntar) */
    const wrapper = document.createElement('div');
    wrapper.className = 'val-wrapper';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const badge = document.createElement('span');
    badge.className = BADGE_CLASS['numeros'];
    badge.innerHTML = MSG['numeros'];
    wrapper.appendChild(badge);

    /* Timer interno para ocultar el badge tras un breve instante */
    let timerBadge = null;

    function mostrarBadge() {
      badge.classList.add('visible');
      input.classList.add('input-invalid');
      clearTimeout(timerBadge);
      timerBadge = setTimeout(function () {
        badge.classList.remove('visible');
        input.classList.remove('input-invalid');
      }, 1800);   // el badge desaparece solo a los 1.8 s
    }

    /* 2. Bloquear teclas no numéricas en tiempo real */
    input.addEventListener('keydown', function (e) {
      /* Dejar pasar: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X y atajos de teclado */
      if (e.ctrlKey || e.metaKey) return;

      /* Dejar pasar teclas de navegación y control */
      if (TECLAS_PERMITIDAS.has(e.key)) return;

      /* Dejar pasar dígitos (0–9 teclado normal y numérico) */
      if (/^\d$/.test(e.key)) return;

      /* Todo lo demás (letras, 'e', 'E', '+', '-', '.') → bloqueado */
      e.preventDefault();
      mostrarBadge();
    });

    /* 3. Sanitizar pegado desde el portapapeles:
          si el usuario pega "1a2b3", solo queda "123" */
    input.addEventListener('paste', function (e) {
      e.preventDefault();
      const texto = (e.clipboardData || window.clipboardData).getData('text');
      const soloDigitos = texto.replace(/\D/g, '');
      if (soloDigitos) {
        /* Insertar solo los dígitos en la posición del cursor */
        document.execCommand('insertText', false, soloDigitos);
      } else {
        /* Si no había ningún dígito en lo pegado, mostrar badge */
        mostrarBadge();
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────────
   * Inicialización al cargar el DOM
   * ───────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {

    /* A. Adjuntar por ID (cubre la mayoría de páginas) */
    Object.entries(CAMPOS).forEach(function ([id, tipo]) {
      const el = document.getElementById(id);
      if (el) adjuntar(el, tipo);
    });

    /* B. FIX P2: Carnet de Identidad — bloqueo físico de letras
          type="number" permite 'e', '-', '+', '.' por defecto.
          adjuntarEntero() los bloquea y muestra el badge al instante. */
    const camposEntero = ['reg-carnet', 'cli-carnet', 'masc-cliente'];
    camposEntero.forEach(function (id) {
      const el = document.getElementById(id);
      if (el) adjuntarEntero(el);
    });

    /* C. Nombre de mascota en registrar_mascota.html
         (usa name="nombre" sin id propio, cuidando no confundir
          con otros inputs[name="nombre"] que ya procesamos por ID) */
    document.querySelectorAll('input[name="nombre"]').forEach(function (el) {
      if (!el.closest('.val-wrapper')) {   // evitar duplicados
        adjuntar(el, 'letras');
      }
    });

  });

})();
