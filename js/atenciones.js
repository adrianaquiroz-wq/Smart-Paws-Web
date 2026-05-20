/*atenciones.js */
let modoActual = 'Normal'; // Puede ser: 'Normal', 'Directa', 'Emergencia'
let mascotaSeleccionadaId = null;
let citaSeleccionadaId = null;
let datosClinicosTemporales = null; // Guardará el formulario médico en caliente (Caso Emergencia)

// Al cargar el documento
document.addEventListener("DOMContentLoaded", () => {
    cargarCitasEspera();

    // VINCULACIÓN CORRECTA DE EVENTOS A LOS FORMULARIOS (Evita que la página se recargue)
    const formClinico = document.getElementById("form-registro-clinico");
    if (formClinico) {
        formClinico.addEventListener("submit", procesarBotonContinuar);
    }

    const formSecuencial = document.getElementById("form-secuencial-completo");
    if (formSecuencial) {
        formSecuencial.addEventListener("submit", guardarTodoFlujoPuff);
    }

    // Listener para el buscador de atención directa (si existe el botón)
    const btnBuscarPaciente = document.getElementById("btn-buscar-paciente-directo");
    if (btnBuscarPaciente) {
        btnBuscarPaciente.addEventListener("click", buscarMascotaDirecta);
    }
});

// ==========================================
// VISTA 1: CARGA DE DATOS ASÍNCRONA (TABLERO)
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
            
            if (!Array.isArray(data)) {
                throw new Error("El formato de respuesta no es un arreglo válido.");
            }
            
            const citasPendientes = data.filter(cita => cita.estado === 'Pendiente' || cita.estado === 'Confirmada');
            
            // Si no hay citas, ocupamos las 5 columnas modificadas
            if (citasPendientes.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color:var(--texto-suave);">No hay pacientes esperando consulta médica para el día de hoy.</td></tr>`;
                return;
            }

            // Si hay citas, dibujamos las 5 columnas correspondientes
            citasPendientes.forEach(cita => {
                const horaCita = cita.hora || "00:00";
                const nombreMascota = cita.nombre_mascota || "Paciente";
                const especieMascota = cita.especie || "Animal";
                const razaMascota = cita.raza || "Sin especificar";
                const duenoMascota = cita.nombre_dueno || "Particular";
                const motivoCita = cita.motivo || "Consulta general";
                const idCita = cita.id_cita;
                
                // Manejo de la foto de la mascota
                let fotoMascotaHTML = "";
                if (cita.foto) {
                    fotoMascotaHTML = `<img src="${cita.foto}" alt="${nombreMascota}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 8px; border: 2px solid var(--verde-vivo);">`;
                } else {
                    fotoMascotaHTML = `<i class="fas fa-paw" style="color:var(--verde-vivo); font-size: 1.1rem; margin-right: 8px; vertical-align: middle;"></i>`;
                }

                const tr = document.createElement("tr");
                
                // CORREGIDO: Renderizado con la 5ta columna de Acciones integrada perfectamente
                tr.innerHTML = `
                    <td data-label="Hora Cita"><strong>${horaCita}</strong></td>
                    <td data-label="Mascota">
                        <div style="display: flex; align-items: center;">
                            ${fotoMascotaHTML}
                            <strong>${nombreMascota}</strong>
                        </div>
                    </td>
                    <td data-label="Especie / Raza">${especieMascota} (<span style="color:var(--texto-suave); font-size:0.85rem;">${razaMascota}</span>)</td>
                    <td data-label="Propietario">${duenoMascota}</td>
                    <td data-label="Acciones">
                        <button class="btn-tabla btn-atender-row" style="margin-right: 5px; background-color: var(--verde-vivo); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-stethoscope"></i> Atender
                        </button>
                        <button class="btn-tabla btn-cancelar-row" style="background-color: #e63946; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </td>
                `;

                // ENLACE DE EVENTOS SEGUROS A LOS BOTONES GENERADOS
                tr.querySelector(".btn-atender-row").addEventListener("click", () => iniciarAtencionCita(cita));
                tr.querySelector(".btn-cancelar-row").addEventListener("click", () => cancelarCitaRapido(idCita));

                tbody.appendChild(tr);
            });
        })
        .catch(err => {
            console.error("Error al renderizar la tabla de esperas:", err);
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 30px; color:var(--emergencia); font-weight:bold;"><i class="fas fa-exclamation-triangle"></i> Error al sincronizar con el servidor de base de datos.</td></tr>`;
        });
}

// Acción rápida para cancelar la cita desde la tabla
function cancelarCitaRapido(idCita) {
    if (confirm("¿Está seguro de que desea cancelar esta cita?")) {
        const formData = new FormData();
        formData.append("id_cita", idCita);

        fetch("php/cancelar_cita.php", {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(res => {
            mostrarToast(res.status === 'success' ? "Cita cancelada con éxito" : "Error al cancelar");
            cargarCitasEspera();
        })
        .catch(err => console.error("Error al cancelar cita:", err));
    }
}

// ==========================================
// CAMBIOS DE VISTA Y ACTIVACIÓN DE MODOS
// ==========================================
function iniciarAtencionCita(cita) {
    modoActual = 'Normal';
    mascotaSeleccionadaId = cita.id_mascota;
    citaSeleccionadaId = cita.id_cita;

    // Configurar la Pet Card de arriba
    document.getElementById("clinical-pet-name").textContent = cita.nombre_mascota;
    document.getElementById("clinical-pet-meta").textContent = `Especie: ${cita.especie} | Raza: ${cita.raza || 'Criollo'} | Edad: ${calcularEdad(cita.fecha_nacimiento)}`;
    
    const fotoElem = document.getElementById("clinical-pet-foto");
    if(fotoElem && cita.foto) fotoElem.src = cita.foto;
    
    document.getElementById("badge-tipo-consulta").classList.add("hidden");
    document.getElementById("pet-card").classList.remove("mode-emergencia");
    document.getElementById("wrapper-buscador-directo").classList.add("hidden");
    
    document.getElementById("btn-submit-clinico").innerHTML = `<i class="fas fa-save"></i> Guardar Atención Médica`;

    abrirFormularioClinico();
}

function abrirAtencionDirecta() {
    modoActual = 'Directa';
    mascotaSeleccionadaId = null;
    citaSeleccionadaId = null;

    document.getElementById("clinical-pet-name").textContent = "Buscar Paciente";
    document.getElementById("clinical-pet-meta").textContent = "Por favor busque a la mascota registrada abajo para cargar su historial.";
    document.getElementById("badge-tipo-consulta").classList.add("hidden");
    document.getElementById("pet-card").classList.remove("mode-emergencia");
    
    document.getElementById("wrapper-buscador-directo").classList.remove("hidden");
    document.getElementById("btn-submit-clinico").innerHTML = `<i class="fas fa-save"></i> Guardar Atención Médica`;

    abrirFormularioClinico();
}

function abrirAtencionEmergencia() {
    modoActual = 'Emergencia';
    mascotaSeleccionadaId = null;
    citaSeleccionadaId = null;

    document.getElementById("clinical-pet-name").textContent = "PACIENTE DE EMERGENCY NO REGISTRADO";
    document.getElementById("clinical-pet-meta").textContent = "Prioridad clínica activada. Los datos administrativos se pedirán al concluir.";
    
    const badge = document.getElementById("badge-tipo-consulta");
    if(badge) {
        badge.textContent = "Urgencia Crítica";
        badge.classList.remove("hidden");
    }
    document.getElementById("pet-card").classList.add("mode-emergencia");
    document.getElementById("wrapper-buscador-directo").classList.add("hidden");
    
    document.getElementById("btn-submit-clinico").innerHTML = `<i class="fas fa-arrow-right"></i> Continuar al Registro`;

    abrirFormularioClinico();
}

function abrirFormularioClinico() {
    const horaInicioElem = document.getElementById("clinical-hora-inicio");
    if(horaInicioElem) horaInicioElem.textContent = obtenerHoraActual();
    
    document.getElementById("vista-tablero").classList.add("hidden");
    document.getElementById("vista-formulario").classList.remove("hidden");
}

function cancelarFlujoAtencion() {
    if(confirm("¿Seguro que desea salir? Se perderán las notas clínicas actuales.")) {
        document.getElementById("form-registro-clinico").reset();
        document.getElementById("vista-formulario").classList.add("hidden");
        document.getElementById("vista-tablero").classList.remove("hidden");
        cargarCitasEspera();
    }
}

// ==========================================
// PROCESAMIENTO CLÍNICO VS FLUJO "PUFF"
// ==========================================
function procesarBotonContinuar(e) {
    e.preventDefault();

    if ((modoActual === 'Normal' || modoActual === 'Directa') && !mascotaSeleccionadaId) {
        alert("Por favor, debe vincular o buscar una mascota válida antes de guardar.");
        return;
    }

    const datosMedicos = {
        id_cita: citaSeleccionadaId,
        id_mascota: mascotaSeleccionadaId,
        asistente_nombre: document.getElementById("asistente_nombre").value,
        asistente_relacion: document.getElementById("asistente_relacion").value,
        peso_kg: document.getElementById("peso_kg").value,
        temperatura: document.getElementById("temperatura").value,
        frecuencia_cardiaca: document.getElementById("frecuencia_cardiaca").value,
        diagnostico: document.getElementById("diagnostico").value,
        tratamiento: document.getElementById("tratamiento").value,
        observaciones: document.getElementById("observaciones").value,
        prox_fecha: document.getElementById("prox_fecha").value || null,
        tipo_atencion: modoActual === 'Emergencia' ? 'Emergencia' : 'Consulta',
        hora_inicio: document.getElementById("clinical-hora-inicio").textContent,
        hora_fin: obtenerHoraActual()
    };

    if (modoActual === 'Emergencia') {
        datosClinicosTemporales = datosMedicos;
        document.getElementById("vista-formulario").classList.add("hidden");
        document.getElementById("vista-registro-secuencial").classList.remove("hidden");
    } else {
        enviarAtencionEstandar(datosMedicos);
    }
}

function enviarAtencionEstandar(datos) {
    const formData = new FormData();
    for (let key in datos) {
        formData.append(key, datos[key]);
    }

    fetch("php/guardar_atencion.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(res => {
        if(res.status === 'success') {
            mostrarToast("¡Atención médica registrada correctamente!");
            document.getElementById("form-registro-clinico").reset();
            document.getElementById("vista-formulario").classList.add("hidden");
            document.getElementById("vista-tablero").classList.remove("hidden");
            cargarCitasEspera();
        } else {
            alert("Error del servidor: " + res.message);
        }
    })
    .catch(err => console.error("Error al enviar atención:", err));
}

// ==========================================
// EL GRAN FINAL: ¡EL FLUJO PUFF ELÉCTRICO!
// ==========================================
function guardarTodoFlujoPuff(e) {
    e.preventDefault();

    const megaPaqueteCompleto = {
        atencion: datosClinicosTemporales,
        dueno: {
            ci: document.getElementById("sec_dueño_ci").value,
            nombre: document.getElementById("sec_dueño_nombre").value,
            apellido: document.getElementById("sec_dueño_apellido").value,
            telefono: document.getElementById("sec_dueño_telefono").value
        },
        mascota: {
            nombre: document.getElementById("sec_mascota_nombre").value,
            species: document.getElementById("sec_mascota_especie").value,
            raza: document.getElementById("sec_mascota_raza").value,
            fecha_nacimiento: document.getElementById("sec_mascota_nacimiento").value
        }
    };

    fetch("php/registrar_emergencia_completa.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(megaPaqueteCompleto)
    })
    .then(res => res.json())
    .then(res => {
        if (res.status === 'success') {
            mostrarToast("¡PUFF! Todo guardado y enlazado con éxito simultáneamente.");
            
            document.getElementById("form-registro-clinico").reset();
            document.getElementById("form-secuencial-completo").reset();
            datosClinicosTemporales = null;
            
            document.getElementById("vista-registro-secuencial").classList.add("hidden");
            document.getElementById("vista-tablero").classList.remove("hidden");
            cargarCitasEspera();
        } else {
            alert("Error en la transacción en cadena: " + res.message);
        }
    })
    .catch(err => console.error("Error en la petición masiva:", err));
}

// ==========================================
// FUNCIONES AUXILIARES UTILS
// ==========================================
function obtenerHoraActual() {
    const ahora = new Date();
    return ahora.toTimeString().split(' ')[0].substring(0, 5);
}

function calcularEdad(fechaNacimiento) {
    if(!fechaNacimiento) return "--";
    const cumple = new Date(fechaNacimiento);
    const hoy = new Date();
    let edadAnos = hoy.getFullYear() - cumple.getFullYear();
    let edadMeses = hoy.getMonth() - cumple.getMonth();
    
    if (edadMeses < 0 || (edadMeses === 0 && hoy.getDate() < cumple.getDate())) {
        edadAnos--;
        edadMeses += 12;
    }
    
    if(edadAnos === 0) return `${edadMeses} meses`;
    return `${edadAnos} años, ${edadMeses} meses`;
}

function mostrarToast(mensaje) {
    const toast = document.getElementById("panel-toast");
    if(toast) {
        toast.textContent = mensaje;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3500);
    } else {
        alert(mensaje);
    }
}

// Lógica de búsqueda manual corregida (Evita inyección HTML rota)
function buscarMascotaDirecta() {
    const busqueda = document.getElementById("input-buscar-paciente").value.trim();
    const cajaResultados = document.getElementById("resultado-busqueda-directa");
    if(!busqueda) return;

    cajaResultados.innerHTML = `<p style="color:var(--texto-suave); font-size:0.85rem;"><i class="fas fa-spinner fa-spin"></i> Filtrando registros...</p>`;
    
    fetch(`php/get_mascotas.php?q=${busqueda}`)
        .then(res => res.json())
        .then(data => {
            cajaResultados.innerHTML = "";
            if(data.length === 0) {
                cajaResultados.innerHTML = `<p style="color:#e63946; font-size:0.85rem;">No se encontraron mascotas que coincidan.</p>`;
                return;
            }
            
            data.forEach(m => {
                const div = document.createElement("div");
                div.style = "background:white; padding:10px; border-radius:5px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; border:1px solid #ddd;";
                
                div.innerHTML = `
                    <div>
                        <strong>${m.nombre}</strong> (${m.especie} - ${m.raza}) 
                        <br><span style="font-size:0.8rem; color:#666;">Dueño: ${m.nombre_dueno || 'Registrado'}</span>
                    </div>
                    <button type="button" class="btn-tabla btn-seleccionar-mascota" style="margin:0;">
                        Seleccionar
                    </button>
                `;
                
                // Evento seguro para el botón de búsqueda manual
                div.querySelector(".btn-seleccionar-mascota").addEventListener("click", () => {
                    seleccionarMascotaManual(m.id_mascota, m.nombre, m.especie, m.raza, m.fecha_nacimiento);
                });

                cajaResultados.appendChild(div);
            });
        })
        .catch(err => {
            console.error("Error en buscador directo:", err);
            boxResultados.innerHTML = `<p style="color:var(--emergencia); font-size:0.85rem;">Error al buscar en el servidor.</p>`;
        });
}

function seleccionarMascotaManual(id, nombre, especie, raza, fNac) {
    mascotaSeleccionadaId = id;
    document.getElementById("clinical-pet-name").textContent = nombre;
    document.getElementById("clinical-pet-meta").textContent = `Especie: ${especie} | Raza: ${raza} | Edad: ${calcularEdad(fNac)}`;
    document.getElementById("resultado-busqueda-directa").innerHTML = `<p style="color:#2a9d8f; font-weight:bold; font-size:0.85rem;"><i class="fas fa-check-circle"></i> Vinculado a ${nombre} con éxito.</p>`;
}