// --- LÓGICA DE NAVEGACIÓN ENTRE TABS ---
function switchTab(tab) {
    const loginSec = document.getElementById('section-login');
    const registroSec = document.getElementById('section-registro');
    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach(t => t.classList.remove('active'));

    if (tab === 'login') {
        loginSec.classList.remove('hidden');
        registroSec.classList.add('hidden');
        event.currentTarget.classList.add('active');
    } else {
        loginSec.classList.add('hidden');
        registroSec.classList.remove('hidden');
        event.currentTarget.classList.add('active');
    }
}

// =========================
// LOGIN CON BD REAL
// =========================
document.querySelector('#section-login form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const usuario = document.getElementById("login-usuario").value;
    const contrasena = document.getElementById("login-pass").value;
    const rol = document.getElementById('rol-login').value;

    fetch("php/login.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `usuario=${usuario}&contrasena=${contrasena}&rol=${rol}`
    })
    .then(res => res.text())
    .then(data => {

        if (data === "cliente") {
            alert("Bienvenido Cliente");
            window.location.href = "mi-mascota.html";
        } 
        else if (data === "veterinario") {
            alert("Bienvenido Veterinario");
            window.location.href = "panel-vet.html";
        } 
        else if (data === "no_rol") {
            alert("No tienes ese rol asignado");
        } 
        else {
            alert("Datos incorrectos");
        }

    });
});


// =========================
// REGISTRO CON BD REAL
// =========================
document.getElementById('form-registro')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const carnet = document.getElementById('reg-carnet').value;
    const nombre = document.getElementById('reg-nombre').value;
    const apellido = document.getElementById('reg-apellido').value;
    const correo = document.getElementById('reg-correo').value;
    const password = document.getElementById('reg-pass').value;
    const rol = document.getElementById('reg-rol').value;

    fetch("php/registro.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `carnet=${carnet}&nombre=${nombre}&apellido=${apellido}&correo=${correo}&password=${password}&rol=${rol}`
    })
    .then(res => res.text())
    .then(data => {
        if (data === "ok") {
            alert("Registro exitoso");
            switchTab('login');
        } else {
            alert(data);
        }
    });
});

// =========================
// CAPTCHA MATEMÁTICO LOCAL
// =========================
let _captchaRespuesta = 0;

function generarCaptcha() {
    const ops = [
        () => { const a = Math.floor(Math.random()*9)+1, b = Math.floor(Math.random()*9)+1; return { txt: `${a} + ${b} = ?`, res: a+b }; },
        () => { const a = Math.floor(Math.random()*5)+5, b = Math.floor(Math.random()*5)+1; return { txt: `${a} − ${b} = ?`, res: a-b }; },
        () => { const a = Math.floor(Math.random()*5)+1, b = Math.floor(Math.random()*5)+1; return { txt: `${a} × ${b} = ?`, res: a*b }; },
    ];
    const op = ops[Math.floor(Math.random() * ops.length)]();
    document.getElementById("captcha-pregunta").textContent = op.txt;
    document.getElementById("captcha-respuesta").value = "";
    _captchaRespuesta = op.res;
}

// =========================
// RECUPERAR CONTRASEÑA
// =========================

// ── Helpers de navegación entre secciones ──────────────────────────────────
function mostrarSeccion(id) {
    ["section-login","section-recuperar","section-verificar","section-nueva-pass",
     "section-registro"].forEach(s => {
        const el = document.getElementById(s);
        if (el) el.classList.add("hidden");
    });
    const target = document.getElementById(id);
    if (target) target.classList.remove("hidden");

    // Regenerar captcha cada vez que se muestra la sección
    if (id === "section-recuperar") generarCaptcha();

    // Tabs: desactivar cuando no estamos en login/registro
    const inLoginFlow = id === "section-login" || id === "section-registro";
    document.querySelectorAll(".tab-btn").forEach(b => {
        b.style.pointerEvents = inLoginFlow ? "" : "none";
        b.style.opacity       = inLoginFlow ? "" : "0.4";
    });
}

function volverALogin()    { mostrarSeccion("section-login"); }
function volverRecuperar() { mostrarSeccion("section-recuperar"); }

// ── Enlace "¿Olvidaste tu contraseña?" ────────────────────────────────────
document.getElementById("link-olvide")?.addEventListener("click", (e) => {
    e.preventDefault();
    mostrarSeccion("section-recuperar");
});

// ── PASO 1: Enviar código al correo ───────────────────────────────────────
document.getElementById("form-recuperar")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const correo   = document.getElementById("recup-correo").value.trim();
    const respuesta = parseInt(document.getElementById("captcha-respuesta").value);

    if (isNaN(respuesta) || respuesta !== _captchaRespuesta) {
        generarCaptcha();
        return alert("Respuesta incorrecta. Intenta con la nueva operación.");
    }

    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Enviando...";

    try {
        const res  = await fetch("php/recuperar_contrasena.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `correo=${encodeURIComponent(correo)}&captcha_ok=1`
        });
        const data = await res.json();

        if (data.ok) {
            document.getElementById("recup-correo-display").textContent = correo;
            mostrarSeccion("section-verificar");
            // Modo dev: si el servidor devuelve el código directamente
            if (data.dev_codigo) {
                alert(`[DEV] Código: ${data.dev_codigo}\n(PHPMailer no instalado)`);
            }
        } else {
            alert(data.msg);
            generarCaptcha();
        }
    } catch(err) {
        alert("Error de conexión.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar código';
    }
});

// ── PASO 2: Verificar código ───────────────────────────────────────────────
document.getElementById("form-verificar")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const codigo = document.getElementById("codigo-input").value.trim();

    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Verificando...";

    try {
        const res  = await fetch("php/verificar_codigo.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `codigo=${encodeURIComponent(codigo)}`
        });
        const data = await res.json();

        if (data.ok) {
            mostrarSeccion("section-nueva-pass");
        } else {
            alert(data.msg);
        }
    } catch(err) {
        alert("Error de conexión.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Verificar código';
    }
});

// ── PASO 3: Actualizar contraseña ─────────────────────────────────────────
document.getElementById("form-nueva-pass")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nueva     = document.getElementById("nueva-pass").value;
    const confirmar = document.getElementById("confirmar-pass").value;

    if (nueva !== confirmar) {
        return alert("Las contraseñas no coinciden.");
    }
    if (nueva.length < 6) {
        return alert("La contraseña debe tener al menos 6 caracteres.");
    }

    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Actualizando...";

    try {
        const res  = await fetch("php/actualizar_contrasena.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `nueva_contrasena=${encodeURIComponent(nueva)}&confirmar_contrasena=${encodeURIComponent(confirmar)}`
        });
        const data = await res.json();

        if (data.ok) {
            alert("✅ " + data.msg);
            mostrarSeccion("section-login");
        } else {
            alert("❌ " + data.msg);
        }
    } catch(err) {
        alert("Error de conexión.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-lock"></i> Actualizar contraseña';
    }
});

// ── Indicador de fuerza de contraseña ────────────────────────────────────
document.getElementById("nueva-pass")?.addEventListener("input", function() {
    const v = this.value;
    const fill = document.getElementById("pass-strength-fill");
    const txt  = document.getElementById("pass-strength-txt");
    if (!fill) return;

    let score = 0;
    if (v.length >= 6)  score++;
    if (v.length >= 10) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;

    const niveles = [
        { pct: "0%",   color: "#e0e0e0", label: "" },
        { pct: "25%",  color: "#e74c3c", label: "Muy débil" },
        { pct: "50%",  color: "#e67e22", label: "Débil" },
        { pct: "75%",  color: "#f1c40f", label: "Buena" },
        { pct: "90%",  color: "#2ecc71", label: "Fuerte" },
        { pct: "100%", color: "#1a6b3c", label: "Muy fuerte 💪" },
    ];

    const n = niveles[Math.min(score, 5)];
    fill.style.width      = n.pct;
    fill.style.background = n.color;
    txt.textContent       = n.label;
    txt.style.color       = n.color;
});

// ── Toggle mostrar/ocultar contraseña ────────────────────────────────────
function togglePass(inputId, iconEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    iconEl.innerHTML = show ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
}
