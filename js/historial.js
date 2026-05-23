/* js/historial.js */

function cargarHistorialClinico(idMascota) {
    if (!idMascota) return;

    const bloquePaciente = document.getElementById('bloquePaciente');
    const contenedorHistorial = document.getElementById('contenedorHistorial');

    fetch(`php/obtener_historial.php?id=${idMascota}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'error') {
                contenedorHistorial.innerHTML = `<p style="color:red; text-align:center;">${data.message}</p>`;
                return;
            }

            const m = data.mascota;
            const d = data.dueno;

            // 1. PINTAR CABECERA OSCURA DE LA MASCOTA
            bloquePaciente.innerHTML = `
                <div class="paciente-header">
                    <img src="${m.foto || 'img/default.png'}" alt="${m.mascota_nombre}" class="paciente-avatar">
                    <div class="paciente-datos" style="flex-grow:1;">
                        <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
                            <h2>${m.mascota_nombre}</h2>
                            <span class="badge-especie">${m.especie}</span>
                        </div>
                        
                        <div class="info-grid">
                            <div class="info-item">
                                <small>Raza / Color</small>
                                <span>${m.raza || 'Sin raza'} — ${m.color || 'No definido'}</span>
                            </div>
                            <div class="info-item">
                                <small>Propietario</small>
                                <span>${d.nombre ? `${d.nombre} ${d.apellido}` : 'No registrado / Rescatado'}</span>
                            </div>
                            <div class="info-item">
                                <small>Contacto Dueño</small>
                                <span>${d.celular || 'Sin teléfono'}</span>
                            </div>
                            <div class="info-item">
                                <small>Alergias / Advertencias</small>
                                <span style="color: ${m.alergias ? '#ff4d4d' : '#2ecc71'}; font-weight:600;">
                                    <i class="fas fa-exclamation-triangle"></i> ${m.alergias || 'Ninguna'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // 2. PINTAR LÍNEA DE TIEMPO DE CONSULTAS
            let htmlHistorial = '';

            if (data.historial.length === 0) {
                htmlHistorial = `
                    <div style="text-align:center; padding:30px; background:#242424; border-radius:8px; color:#888;">
                        <i class="fas fa-folder-open fa-2x" style="margin-bottom:10px;"></i>
                        <p style="margin:0;">Esta mascota no registra ninguna consulta médica previa.</p>
                    </div>`;
            } else {
                data.historial.forEach(aten => {
                    htmlHistorial += `
                        <div class="atencion-card">
                            <div class="atencion-header">
                                <div>
                                    <i class="far fa-calendar-alt" style="color:var(--verde-vivo, #2ecc71); margin-right:6px;"></i>
                                    <b>${aten.fecha}</b> 
                                    <span style="color:#888; font-size:0.85rem; margin-left:10px;">
                                        (${aten.hora_inicio.substring(0,5)} - ${aten.hora_fin.substring(0,5)})
                                    </span>
                                </div>
                                <span class="badge-tipo">${aten.tipo_atencion}</span>
                            </div>
                            <div class="atencion-body">
                                <div class="atencion-seccion">
                                    <h4>Diagnóstico</h4>
                                    <p>${aten.diagnostico}</p>
                                </div>
                                <div class="atencion-seccion">
                                    <h4>Tratamiento Prescrito</h4>
                                    <p>${aten.tratamiento === '0' ? 'No se recetó medicación' : aten.tratamiento}</p>
                                </div>
                                ${aten.observaciones ? `
                                <div class="atencion-seccion">
                                    <h4>Notas de control</h4>
                                    <p style="font-style: italic; color:#aaa;">${aten.observaciones}</p>
                                </div>` : ''}

                                <div class="constantes-row">
                                    <div>Peso: <strong>${aten.peso_kg ? `${aten.peso_kg} Kg` : 'N/A'}</strong></div>
                                    <div>Temp: <strong>${aten.temperatura ? `${aten.temperatura} °C` : 'N/A'}</strong></div>
                                    <div>F.Cardiaca: <strong>${aten.frecuencia_cardiaca ? `${aten.frecuencia_cardiaca} lpm` : 'N/A'}</strong></div>
                                    <div style="margin-left:auto; color:#fff;">Atendido por: <strong>Dr(a). ${aten.vet_nombre}</strong></div>
                                </div>

                                ${aten.prox_fecha ? `
                                <div style="margin-top:15px; text-align:right; font-size:0.85rem; color:#2ecc71;">
                                    <i class="far fa-calendar-check"></i> Próxima cita programada: <strong>${aten.prox_fecha}</strong>
                                </div>` : ''}
                            </div>
                        </div>
                    `;
                });
            }

            contenedorHistorial.innerHTML = htmlHistorial;
        })
        .catch(err => {
            console.error(err);
            contenedorHistorial.innerHTML = `<p style="color:red; text-align:center;">Error al cargar datos.</p>`;
        });
}

// Escuchar el ID de la URL al cargar la página
document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const idMascota = urlParams.get('id');
    if (idMascota) {
        cargarHistorialClinico(idMascota);
    }
});