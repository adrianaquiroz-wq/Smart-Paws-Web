/* translation.js archivo.js con la traduccion de la pagina */
(function () {
  const storageKey = "smartPawsLang";
  const defaultLang = "es";
  // Bandera español
  const FLAG_ES = `<svg class="flag-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 500" style="width:18px;height:12px;border-radius:2px;vertical-align:middle;box-shadow:0 1px 3px rgba(0,0,0,0.15);"><rect width="750" height="500" fill="#c60b1e"/><rect width="750" height="250" y="125" fill="#fbe122"/><rect width="40" height="60" x="180" y="195" fill="#c60b1e" rx="10"/></svg>`;
  
  // Bandera ingles
  const FLAG_US = `<svg class="flag-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900" style="width:18px;height:12px;border-radius:2px;vertical-align:middle;box-shadow:0 1px 3px rgba(0,0,0,0.15);"><rect width="7410" height="3900" fill="#b22234"/><path d="M0,0H7410V300H0ZM0,600H7410V900H0ZM0,1200H7410V1500H0ZM0,1800H7410V2100H0ZM0,2400H7410V2700H0ZM0,3000H7410V3300H0ZM0,3600H7410V3900H0Z" fill="#fff"/><rect width="2964" height="2100" fill="#3c3b6e"/><circle cx="247" cy="175" r="50" fill="#fff"/><circle cx="741" cy="175" r="50" fill="#fff"/><circle cx="1235" cy="175" r="50" fill="#fff"/><circle cx="1729" cy="175" r="50" fill="#fff"/><circle cx="2223" cy="175" r="50" fill="#fff"/><circle cx="2717" cy="175" r="50" fill="#fff"/><circle cx="494" cy="350" r="50" fill="#fff"/><circle cx="988" cy="350" r="50" fill="#fff"/><circle cx="1482" cy="350" r="50" fill="#fff"/><circle cx="1976" cy="350" r="50" fill="#fff"/><circle cx="2470" cy="350" r="50" fill="#fff"/><circle cx="247" cy="525" r="50" fill="#fff"/><circle cx="741" cy="525" r="50" fill="#fff"/><circle cx="1235" cy="525" r="50" fill="#fff"/><circle cx="1729" cy="525" r="50" fill="#fff"/><circle cx="2223" cy="525" r="50" fill="#fff"/><circle cx="2717" cy="525" r="50" fill="#fff"/></svg>`;
  const dictionaries = {
    es: {
      // HEADER y NAV
      "nav-home": "Inicio",
      "nav-how": "¿Cómo funciona?",
      "nav-spec": "Especialidades",
      "nav-about": "Nosotros",
      "nav-shop": "Tienda",
      "nav-login": `<i class="fas fa-sign-in-alt"></i> Ingresar`,
      "nav-back": `<i class="fas fa-arrow-left"></i> Volver`,
      "nav-back-home": `<i class="fas fa-arrow-left"></i> Volver al inicio`,
      // HERO 
      "hero-eyebrow": `<i class="fas fa-paw"></i> Veterinaria Digital · La Paz, Bolivia`,
      "hero-title": `El mejor cuidado<br>que tu <em>mascota</em><br>merece`,
      "hero-desc": "En Smart Paws digitalizamos la salud animal. Gestiona consultas, historial y atenciones desde cualquier lugar con tecnología de punta.",
      "hero-btn-client": `<i class="fas fa-user-circle"></i> Área de clientes`,
      "hero-btn-how": `<i class="fas fa-play-circle"></i> Cómo funciona`,
      "hero-stat-pets": "Mascotas",
      "hero-stat-spec": "Especialidades",
      "hero-stat-dig": "Digital",
      "hero-badge-title": "Atención inmediata",
      "hero-badge-schedule": "Lun — Sáb · 8am a 7pm",
      "hero-badge-online": "Sistema en línea",
      // COMO FUNCIONA
      "how-label": "Simple y rápido",
      "how-title": "¿Cómo funciona?",
      "how-desc": "Tres pasos para digitalizar la salud de tu mascota desde cualquier dispositivo.",
      "how-step1-title": "Regístrate como cliente",
      "how-step1-desc": "Crea tu cuenta en minutos. El veterinario registra tu perfil y el de tu mascota con toda la información clínica necesaria.",
      "how-step2-title": "Agenda tu cita",
      "how-step2-desc": "Programa consultas, controles o vacunas directamente desde el panel. Recibe recordatorios automáticos para no olvidar nada.",
      "how-step3-title": "Accede al historial",
      "how-step3-desc": "Consulta en tiempo real el historial clínico completo de tu mascota: diagnósticos, tratamientos, vacunas y recetas.",
      // ESPECIALIDADES
      "spec-label": "Lo que hacemos",
      "spec-title": "Nuestras Especialidades",
      "spec-desc": "Atención veterinaria completa con médicos colegiados y tecnología de primer nivel.",
      "spec-card1-title": "Cirugía General",
      "spec-card1-desc": "Médicos colegiados con amplia experiencia quirúrgica y equipamiento moderno.",
      "spec-card2-title": "Traumatología",
      "spec-card2-desc": "Cuidado especializado para el sistema óseo y articular de tu mascota.",
      "spec-card3-title": "Laboratorio",
      "spec-card3-desc": "Análisis clínicos inmediatos con resultados digitales en tu historial.",
      "spec-card4-title": "Vacunación",
      "spec-card4-desc": "Calendario de vacunas personalizado por especie, edad y estilo de vida.",
      "spec-card5-title": "Cardiología",
      "spec-card5-desc": "Diagnóstico y tratamiento cardiovascular avanzado con ecocardiografía.",
      "spec-card6-title": "Odontología",
      "spec-card6-desc": "Limpieza dental profesional y tratamiento de patologías bucales.",
      // REGISTRO
      "cta-title": "¿Tu mascota aún no tiene su perfil digital?",
      "cta-desc": "Únete a cientos de familias en La Paz que ya gestionan la salud de sus mascotas con Smart Paws.",
      "cta-btn": `<i class="fas fa-paw"></i> Registrarse gratis`,
      // TIENDA (index)
      "shop-label": "Productos",
      "shop-title": "Tienda Smart Paws",
      "shop-info-text": `<i class="fas fa-lock"></i> Inicia sesión para realizar compras.`,
      "shop-search-btn": `<i class="fas fa-search"></i> Buscar`,
      "shop-loading": "Cargando productos...",
      // TIENDA (tienda)
      "shop-hero-title": `Nuestra <em>Tienda</em>`,
      "shop-hero-desc": "Productos seleccionados para el bienestar de tu mascota",
      "shop-badge-shipping": `<i class="fas fa-truck"></i> Envío a domicilio`,
      "shop-badge-quality": `<i class="fas fa-shield-alt"></i> Garantía de calidad`,
      "shop-badge-qr": `<i class="fas fa-qrcode"></i> Pago con QR`,
      "shop-cat-todos": "Todos",
      "shop-cat-alimento": `<i class="fas fa-bone"></i> Alimento`,
      "shop-cat-higiene": `<i class="fas fa-soap"></i> Higiene`,
      "shop-cat-juguetes": `<i class="fas fa-football-ball"></i> Juguetes`,
      "shop-cat-accesorios": `<i class="fas fa-tag"></i> Accesorios`,
      "shop-cat-camas": `<i class="fas fa-bed"></i> Camas`,
      "shop-toolbar-search-btn": "Buscar",
      "shop-products-heading": "Productos",
      "shop-cart-fab": `<i class="fas fa-shopping-cart"></i> Mi carrito`,
      "shop-drawer-title": `<i class="fas fa-shopping-cart" style="margin-right:10px;opacity:.7;"></i> Mi Carrito`,
      "shop-drawer-empty": "Tu carrito está vacío",
      "shop-drawer-total-label": "Total a pagar",
      "shop-drawer-pay-btn": `<i class="fas fa-qrcode"></i> Pagar con QR`,
      // PAGO (QR)
      "qr-modal-title": `Pago con <span style="color:var(--amber)">QR</span>`,
      "qr-modal-sub": "Escanea el código con tu app bancaria",
      "qr-modal-total": "Total",
      "qr-modal-bank": "Banco Unión · Smart Paws S.R.L.",
      "qr-modal-steps-title": "Pasos:",
      "qr-modal-steps-desc": "1. Abre tu app bancaria (BNB, Unión, BCP, etc.)<br>2. Selecciona <strong>Pagar con QR</strong><br>3. Escanea el código y confirma el monto<br>4. Toca <strong>\"Ya pagué\"</strong> para adjuntar tu captura",
      "qr-modal-cancel": "Cancelar",
      "qr-modal-confirm": `<i class="fas fa-check"></i> Ya pagué`,
      "qr-modal-back": `<i class="fas fa-arrow-left"></i> Volver`,
      "qr-modal-upload-title": `<i class="fas fa-camera" style="color:var(--verde-vivo);margin-right:8px;"></i>Adjunta tu comprobante`,
      "qr-modal-upload-sub": "Sube la captura de pantalla de tu pago bancario para confirmar tu pedido",
      "qr-modal-upload-zone-p": "Toca aquí para subir la captura",
      "qr-modal-upload-zone-span": "JPG, PNG o WebP · Máx. 10MB",
      "qr-modal-upload-ready": "Captura lista para enviar",
      "qr-modal-send-order": `<i class="fas fa-paper-plane"></i> Enviar pedido`,
      // FOOTER
      "footer-contact-title": "Smart Paws Veterinaria",
      "footer-city": "Sede Central — La Paz",
      "footer-newsletter-title": "Suscríbete al boletín",
      "footer-newsletter-desc": "Consejos de salud animal y novedades de Smart Paws.",
      "footer-newsletter-btn": "Suscribirse",
      "footer-back-to-top": `Volver arriba <i class="fas fa-arrow-up"></i>`,
      "footer-contacto": "Contacto",
      "footer-privacidad": "Política de privacidad",
      // LOGIN (login.html)
      "auth-subtitle": "Veterinaria digital en La Paz",
      "auth-tab-login": "Ingresar",
      "auth-tab-register": "Registrarse",
      "auth-login-role-client": "🐾 Soy Cliente",
      "auth-login-role-vet": "🩺 Soy Veterinario",
      "auth-login-btn": "Entrar",
      "auth-forgot-pass": `<i class="fas fa-key"></i> ¿Olvidaste tu contraseña?`,
      "auth-recover-sub": "Ingresa tu correo y te enviaremos un código de verificación.",
      "auth-captcha-btn": "Enviar código",
      "auth-captcha-back": `<i class="fas fa-arrow-left"></i> Volver al login`,
      "auth-verify-sub": "Ingresa el código de 6 dígitos enviado a tu correo.",
      "auth-verify-btn": `<i class="fas fa-check-circle"></i> Verificar código`,
      "auth-verify-resend": `<i class="fas fa-redo"></i> Reenviar código`,
      "auth-newpass-sub": "Crea tu nueva contraseña.",
      "auth-newpass-btn": `<i class="fas fa-lock"></i> Actualizar contraseña`,
      "auth-reg-role-client": "Crear cuenta de Cliente",
      "auth-reg-role-vet": "Solicitar cuenta de Veterinario",
      "auth-reg-vet-note": "Las cuentas de veterinario quedan pendientes hasta que la administracion las apruebe.",
      "auth-reg-help": "Selecciona el tipo de cuenta que deseas crear.",
      "auth-reg-btn": "Crear cuenta"
    },
    en: {
      // HEADER & NAVIGATION
      "nav-home": "Home",
      "nav-how": "How it works?",
      "nav-spec": "Specialities",
      "nav-about": "About Us",
      "nav-shop": "Shop",
      "nav-login": `<i class="fas fa-sign-in-alt"></i> Login`,
      "nav-back": `<i class="fas fa-arrow-left"></i> Back`,
      "nav-back-home": `<i class="fas fa-arrow-left"></i> Back to home`,
      // HERO SECTION
      "hero-eyebrow": `<i class="fas fa-paw"></i> Digital Vet · La Paz, Bolivia`,
      "hero-title": `The best care<br>your <em>pet</em><br>deserves`,
      "hero-desc": "At Smart Paws we digitize animal health. Manage consultations, medical history, and treatments from anywhere with state-of-the-art technology.",
      "hero-btn-client": `<i class="fas fa-user-circle"></i> Client Area`,
      "hero-btn-how": `<i class="fas fa-play-circle"></i> How it works`,
      "hero-stat-pets": "Pets",
      "hero-stat-spec": "Specialities",
      "hero-stat-dig": "Digital",
      "hero-badge-title": "Immediate attention",
      "hero-badge-schedule": "Mon — Sat · 8am to 7pm",
      "hero-badge-online": "System online",
      // HOW IT WORKS
      "how-label": "Simple and fast",
      "how-title": "How does it work?",
      "how-desc": "Three simple steps to digitize your pet's health from any device.",
      "how-step1-title": "Register as a client",
      "how-step1-desc": "Create your account in minutes. The veterinarian will register your profile and your pet's clinic details.",
      "how-step2-title": "Schedule a visit",
      "how-step2-desc": "Schedule checks, vaccinations, or consultations directly. Receive automatic reminders to never forget a date.",
      "how-step3-title": "Access history",
      "how-step3-desc": "Check your pet's medical record in real-time: diagnoses, prescriptions, vaccinations, and treatment history.",
      // SPECIALITIES
      "spec-label": "What we do",
      "spec-title": "Our Specialities",
      "spec-desc": "Complete veterinary care with certified professionals and modern medical technology.",
      "spec-card1-title": "General Surgery",
      "spec-card1-desc": "Certified doctors with broad surgical experience and modern medical equipment.",
      "spec-card2-title": "Traumatology",
      "spec-card2-desc": "Specialized care for your pet's joints, skeletal, and muscular systems.",
      "spec-card3-title": "Laboratory",
      "spec-card3-desc": "Instant clinical analysis with digital results sent directly to your history.",
      "spec-card4-title": "Vaccination",
      "spec-card4-desc": "Personalized vaccine schedule based on pet species, age, and lifestyle.",
      "spec-card5-title": "Cardiology",
      "spec-card5-desc": "Advanced cardiovascular diagnosis and care using echocardiograms.",
      "spec-card6-title": "Dentistry",
      "spec-card6-desc": "Professional dental cleaning and treatment of oral pathologies.",
      // CTA BAND
      "cta-title": "Doesn't your pet have a digital profile yet?",
      "cta-desc": "Join hundreds of families in La Paz who already manage their pet's health with Smart Paws.",
      "cta-btn": `<i class="fas fa-paw"></i> Register for free`,
      // SHOP SECTION (index)
      "shop-label": "Products",
      "shop-title": "Smart Paws Store",
      "shop-info-text": `<i class="fas fa-lock"></i> Please log in to complete purchases.`,
      "shop-search-btn": `<i class="fas fa-search"></i> Search`,
      "shop-loading": "Loading products...",
      // TIENDA PAGE (tienda)
      "shop-hero-title": `Our <em>Store</em>`,
      "shop-hero-desc": "Selected products for your pet's ultimate well-being",
      "shop-badge-shipping": `<i class="fas fa-truck"></i> Home Delivery`,
      "shop-badge-quality": `<i class="fas fa-shield-alt"></i> Quality Guarantee`,
      "shop-badge-qr": `<i class="fas fa-qrcode"></i> QR Payments`,
      "shop-cat-todos": "All",
      "shop-cat-alimento": `<i class="fas fa-bone"></i> Food`,
      "shop-cat-higiene": `<i class="fas fa-soap"></i> Hygiene`,
      "shop-cat-juguetes": `<i class="fas fa-football-ball"></i> Toys`,
      "shop-cat-accesorios": `<i class="fas fa-tag"></i> Accessories`,
      "shop-cat-camas": `<i class="fas fa-bed"></i> Beds`,
      "shop-toolbar-search-btn": "Search",
      "shop-products-heading": "Products",
      "shop-cart-fab": `<i class="fas fa-shopping-cart"></i> My Cart`,
      "shop-drawer-title": `<i class="fas fa-shopping-cart" style="margin-right:10px;opacity:.7;"></i> My Cart`,
      "shop-drawer-empty": "Your cart is empty",
      "shop-drawer-total-label": "Total to pay",
      "shop-drawer-pay-btn": `<i class="fas fa-qrcode"></i> Pay with QR`,
      // CHECKOUT MODAL (QR)
      "qr-modal-title": `Pay with <span style="color:var(--amber)">QR</span>`,
      "qr-modal-sub": "Scan the QR code with your mobile banking application",
      "qr-modal-total": "Total",
      "qr-modal-bank": "Banco Unión · Smart Paws S.R.L.",
      "qr-modal-steps-title": "Steps:",
      "qr-modal-steps-desc": "1. Open your mobile bank app (Union, BNB, BCP, etc.)<br>2. Select <strong>Pay with QR</strong><br>3. Scan the code and confirm the amount<br>4. Click <strong>\"I Paid\"</strong> to attach your receipt screenshot",
      "qr-modal-cancel": "Cancel",
      "qr-modal-confirm": `<i class="fas fa-check"></i> I Paid`,
      "qr-modal-back": `<i class="fas fa-arrow-left"></i> Back`,
      "qr-modal-upload-title": `<i class="fas fa-camera" style="color:var(--verde-vivo);margin-right:8px;"></i>Attach payment receipt`,
      "qr-modal-upload-sub": "Upload your bank transfer screenshot to confirm your order details",
      "qr-modal-upload-zone-p": "Click here to upload your screenshot",
      "qr-modal-upload-zone-span": "JPG, PNG or WebP · Max. 10MB",
      "qr-modal-upload-ready": "Receipt screenshot ready to send",
      "qr-modal-send-order": `<i class="fas fa-paper-plane"></i> Send Order`,
      // NEWSLETTER & FOOTER
      "footer-contact-title": "Smart Paws Veterinary",
      "footer-city": "Central Headquarters — La Paz",
      "footer-newsletter-title": "Subscribe to newsletter",
      "footer-newsletter-desc": "Animal health tips and new updates from Smart Paws.",
      "footer-newsletter-btn": "Subscribe",
      "footer-back-to-top": `Back to top <i class="fas fa-arrow-up"></i>`,
      "footer-contacto": "Contact Us",
      "footer-privacidad": "Privacy Policy",
      // LOGIN / REGISTRATION PAGE (login)
      "auth-subtitle": "Digital veterinary care in La Paz",
      "auth-tab-login": "Sign In",
      "auth-tab-register": "Register",
      "auth-login-role-client": "🐾 I'm a Client",
      "auth-login-role-vet": "🩺 I'm a Veterinarian",
      "auth-login-btn": "Sign In",
      "auth-forgot-pass": `<i class="fas fa-key"></i> Forgot your password?`,
      "auth-recover-sub": "Enter your email address and we will send you a verification code.",
      "auth-captcha-btn": "Send Code",
      "auth-captcha-back": `<i class="fas fa-arrow-left"></i> Back to sign in`,
      "auth-verify-sub": "Enter the 6-digit code sent to your email address.",
      "auth-verify-btn": `<i class="fas fa-check-circle"></i> Verify Code`,
      "auth-verify-resend": `<i class="fas fa-redo"></i> Resend Code`,
      "auth-newpass-sub": "Create your new password.",
      "auth-newpass-btn": `<i class="fas fa-lock"></i> Update Password`,
      "auth-reg-role-client": "Create Client Account",
      "auth-reg-role-vet": "Request Veterinarian Account",
      "auth-reg-vet-note": "Veterinarian accounts remain pending until approved by the administration.",
      "auth-reg-help": "Select the type of account you want to create.",
      "auth-reg-btn": "Register Account"
    }
  };
  const placeholders = {
    es: {
      "input-search-home": "Buscar producto (ej. Alimento para perro)...",
      "input-search-shop": "🔍 Buscar producto…",
      "newsletter-email": "su@correo.com",
      "login-usuario": "Correo electrónico",
      "login-pass": "Contraseña",
      "login-especialidad": "Especialidad veterinaria",
      "login-matricula": "Matrícula profesional",
      "recup-correo": "Correo electrónico",
      "captcha-respuesta": "Tu respuesta",
      "codigo-input": "● ● ● ● ● ●",
      "nueva-pass": "Nueva contraseña",
      "confirmar-pass": "Confirmar contraseña",
      "reg-carnet": "Carnet de Identidad",
      "reg-nombre": "Nombres",
      "reg-apellido": "Apellidos",
      "reg-correo": "Correo electrónico",
      "reg-pass": "Crear contraseña",
      "reg-celular": "Celular",
      "reg-direccion": "Direccion",
      "reg-especialidad": "Especialidad veterinaria",
      "reg-matricula": "Matricula profesional"
    },
    en: {
      "input-search-home": "Search product (e.g. Dog food)...",
      "input-search-shop": "🔍 Search product…",
      "newsletter-email": "your@email.com",
      "login-usuario": "Email Address",
      "login-pass": "Password",
      "login-especialidad": "Veterinary Speciality",
      "login-matricula": "Professional ID / Licence",
      "recup-correo": "Email Address",
      "captcha-respuesta": "Your answer",
      "codigo-input": "● ● ● ● ● ●",
      "nueva-pass": "New Password",
      "confirmar-pass": "Confirm Password",
      "reg-carnet": "ID Document / Carnet",
      "reg-nombre": "First Names",
      "reg-apellido": "Last Names",
      "reg-correo": "Email Address",
      "reg-pass": "Create Password",
      "reg-celular": "Mobile Phone",
      "reg-direccion": "Address",
      "reg-especialidad": "Veterinary Speciality",
      "reg-matricula": "Professional licence ID"
    }
  };
  function getLanguage() {
    return localStorage.getItem(storageKey) || defaultLang;
  }
  function setLanguage(lang) {
    localStorage.setItem(storageKey, lang);
    applyTranslations(lang);
    updateDropdownUI(lang);
  }
  function applyTranslations(lang) {
    // Traduccion de elementos estandar
    const elements = document.querySelectorAll("[data-translate]");
    elements.forEach(el => {
      const key = el.getAttribute("data-translate");
      if (dictionaries[lang][key]) {
        el.innerHTML = dictionaries[lang][key];
      }
    });
    // Traduccion placeholders
    const inputs = document.querySelectorAll("[data-translate-placeholder]");
    inputs.forEach(input => {
      const key = input.getAttribute("data-translate-placeholder");
      if (placeholders[lang][key]) {
        input.setAttribute("placeholder", placeholders[lang][key]);
      }
    });
    // Actualizar atributo lang en HTML
    document.documentElement.setAttribute("lang", lang);
  }
  function updateDropdownUI(lang) {
    const btn = document.getElementById("lang-btn-content");
    if (!btn) return;
    if (lang === "es") {
      btn.innerHTML = `${FLAG_ES} ES`;
    } else {
      btn.innerHTML = `${FLAG_US} EN`;
    }
  }
  function createLanguageSwitcher() {
    // Verificacion
    if (document.getElementById("lang-selector")) return;
    // Crear container
    const container = document.createElement("div");
    container.className = "lang-selector-container";
    container.id = "lang-selector";
    // Setup idioma actual bandera/texto
    const currentLang = getLanguage();
    const flagHTML = currentLang === "es" ? FLAG_ES : FLAG_US;
    const labelHTML = currentLang === "es" ? "ES" : "EN";
    container.innerHTML = `
      <button class="lang-btn" id="lang-btn" type="button" aria-haspopup="listbox" aria-expanded="false">
        <span id="lang-btn-content" style="display:flex;align-items:center;gap:6px;">
          ${flagHTML} ${labelHTML}
        </span>
        <i class="fas fa-chevron-down" style="font-size:0.7rem;opacity:0.8;margin-left:2px;"></i>
      </button>
      <div class="lang-dropdown" id="lang-dropdown" role="listbox">
        <button class="lang-option" data-lang="es" role="option">${FLAG_ES} ES</button>
        <button class="lang-option" data-lang="en" role="option">${FLAG_US} EN</button>
      </div>
    `;
    const btn = container.querySelector("#lang-btn");
    const dropdown = container.querySelector("#lang-dropdown");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const show = dropdown.classList.toggle("show");
      btn.setAttribute("aria-expanded", show);
    });
    dropdown.querySelectorAll(".lang-option").forEach(opt => {
      opt.addEventListener("click", () => {
        const selectedLang = opt.getAttribute("data-lang");
        setLanguage(selectedLang);
        dropdown.classList.remove("show");
        btn.setAttribute("aria-expanded", "false");
      });
    });
    // Cierre de despliegue
    document.addEventListener("click", () => {
      dropdown.classList.remove("show");
      btn.setAttribute("aria-expanded", "false");
    });
    let injected = false;
    const navMenuUl = document.querySelector(".nav-menu ul");
    if (navMenuUl) {
      const li = document.createElement("li");
      li.appendChild(container);
      navMenuUl.appendChild(li);
      injected = true;
    }
    const tiendaNavUl = document.querySelector(".tienda-nav ul");
    if (!injected && tiendaNavUl) {
      const li = document.createElement("li");
      li.appendChild(container);
      tiendaNavUl.appendChild(li);
      injected = true;
    }
    const authBack = document.querySelector(".auth-back");
    if (!injected && authBack) {
      container.className = "lang-selector-container auth-lang-container";
      authBack.parentNode.insertBefore(container, authBack);
      injected = true;
    }
  }
  function init() {
    createLanguageSwitcher();
    applyTranslations(getLanguage());
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
