/*panel_vet.js */
/* --- CARGAR LISTA DE MASCOTAS RECIENTES --- */
function cargarMascotasRecientes() {
    // Esta función llena la sección de "Mascotas registradas recientemente"
    fetch("php/get_mascotas.php")
    .then(res => res.json())
    .then(mascotas => {
        let cont = document.getElementById("lista-mascotas");
        if (!cont) return;
        
        cont.innerHTML = "";
        mascotas.forEach(m => {
            cont.innerHTML += `
                <div class="card" style="margin-bottom: 10px; padding: 10px;">
                    <div style="display:flex;gap:10px;align-items:center;">
                        <img src="${m.foto || 'img/default.png'}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;">
                        <div>
                            <b>${m.nombre}</b><br>
                            <small>${m.raza || 'Sin raza'}</small>
                        </div>
                    </div>
                    <div class="actions" style="margin-top:10px;">
                        <button class="btn-sm" onclick="historial(${m.id_mascota})">Historial</button>
                        <button class="btn-sm" onclick="nuevaAtencion(${m.id_mascota})">Atención</button>
                    </div>
                </div>`;
        });
    })
    .catch(err => console.error("Error al cargar mascotas:", err));
}

/* --- BUSCADOR POR CARNET --- */
function buscarPacientes(){
    let ci = document.getElementById("busca-ci").value;

    if(ci == ""){
        alert("Ingrese carnet por favor");
        return;
    }

    fetch("php/buscar_dueno.php?ci=" + ci)
    .then(res => res.json())
    .then(data => {
        let cont = document.getElementById("resultado-busqueda");
        cont.innerHTML = "";

        if(data.length == 0){
            cont.innerHTML = `<p style="margin-top:10px;color:red;">No se encontraron mascotas para este dueño</p>`;
            return;
        }

        data.forEach(m => {
            cont.innerHTML += `
            <div class="card" style="margin-top:15px;">
                <div style="display:flex;align-items:center;gap:15px;">
                    <img src="${m.foto || 'img/default.png'}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">
                    <div>
                        <h4 style="margin:0;">${m.nombre}</h4>
                        <small>${m.raza}</small>
                    </div>
                </div>
                <div class="actions">
                    <button onclick="historial(${m.id_mascota})">Historial</button>
                    <button onclick="nuevaAtencion(${m.id_mascota})">Atención</button>
                </div>
            </div>`;
        });
    });
}

/* --- FUNCIONES DE NAVEGACIÓN --- */
function historial(id){
    alert("Cargando historial clínico de la mascota ID: " + id);
}

function nuevaAtencion(id){
    window.location.href = "atenciones.html?id=" + id;
}

/* --- INICIALIZACIÓN DE CALENDARIO Y DASHBOARD --- */
document.addEventListener('DOMContentLoaded', function() {
    // 1. Cargamos las mascotas primero
    cargarMascotasRecientes();
    cargarStatsDashboard();
    cargarProximasCitasLista();
    cargarNotificacionesCanceladas();

    setInterval(cargarNotificacionesCanceladas, 30000);

    // 2. Configuramos el calendario
    var calendarEl = document.getElementById('calendario');
    
    if (calendarEl) {
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'es', // Todo en español para que se vea bonito
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            },
            displayEventTime: true, // Para que salga "10:25" antes del nombre
    
    // Personalización de cómo se ve el evento en la lista
    eventDidMount: function(info) {
        if (info.view.type === 'listWeek') {
            // Añade el motivo al lado del nombre solo en la vista de lista
            let titleEl = info.el.querySelector('.fc-list-event-title');
            if (titleEl && info.event.extendedProps.description) {
                titleEl.innerHTML += ` <small style="color:gray;">(${info.event.extendedProps.description})</small>`;
            }
        }
    },
            
            // CONEXIÓN A TU API DE CITAS (MySQL)
            events: 'php/get_citas_vet.php', 
            
            eventClick: function(info) {
                alert('Detalle de la Cita: ' + info.event.title);
            },
            
            noEventsContent: 'No hay citas para mostrar'
        });

        calendar.render();
        window.smartPawsCalendar = calendar;
        window.addEventListener('resize', () => {
            calendar.updateSize();
        });
    }
});


/*--- ------------ STATS--------------------*/
function cargarStatsDashboard() {
    fetch('php/get_dashboard_stats.php')
        .then(res => res.json())
        .then(data => {
            // Actualizar números
            document.getElementById('stat-mascotas-hoy').textContent = data.mascotas_hoy;
            document.getElementById('stat-citas-pendientes').textContent = data.citas_pendientes;
            document.getElementById('stat-total-clientes').textContent = data.total_clientes;
            document.getElementById('stat-total-animales').textContent = data.total_animales;
            
            // Actualizar la hora de la próxima cita
            const labelProxima = document.getElementById('label-proxima-cita');
            if(labelProxima) labelProxima.textContent = `Próxima: ${data.proxima_cita}`;
        })
        .catch(err => console.error("Error cargando stats:", err));
}

function cargarProximasCitasLista() {
    fetch('php/get_citas_vet.php')
        .then(res => res.json())
        .then(eventos => {
            const cont = document.getElementById('contenedor-proximas-citas');
            if (!cont) return;
            
            if (eventos.length === 0) {
                cont.innerHTML = "<p style='padding:15px; color:gray;'>No hay citas pendientes.</p>";
                return;
            }

            cont.innerHTML = "";
            const hoyObj = new Date();
            hoyObj.setHours(0, 0, 0, 0);

            eventos.forEach(cita => {
                const fechaCita = new Date(cita.start);
                const soloFechaCita = new Date(cita.start);
                soloFechaCita.setHours(0, 0, 0, 0);

                let etiquetaFecha = "";
                const difTiempo = soloFechaCita.getTime() - hoyObj.getTime();
                const difDias = Math.round(difTiempo / (1000 * 3600 * 24));

                if (difDias === 0) etiquetaFecha = "HOY";
                else if (difDias === 1) etiquetaFecha = "Mañana";
                else etiquetaFecha = `${fechaCita.getDate()}/${fechaCita.getMonth() + 1}`;

                const hora = cita.start.split('T')[1].substring(0, 5);

                cont.innerHTML += `
                    <div class="mascota-item" style="border-left: 4px solid ${difDias === 0 ? '#2ecc71' : '#ddd'}; margin-bottom: 8px; padding: 10px; background: #f9f9f9; border-radius: 4px;">
                        <div>
                            <span style="font-size: 0.7rem; font-weight: 800; color: ${difDias === 0 ? '#2ecc71' : 'gray'};">
                                [${etiquetaFecha.toUpperCase()}]
                            </span>
                            <span style="font-weight:700;">${hora}</span> — ${cita.title}
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px;">
                            <span style="font-size:.8rem; color:#666;">${cita.description || 'Sin motivo'}</span>
                            <span class="status-badge ${difDias === 0 ? 'hoy' : 'pendiente'}" style="font-size: 0.65rem; background: ${difDias === 0 ? '#e8f5e9' : '#fff3e0'}; color: ${difDias === 0 ? '#2e7d32' : '#ef6c00'}; padding: 2px 6px; border-radius: 4px;">
                                ${difDias === 0 ? 'Urgente' : 'Programada'}
                            </span>
                        </div>
                    </div>`;
            });
        })
        .catch(err => {
            console.error("Error cargando lista de citas:", err);
            document.getElementById('contenedor-proximas-citas').innerHTML = "Error al conectar con el servidor.";
        });
}

/* --- AUMENTADO: CARGAR NOTIFICACIONES DE CITAS CANCELADAS --- */
function cargarNotificacionesCanceladas() {
    const contenedor = document.getElementById("contenedor-notificaciones");
    if (!contenedor) return;

    fetch("php/get_notificaciones.php")
    .then(res => res.json())
    .then(response => {
        if (response.success && response.data.length > 0) {
            contenedor.innerHTML = ""; // Limpiamos el texto "Cargando avisos del sistema..."
            
            response.data.forEach(noti => {
                // Formateamos la fecha de la cita cancelada de forma más legible
                const fechaPartes = noti.fecha.split('-');
                const fechaFormateada = `${fechaPartes[2]}/${fechaPartes[1]}/${fechaPartes[0]}`;

                contenedor.innerHTML += `
                    <div class="mascota-item" style="border-left: 4px solid #ff4d4d; margin-bottom: 10px; padding: 12px; background: #fff5f5; border-radius: var(--radio-sm, 6px); box-shadow: 0 2px 4px rgba(255,0,0,0.03);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <span style="font-size: 0.75rem; font-weight: 800; color: #ff4d4d; letter-spacing: 0.5px;">
                                    <i class="fas fa-exclamation-triangle"></i> CITA CANCELADA
                                </span>
                                <h4 style="margin: 4px 0; font-size: 0.95rem; color: #333;">
                                    <b>${noti.mascota}</b> — <span style="color: #555;">${noti.hora.substring(0, 5)}</span>
                                </h4>
                                <p style="font-size: 0.85rem; color: #555; margin: 2px 0;">
                                    Propietario: <strong>${noti.dueno}</strong>
                                </p>
                                <p style="font-size: 0.8rem; color: #777; margin-top: 4px; font-style: italic; background: rgba(0,0,0,0.03); padding: 4px 8px; border-radius: 4px;">
                                    Motivo original: ${noti.motivo || 'No especificado'}
                                </p>
                            </div>
                            <span style="font-size: 0.75rem; font-weight: 700; background: #ffebee; color: #c62828; padding: 3px 8px; border-radius: 12px;">
                                ${fechaFormateada}
                            </span>
                        </div>
                    </div>`;
            });
        } else {
            // Si el backend responde sin datos o success es false
            contenedor.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--texto-suave);">
                    <i class="fas fa-bell-slash" style="font-size: 1.5rem; margin-bottom: 8px; color: #ccc;"></i>
                    <p style="font-size: 0.88rem; margin: 0;">No hay nuevas alertas ni cancelaciones.</p>
                </div>`;
        }
    })
    .catch(err => {
        console.error("Error al obtener las notificaciones:", err);
        contenedor.innerHTML = "<p style='color:red; padding:10px; font-size:0.85rem;'>Error al conectar con los avisos del sistema.</p>";
    });
}
