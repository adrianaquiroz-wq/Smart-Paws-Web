// cliente.js

// Redirige a la página de historial de la mascota
function verHistorial(id) { 
    window.location.href = `historial.html?id=${id}&origen=cliente`; 
}

function enfocarYSeleccionarMascota(idMascota) {
    const select = document.getElementById('select-mascotas');
    const seccionForm = document.getElementById('seccion-agendar');

    if (select) {
        select.value = idMascota;
    }
    if (seccionForm) {
        seccionForm.scrollIntoView({ behavior: 'smooth' });
    }
}


function cargarPerfil() {
    fetch("php/get_perfil.php")
    .then(res => res.json())
    .then(user => {
        if (!user.error) {
            const nombreEl = document.getElementById("nombre-dueno");
            const saludoEl = document.getElementById("saludo-dueno");

            if (nombreEl) nombreEl.textContent = user.nombre;
            if (saludoEl) saludoEl.textContent = `¡Hola, ${user.nombre.split(' ')[0]}! 👋`;
        }
    })
    .catch(err => console.error("No se pudo cargar el perfil:", err));
}

// Carga mascotas y veterinarios disponibles
function cargarMisMascotasYSelect() {
    fetch("php/get_mis_mascotas.php")
    .then(res => res.json())
    .then(data => {
        const selectMascota = document.getElementById('select-mascotas');
        const contenedor = document.getElementById("lista-mis-mascotas");

        // Llenar select del formulario
        if (selectMascota) {
            selectMascota.innerHTML = '<option value="" disabled selected>Selecciona una mascota</option>';
            data.forEach(m => {
                selectMascota.innerHTML += `<option value="${m.id_mascota}">${m.nombre}</option>`;
            });
        }

        // Renderizar tarjetas en el dashboard
        if (contenedor) {
            contenedor.innerHTML = "";

            if (!data || data.length === 0) {
                contenedor.innerHTML = `<p class="citas-vacias-texto" style="grid-column: 1/-1; text-align: center;">No tienes mascotas vinculadas.</p>`;
                return;
            }

            data.forEach(m => {
                contenedor.innerHTML += `
                <div class="mascota-card-dinamica">
                    <img src="${m.foto || 'img/default.png'}" alt="${m.nombre}">
                    <h3>${m.nombre}</h3>
                    <p>${m.raza}</p>
                    <div style="display:flex; gap:10px; justify-content:center;">
                        <button class="card-btn-accion" style="padding: 6px 12px; background: var(--arena); border-radius: var(--radio-sm); border:none; font-weight:600; cursor:pointer;" onclick="verHistorial(${m.id_mascota})">Historial</button>
                        <button class="btn-principal" style="padding: 6px 12px; font-size:0.85rem;" onclick="enfocarYSeleccionarMascota(${m.id_mascota})">Cita</button>
                    </div>
                </div>`;
            });
        }
    })
    .catch(err => console.error("Error al obtener mascotas:", err));

    // Cargar Catálogo de Veterinarios
    fetch("php/get_veterinarios.php")
    .then(res => res.json())
    .then(vets => {
        const selectVet = document.getElementById('select-veterinarios');
        if (selectVet) {
            selectVet.innerHTML = '<option value="" disabled selected>Selecciona un especialista</option>';
            vets.forEach(v => {
                selectVet.innerHTML += `<option value="${v.carnetVet}">Dr(a). ${v.nombre} ${v.apellido}</option>`;
            });
        }
        // Ejecutamos validación por si la fecha ya estaba puesta
        if (typeof validarActivacionConsulta === "function") {
            validarActivacionConsulta();
        }
    })
    .catch(err => console.error("Error al cargar veterinarios:", err));
}


// Cargar citas pendientes
function cargarCitasPendientes() {
    fetch("php/get_mis_citas.php")
    .then(res => res.json())
    .then(data => {
        const contenedor = document.getElementById("citas-dueno");
        if (!contenedor) return;

        if (!data || data.length === 0) {
            contenedor.innerHTML = `<p class="citas-vacias-texto">No tienes citas próximas agendadas.</p>`;
            return;
        }

        contenedor.innerHTML = ""; 
        data.forEach(c => {
            // VERIFICACIÓN: Solo mostramos el botón si la cita sigue en estado "Pendiente"
            let botonCancelar = "";
            if (c.estado.trim().toLowerCase() === "pendiente") {
                botonCancelar = `
                    <button class="btn-cancelar-cita-dinamico" 
                            style="background: #ff4d4d; color: white; border: none; padding: 6px 10px; border-radius: var(--radio-sm); cursor: pointer; font-weight: 600; font-size: 0.8rem; margin-left: auto;" 
                            onclick="cancelarMiCita(${c.id_cita})">
                        <i class="fas fa-times-circle"></i> Cancelar
                    </button>
                `;
            }

            contenedor.innerHTML += `
            <div class="cita-item-fila" style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div class="cita-calendario-badge">
                        <span class="badge-dia">${c.dia}</span>
                        <span class="badge-mes">${c.mes}</span>
                    </div>
                    <div class="cita-info-texto">
                        <h4>${c.mascota} — <span>${c.hora}</span></h4>
                        <p>Dr(a). ${c.vet_nombre} | ${c.motivo}</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="status-badge pendiente">${c.estado}</span>
                    ${botonCancelar}
                </div>
            </div>`;
        });
    })
    .catch(err => console.error("Error cargando citas:", err));
}

function validarActivacionConsulta() {
    const selectVet = document.getElementById("select-veterinarios");
    const inputFecha = document.getElementById("input-fecha");
    const btnVerHorarios = document.getElementById("btn-ver-horarios");

    if (selectVet && inputFecha && btnVerHorarios) {
        if (selectVet.value !== "" && inputFecha.value !== "") {
            btnVerHorarios.removeAttribute("disabled");
        } else {
            btnVerHorarios.setAttribute("disabled", "true");
        }
    }
}

let idCitaParaCancelar = null;

// Modificado: Abre el modal del sistema en lugar de usar el confirm() del navegador
function cancelarMiCita(idCita) {
    idCitaParaCancelar = idCita;
    
    const modal = document.getElementById("modal-confirmacion");
    if (modal) {
        modal.classList.add("active");
    }
}

// Evento para inicializar las acciones del modal una vez cargado el DOM
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal-confirmacion");
    const btnAceptar = document.getElementById("btn-modal-aceptar");
    const btnCancelar = document.getElementById("btn-modal-cancelar");

    if (!modal) return;

    // Si el usuario confirma en tu ventanita del sistema
    btnAceptar.addEventListener("click", () => {
        modal.classList.remove("active");
        
        if (idCitaParaCancelar) {
            ejecutarCancelacionEnBackend(idCitaParaCancelar);
        }
    });

    // Si el usuario decide dar marcha atrás
    btnCancelar.addEventListener("click", () => {
        modal.classList.remove("active");
        idCitaParaCancelar = null;
    });
});

// Función interna que realiza la petición FETCH real hacia tu PHP
function ejecutarCancelacionEnBackend(idCita) {
    const datosCita = new URLSearchParams();
    datosCita.append('id_cita', idCita);

    fetch("php/cancelar_cita.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: datosCita.toString()
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            mostrarNotificacion("¡Cita cancelada con éxito!", "success");
            cargarCitasPendientes();
        } else {
            mostrarNotificacion("Error al intentar cancelar: " + data.message, "error");
        }
    })
    .catch(err => {
        console.error("Error en la petición de cancelación:", err);
        mostrarNotificacion("Ocurrió un problema de red al intentar cancelar la cita.", "error");
    });
}

// Función para mostrar notificaciones flotantes (Toasts) dentro del sistema sin usar alert()
function mostrarNotificacion(mensaje, tipo = "success") {
    const contenedor = document.getElementById("toast-container");
    if (!contenedor) return;

    // Crear el elemento del toast
    const toast = document.createElement("div");
    toast.className = `custom-toast ${tipo}`;
    
    // Asignar un icono según el tipo de mensaje
    let icono = '<i class="fas fa-check-circle" style="color:#2ecc71;"></i>';
    if (tipo === "error") icono = '<i class="fas fa-times-circle" style="color:#ff4d4d;"></i>';
    if (tipo === "warning") icono = '<i class="fas fa-exclamation-triangle" style="color:#f1c40f;"></i>';

    toast.innerHTML = `${icono} <span>${mensaje}</span>`;
    contenedor.appendChild(toast);

    // Desvanecer y eliminar automáticamente a los 4 segundos
    setTimeout(() => {
        toast.classList.add("fade-out");
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }, 4000);
}
// --- 3. INICIALIZACIÓN COMPLETA DEL DOM ---
document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. CONTROL DEL MENÚ HAMBURGUESA
    // ==========================================
    const menuBtn = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("sidebar");

    if (menuBtn && sidebar) {
        menuBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            sidebar.classList.toggle("active");
        });

        document.addEventListener("click", (e) => {
            const clickDentroSidebar = e.target.closest("#sidebar");
            const clickBoton = e.target.closest("#menu-toggle");

            if (sidebar.classList.contains("active") && !clickDentroSidebar && !clickBoton) {
                sidebar.classList.remove("active");
            }
        });
    }

    // Inicializar datos iniciales
    cargarPerfil();
    cargarMisMascotasYSelect();

    if (document.getElementById("citas-dueno")) {
        cargarCitasPendientes();
    }

    // ==========================================
    // 2. SISTEMA DE HORARIOS Y AGENDA
    // ==========================================
    const selectVet = document.getElementById("select-veterinarios");
    const inputFecha = document.getElementById("input-fecha");
    const btnVerHorarios = document.getElementById("btn-ver-horarios");
    const agendaContainer = document.getElementById("agenda-dia-container");
    const gridHoras = document.getElementById("grid-horas");
    const inputHoraFinal = document.getElementById("input-hora-final");

    const rangoHorasBase = [
        "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
        "14:00","14:30","15:00","15:30", "16:00", "16:30", "17:00", "17:30",
        "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
        "21:30", "22:00", "22:30", "23:00", "23:45"
    ];

    // Escuchar cambios para activar el botón (Corregido y verificado)
    if (selectVet && inputFecha) {
        selectVet.addEventListener("change", validarActivacionConsulta);
        inputFecha.addEventListener("change", validarActivacionConsulta);
        inputFecha.addEventListener("input", validarActivacionConsulta);
    }

    // Evento Click para visualizar horarios
    if (btnVerHorarios) {
        btnVerHorarios.addEventListener("click", () => {
            const vetSeleccionado = selectVet.value;
            const fechaSeleccionada = inputFecha.value;

            gridHoras.innerHTML = "<p style='grid-column:1/-1; text-align:center; color:gray;'><i class='fas fa-spinner fa-spin'></i> Consultando agenda...</p>";
            inputHoraFinal.value = "";

            // Hacemos la consulta al nuevo backend pasando el veterinario y la fecha elegida
            fetch(`php/get_horas_ocupadas.php?carnetVet=${vetSeleccionado}&fecha=${fechaSeleccionada}`)
            .then(res => res.json())
            .then(horasOcupadasBD => {
                gridHoras.innerHTML = ""; // Limpiamos el cargador

                rangoHorasBase.forEach(hora => {
                    const botonHora = document.createElement("button");
                    botonHora.type = "button";
                    botonHora.textContent = hora;
                    botonHora.classList.add("hora-bloque");

                    // Comparamos si la hora (ej: "09:30") está en la lista que mandó la BD
                    if (horasOcupadasBD.includes(hora)) {
                        botonHora.classList.add("ocupado");
                        botonHora.setAttribute("disabled", "true");
                    } else {
                        botonHora.classList.add("disponible");
                        botonHora.addEventListener("click", () => {
                            document.querySelectorAll(".hora-bloque.seleccionado").forEach(b => {
                                b.classList.remove("seleccionado");
                            });
                            botonHora.classList.add("seleccionado");
                            inputHoraFinal.value = hora;
                        });
                    }
                    gridHoras.appendChild(botonHora);
                });

                agendaContainer.classList.remove("hidden");
            })
            .catch(err => {
                console.error("Error al obtener disponibilidad:", err);
                gridHoras.innerHTML = "<p style='grid-column:1/-1; color:red; text-align:center;'>Error al cargar los horarios.</p>";
            });
        });
    }
    // Envío del formulario de cita
    const formCita = document.getElementById("form-agendar-cita");
    if (formCita) {
        formCita.addEventListener("submit", (e) => {
            e.preventDefault();

            if (!inputHoraFinal || !inputHoraFinal.value) {
                alert("Por favor, consulta los horarios y selecciona una hora disponible en la cuadrícula.");
                return;
            }

            const formData = new FormData(formCita);
            fetch("php/guardar_cita.php", {
                method: "POST",
                body: formData
            })
            .then(res => res.text())
            .then(res => {
                if (res.trim() === "ok") {
                    alert("¡Cita agendada con éxito!");
                    location.reload();
                } else {
                    alert("Error al procesar: " + res);
                }
            })
            .catch(err => console.error("Error al guardar la cita:", err));
        });
    }
});

