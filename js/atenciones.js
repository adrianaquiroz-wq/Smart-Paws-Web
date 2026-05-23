/* atenciones.js — con panel "Editar animal" integrado en el modal */

document.addEventListener('DOMContentLoaded', () => {
    cargarCitasEspera();
    cargarCasosSinDueno();
});

// ══════════════════════════════════════════════════════════
// TABLA DE ESPERA
// ══════════════════════════════════════════════════════════
function cargarCitasEspera() {
    const tbody = document.getElementById('tabla-espera-tbody');
    if (!tbody) return;

    fetch('php/get_esper_aten.php')
        .then(res => {
            if (!res.ok) throw new Error('Error en la respuesta del servidor');
            return res.json();
        })
        .then(data => {
            tbody.innerHTML = '';
            if (!Array.isArray(data)) throw new Error('Formato inválido.');

            const citasPendientes = data.filter(c => c.estado === 'Pendiente');

            if (citasPendientes.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align:center;padding:30px;color:var(--texto-suave);">
                            No hay pacientes esperando consulta médica para el día de hoy.
                        </td>
                    </tr>`;
                return;
            }

            citasPendientes.forEach(cita => {
                const horaCita       = cita.hora           || '00:00';
                const nombreMascota  = cita.nombre_mascota || 'Paciente';
                const especieMascota = cita.especie        || 'Animal';
                const razaMascota    = cita.raza           || 'Sin especificar';
                const duenoMascota   = cita.nombre_dueno   || 'Particular';
                const motivoCita     = cita.motivo         || 'Consulta general';
                const idCita         = cita.id_cita;

                const fotoHTML = cita.foto
                    ? `<img src="${cita.foto}" alt="${nombreMascota}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;border:2px solid var(--verde-vivo);">`
                    : `<i class="fas fa-paw" style="color:var(--verde-vivo);font-size:1.1rem;margin-right:8px;vertical-align:middle;"></i>`;

                const tr = document.createElement('tr');
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

                tr.querySelector('.btn-atender-row').addEventListener('click', () => atenderCita(cita));
                tr.querySelector('.btn-ausente-row').addEventListener('click', () => marcarAusente(idCita, nombreMascota));
                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error('Error al cargar la tabla:', err);
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align:center;padding:30px;color:var(--emergencia);font-weight:bold;">
                            <i class="fas fa-exclamation-triangle"></i> Error al sincronizar con el servidor.
                        </td>
                    </tr>`;
            }
        });
}

// ══════════════════════════════════════════════════════════
// SECCIÓN SIN DUEÑO
function cargarCasosSinDueno() {
    const contenedor = document.getElementById('lista-sin-dueno');
    const badge      = document.getElementById('badge-sin-dueno-count');
    if (!contenedor) return;
 
    fetch('php/get_sin_dueno.php')
        .then(res => {
            if (!res.ok) throw new Error('Error del servidor');
            return res.json();
        })
        .then(data => {
            contenedor.innerHTML = '';
 
            if (!Array.isArray(data) || data.length === 0) {
                if (badge) badge.textContent = '';
                contenedor.innerHTML = `
                    <div class="empty-sin-dueno">
                        <i class="fas fa-check-circle" style="color:#2dc97e;margin-right:6px;"></i>
                        No hay animales pendientes de registrar propietario.
                    </div>`;
                return;
            }
 
            if (badge) badge.textContent = data.length;
 
            data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card-sin-dueno';
 
                const avatarHTML = item.foto
                    ? `<img src="${item.foto}" alt="${item.nombre_mascota}" class="pet-avatar">`
                    : `<div class="pet-avatar-icon"><i class="fas fa-paw"></i></div>`;
 
                const fechaAt    = item.fecha_atencion
                    ? new Date(item.fecha_atencion).toLocaleDateString('es-BO')
                    : 'Sin fecha';
                const especieRaza = [item.especie, item.raza].filter(Boolean).join(' — ') || 'Sin clasificar';
 
                card.innerHTML = `
                    <div class="pet-info">
                        ${avatarHTML}
                        <div>
                            <div class="pet-nombre">${item.nombre_mascota}</div>
                            <div class="pet-meta">${especieRaza}</div>
                            ${item.descripcion ? `<div class="pet-meta" style="font-style:italic;">"${item.descripcion}"</div>` : ''}
                        </div>
                    </div>
                    <div class="atencion-info">
                        <div><strong>Atención:</strong> ${fechaAt} · ${item.hora_inicio || '--:--'}</div>
                        <div><strong>Tipo:</strong> ${item.tipo_atencion || 'Emergencia'}</div>
                        ${item.diagnostico ? `<div style="margin-top:3px;color:#888;font-size:.78rem;">Dx: ${item.diagnostico.substring(0,60)}${item.diagnostico.length > 60 ? '…' : ''}</div>` : ''}
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        <span class="badge-sin-dueno">Sin dueño</span>
 
                        <button class="btn-completar"
                            style="background:#2dc97e;"
                            onclick="window.location.href='completar_mascota.html?id_mascota=${item.id_mascota}'">
                            <i class="fas fa-paw"></i> Datos del animal
                        </button>
 
                        <button class="btn-completar btn-reg-dueno" data-id="${item.id_mascota}">
                            <i class="fas fa-user-plus"></i> Registrar dueño
                        </button>
                    </div>
                `;
 
                card.querySelector('.btn-reg-dueno').addEventListener('click', () => {
                    abrirModalCompletar(item);
                });
 
                contenedor.appendChild(card);
            });
        })
        .catch(err => {
            console.error('Error al cargar casos sin dueño:', err);
            contenedor.innerHTML = `
                <div class="empty-sin-dueno" style="color:var(--emergencia);">
                    <i class="fas fa-exclamation-triangle"></i> Error al cargar los casos pendientes.
                </div>`;
        });
}

// ══════════════════════════════════════════════════════════
// MODAL: COMPLETAR REGISTRO

function abrirModalCompletar(item) {
    const modal = document.getElementById('modal-completar');
    if (!modal) return;

    // Guardar id_mascota
    document.getElementById('comp_id_mascota').value = item.id_mascota;

    // Limpiar campos del dueño
    ['comp_ci','comp_nombre','comp_apellido','comp_celular','comp_direccion','comp_usuario']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

    // ── Resumen mascota con botón "Editar animal" ──
    const especieRaza = [item.especie, item.raza].filter(Boolean).join(' · ') || 'Sin clasificar';
    const avatarHTML  = item.foto
        ? `<img src="${item.foto}" alt="${item.nombre_mascota}" class="rm-avatar">`
        : `<div class="rm-avatar-icon"><i class="fas fa-paw"></i></div>`;

    document.getElementById('modal-resumen-mascota').innerHTML = `
        <div class="rm-info">
            ${avatarHTML}
            <div>
                <div class="rm-nombre">
                    <i class="fas fa-paw" style="margin-right:5px;color:#2dc97e;"></i>${item.nombre_mascota}
                </div>
                <div class="rm-meta" id="rm-especie-raza">${especieRaza}</div>
                ${item.descripcion
                    ? `<div class="rm-meta" style="font-style:italic;margin-top:2px;">"${item.descripcion}"</div>`
                    : ''}
            </div>
        </div>
        <button class="btn-editar-animal" id="btn-toggle-editar-animal"
            onclick="toggleEditarAnimal()">
            <i class="fas fa-paw"></i> Editar animal
        </button>
    `;

    // ── Resetear panel editar animal ──
    document.getElementById('panel-editar-animal').classList.remove('abierto');
    document.getElementById('ea-msg').style.display   = 'none';
    document.getElementById('ea-especie').value        = '';
    document.getElementById('ea-raza').innerHTML       = '<option value="">Elige especie primero</option>';
    document.getElementById('ea-color').value          = '';
    document.getElementById('ea-tamano').value         = '';
    document.getElementById('ea-fecha-nac').value      = '';
    document.getElementById('ea-alergias').value       = item.alergias    ?? '';
    document.getElementById('ea-descripcion').value    = item.descripcion ?? '';
    document.getElementById('ea-foto-preview').src     = item.foto ? item.foto : 'img/default.png';
    document.getElementById('ea-foto').value           = '';

    const btnGuardar = document.getElementById('btn-guardar-animal');
    btnGuardar.disabled   = false;
    btnGuardar.innerHTML  = '<i class="fas fa-save"></i> Guardar datos del animal';

    modal.classList.remove('hidden');

    // Registrar submit (remover listener anterior primero)
    const form     = document.getElementById('form-completar-registro');
    const nuevoForm = form.cloneNode(true);
    form.parentNode.replaceChild(nuevoForm, form);
    nuevoForm.addEventListener('submit', guardarRegistroCompleto);
}

function cerrarModalCompletar() {
    document.getElementById('modal-completar')?.classList.add('hidden');
}

function guardarRegistroCompleto(e) {
    e.preventDefault();

    const btn = document.getElementById('btn-guardar-completar');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    const payload = {
        id_mascota: parseInt(document.getElementById('comp_id_mascota').value),
        dueno: {
            ci:        parseInt(document.getElementById('comp_ci').value),
            nombre:    document.getElementById('comp_nombre').value.trim(),
            apellido:  document.getElementById('comp_apellido').value.trim(),
            celular:   document.getElementById('comp_celular').value.trim(),
            direccion: document.getElementById('comp_direccion').value.trim(),
            usuario:   document.getElementById('comp_usuario').value.trim()
        }
    };

    fetch('php/completar_registro.php', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(res => {
        if (res.status === 'success') {
            cerrarModalCompletar();
            const msg = `✅ Registro completado.\n\nCredenciales del nuevo propietario:\n👤 Usuario: ${res.usuario}\n🔑 Contraseña: ${res.contrasena}\n\nAnota estos datos para entregárselos al cliente.`;
            alert(msg);
            mostrarToast('¡Registro completado! Mascota vinculada y activada.');
            setTimeout(() => cargarCasosSinDueno(), 400);
        } else {
            alert('Error: ' + res.message);
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Guardar y Activar Mascota';
        }
    })
    .catch(err => {
        console.error(err);
        alert('Error de conexión. Intenta nuevamente.');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Guardar y Activar Mascota';
    });
}

// ══════════════════════════════════════════════════════════
// PANEL EDITAR ANIMAL (dentro del modal)

function toggleEditarAnimal() {
    const panel = document.getElementById('panel-editar-animal');
    const btn   = document.getElementById('btn-toggle-editar-animal');
    const abierto = panel.classList.toggle('abierto');
    btn.classList.toggle('activo', abierto);
    btn.innerHTML = abierto
        ? '<i class="fas fa-chevron-up"></i> Ocultar'
        : '<i class="fas fa-paw"></i> Editar animal';
}

function eaCargarRazas() {
    const idEspecie = document.getElementById('ea-especie').value;
    const sel       = document.getElementById('ea-raza');
    sel.innerHTML   = '<option value="">Cargando...</option>';

    if (!idEspecie) {
        sel.innerHTML = '<option value="">Elige especie primero</option>';
        return;
    }

    fetch('php/get_razas.php?id_especie=' + idEspecie)
        .then(r => r.json())
        .then(razas => {
            sel.innerHTML = '<option value="">Seleccione raza...</option>';
            razas.forEach(r => {
                const opt = document.createElement('option');
                opt.value       = r.id_raza;
                opt.textContent = r.nombre;
                sel.appendChild(opt);
            });
        })
        .catch(() => {
            sel.innerHTML = '<option value="">Error al cargar razas</option>';
        });
}

function eaPreviewFoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('ea-foto-preview').src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function guardarDatosAnimal() {
    const btn    = document.getElementById('btn-guardar-animal');
    const idMasc = document.getElementById('comp_id_mascota').value;

    if (!idMasc) { mostrarMsgEA('No se encontró el ID de la mascota.', 'err'); return; }

    const idRaza = document.getElementById('ea-raza').value;
    if (!idRaza) { mostrarMsgEA('Seleccioná la especie y la raza antes de guardar.', 'err'); return; }

    const fd = new FormData();
    fd.append('id_mascota',       idMasc);
    fd.append('id_raza',          idRaza);
    fd.append('id_color',         document.getElementById('ea-color').value);
    fd.append('tamano',           document.getElementById('ea-tamano').value);
    fd.append('fecha_nacimiento', document.getElementById('ea-fecha-nac').value);
    fd.append('alergias',         document.getElementById('ea-alergias').value);
    fd.append('descripcion',      document.getElementById('ea-descripcion').value);

    const fotoFile = document.getElementById('ea-foto').files[0];
    if (fotoFile) fd.append('foto', fotoFile);

    btn.disabled  = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

    fetch('php/completar_mascota.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'success') {
                mostrarMsgEA('✓ Datos del animal guardados.', 'ok');

                // Actualizar el texto de especie·raza en la tarjeta resumen
                const razaTexto = document.getElementById('ea-raza')
                    .options[document.getElementById('ea-raza').selectedIndex]?.text ?? '';
                const especieTexto = document.getElementById('ea-especie')
                    .options[document.getElementById('ea-especie').selectedIndex]?.text ?? '';
                const metaEl = document.getElementById('rm-especie-raza');
                if (metaEl) metaEl.textContent = [especieTexto, razaTexto].filter(Boolean).join(' · ');

                btn.innerHTML = '<i class="fas fa-check"></i> ¡Guardado!';

                setTimeout(() => {
                    document.getElementById('panel-editar-animal').classList.remove('abierto');
                    const btnToggle = document.getElementById('btn-toggle-editar-animal');
                    if (btnToggle) {
                        btnToggle.classList.remove('activo');
                        btnToggle.innerHTML = '<i class="fas fa-paw"></i> Editar animal';
                    }
                    btn.disabled  = false;
                    btn.innerHTML = '<i class="fas fa-save"></i> Guardar datos del animal';
                }, 1800);
            } else {
                mostrarMsgEA('✗ ' + data.message, 'err');
                btn.disabled  = false;
                btn.innerHTML = '<i class="fas fa-save"></i> Guardar datos del animal';
            }
        })
        .catch(() => {
            mostrarMsgEA('Error de conexión. Intentá de nuevo.', 'err');
            btn.disabled  = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Guardar datos del animal';
        });
}

function mostrarMsgEA(texto, tipo) {
    const el = document.getElementById('ea-msg');
    el.textContent   = texto;
    el.className     = 'ea-msg ' + tipo;
    el.style.display = 'block';
    if (tipo === 'ok') setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// ══════════════════════════════════════════════════════════
// ATENDER / AUSENTE / TOAST

function atenderCita(cita) {
    const params = new URLSearchParams({
        modo:       'Normal',
        id_cita:    cita.id_cita         || '',
        id_mascota: cita.id_mascota      || '',
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

function marcarAusente(idCita, nombreMascota) {
    if (!confirm(`¿Marcar a ${nombreMascota} como Ausente?\nLa cita quedará marcada y se podrá reagendar.`)) return;

    const formData = new FormData();
    formData.append('id_cita', idCita);

    fetch('php/marcar_ausente.php', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(res => {
            mostrarToast(res.status === 'success'
                ? `${nombreMascota} marcado como Ausente.`
                : 'Error al actualizar el estado.');
            cargarCitasEspera();
        })
        .catch(err => console.error('Error al marcar ausente:', err));
}

function abrirAtencionDirecta()    { window.location.href = 'registrar_atencion.html?modo=Directa'; }
function abrirAtencionEmergencia() { window.location.href = 'registrar_atencion.html?modo=Emergencia'; }

function mostrarToast(mensaje) {
    const toast = document.getElementById('panel-toast');
    if (toast) {
        toast.textContent = mensaje;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
    }
}