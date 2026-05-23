/* atenciones.js — versión actualizada con botones Atender y Ausente */

// Al cargar el documento
document.addEventListener("DOMContentLoaded", () => {
    cargarCitasEspera();

    const toggleBtn = document.getElementById('menu-toggle');
    const sidebar   = document.getElementById('sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => sidebar.classList.toggle('active'));
    }

    const fechaEl = document.getElementById('fecha-hoy');
    if (fechaEl) {
        fechaEl.textContent = new Date().toLocaleDateString('es-BO', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
});

// ==========================================
// CARGA DE CITAS EN ESPERA
// ==========================================
function cargarCitasEspera() {
    const tbody = document.getElementById("tabla-espera-tbody");
    if (!tbody) return;

    fetch("php/get_esper_aten.php")
        .then(res => {
            if (!res.ok) throw new Error("Error en la respuesta del servidor");
            return res.json();
        })
        .then(data => {
            tbody.innerHTML = "";

            if (!Array.isArray(data)) throw new Error("Formato inválido.");

            const citasPendientes = data.filter(c => c.estado === 'Pendiente');

            if (citasPendientes.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--texto-suave);">No hay pacientes esperando consulta médica para el día de hoy.</td></tr>`;
                return;
            }

            citasPendientes.forEach(cita => {
                const horaCita      = cita.hora            || "00:00";
                const nombreMascota = cita.nombre_mascota  || "Paciente";
                const especieMascota= cita.especie         || "Animal";
                const razaMascota   = cita.raza            || "Sin especificar";
                const duenoMascota  = cita.nombre_dueno    || "Particular";
                const motivoCita    = cita.motivo          || "Consulta general";
                const idCita        = cita.id_cita;

                // Foto o icono
                let fotoHTML = "";
                if (cita.foto) {
                    fotoHTML = `<img src="${cita.foto}" alt="${nombreMascota}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;border:2px solid var(--verde-vivo);">`;
                } else {
                    fotoHTML = `<i class="fas fa-paw" style="color:var(--verde-vivo);font-size:1.1rem;margin-right:8px;vertical-align:middle;"></i>`;
                }

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td data-label="Hora Cita"><strong>${horaCita}</strong></td>
                    <td data-label="Mascota">
                        <div style="display:flex;align-items:center;">
                            ${fotoHTML}
                            <div>
                                <strong>${nombreMascota}</strong>
                                <br><span style="font-size:.78rem;color:var(--texto-suave);">${especieMascota} · ${razaMascota}</span>
                            </div>
                        </div>
                    </td>
                    <td data-label="Propietario">${duenoMascota}</td>
                    <td data-label="Motivo" style="font-size:.88rem;color:var(--texto-suave);">${motivoCita}</td>
                    <td data-label="Acciones">
                        <div style="display:flex;gap:6px;flex-wrap:wrap;">
                            <button class="btn-tabla btn-atender-row"
                                style="background:var(--verde-vivo);color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;font-size:.82rem;display:flex;align-items:center;gap:5px;">
                                <i class="fas fa-stethoscope"></i> Atender
                            </button>
                            <button class="btn-tabla btn-ausente-row"
                                style="background:#f4a261;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-weight:600;font-size:.82rem;display:flex;align-items:center;gap:5px;">
                                <i class="fas fa-user-slash"></i> Ausente
                            </button>
                        </div>
                    </td>
                `;

                // ── Botón ATENDER → redirige a registrar_atencion.html con parámetros ──
                tr.querySelector(".btn-atender-row").addEventListener("click", () => {
                    atenderCita(cita);
                });

                // ── Botón AUSENTE → marca como ausente ──
                tr.querySelector(".btn-ausente-row").addEventListener("click", () => {
                    marcarAusente(idCita, nombreMascota);
                });

                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Error al cargar la tabla:", err);
            const tbody2 = document.getElementById("tabla-espera-tbody");
            if (tbody2) {
                tbody2.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--emergencia);font-weight:bold;"><i class="fas fa-exclamation-triangle"></i> Error al sincronizar con el servidor.</td></tr>`;
            }
        });
}

// ==========================================
// BOTÓN ATENDER → va a registrar_atencion.html
// ==========================================
function atenderCita(cita) {
    const params = new URLSearchParams({
        modo:       'Normal',
        id_cita:    cita.id_cita    || '',
        id_mascota: cita.id_mascota || '',
        nombre:     cita.nombre_mascota  || 'Paciente',
        especie:    cita.especie         || '--',
        raza:       cita.raza            || '--',
        fecha_nac:  cita.fecha_nacimiento || '',
        foto:       cita.foto            || '',
        hora:       cita.hora            || '--:--',
        motivo:     cita.motivo          || 'Consulta general'
    });
    window.location.href = `registrar_atencion.html?${params.toString()}`;
}

// ==========================================
// BOTÓN AUSENTE → llama al PHP y recarga
// ==========================================
function marcarAusente(idCita, nombreMascota) {
    if (!confirm(`¿Marcar a ${nombreMascota} como Ausente?\nLa cita quedará marcada y se podrá reagendar.`)) return;

    const formData = new FormData();
    formData.append("id_cita", idCita);

    fetch("php/marcar_ausente.php", { method: "POST", body: formData })
        .then(res => res.json())
        .then(res => {
            mostrarToast(res.status === 'success'
                ? `${nombreMascota} marcado como Ausente.`
                : "Error al actualizar el estado.");
            cargarCitasEspera();
        })
        .catch(err => console.error("Error al marcar ausente:", err));
}

// ==========================================
// BOTONES SUPERIORES (Nueva Atención / Emergencia)
// → también van a registrar_atencion.html
// ==========================================
function abrirAtencionDirecta() {
    window.location.href = `registrar_atencion.html?modo=Directa`;
}

function abrirAtencionEmergencia() {
    window.location.href = `registrar_atencion.html?modo=Emergencia`;
}

// ==========================================
// TOAST
// ==========================================
function mostrarToast(mensaje) {
    const toast = document.getElementById("panel-toast");
    if (toast) {
        toast.textContent = mensaje;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3500);
    }
}