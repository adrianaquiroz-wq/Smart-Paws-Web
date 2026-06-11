/*mascota.js */
document.addEventListener("DOMContentLoaded", () => {
    cargarEspecies();
});

function cargarEspecies() {
    fetch("php/get_especies.php")
        .then(res => res.text())
        .then(text => {
            try {
                let data = JSON.parse(text);

                let select = document.getElementById("especie");
                select.innerHTML = '<option value="">Seleccione especie</option>';

                data.forEach(e => {
                    select.innerHTML += `<option value="${e.id_especie}">${e.nombre}</option>`;
                });

            } catch (err) {
                console.log("❌ Error JSON especies:", text);
            }
        })
        .catch(err => console.log("❌ Error fetch especies:", err));
}


// ==========================
// CARGAR RAZAS SEGÚN ESPECIE
// ==========================
function cargarRazas() {
    let id = document.getElementById("especie").value;

    console.log("📌 Especie seleccionada:", id);

    if (!id) {
        document.getElementById("raza").innerHTML =
            '<option value="">Seleccione primero una especie</option>';
        return;
    }

    fetch("php/get_razas.php?id_especie=" + id)
        .then(res => res.text())
        .then(text => {
            try {
                let data = JSON.parse(text);

                let select = document.getElementById("raza");
                select.innerHTML = '<option value="">Seleccione raza</option>';

                if (data.length === 0) {
                    select.innerHTML += '<option value="">No hay razas</option>';
                    return;
                }

                data.forEach(r => {
                    select.innerHTML += `<option value="${r.id_raza}">${r.nombre}</option>`;
                });

            } catch (err) {
                console.log("❌ Error JSON razas:", text);
            }
        })
        .catch(err => console.log("❌ Error fetch razas:", err));
}


// ==========================
// ENVIAR FORMULARIO
// ==========================
document.getElementById("form-mascota").addEventListener("submit", function (e) {
    e.preventDefault();

    let formData = new FormData(this);

    fetch("php/registrar_mascota.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.text())
    .then(data => {
        console.log("RESPUESTA:", data);

        if (data.trim() === "ok") {
            alert("Mascota registrada correctamente 🐶🐱");
            this.reset();
            document.getElementById("img-preview").src = "img/default.png";
        } else {
            alert("Error: " + data);
        }
    })
    .catch(err => console.log("❌ Error submit:", err));
});


// ==========================
// PREVIEW IMAGEN
// ==========================
function previewImg(event) {
    if (!event.target.files[0]) return;

    const reader = new FileReader();
    reader.onload = function () {
        document.getElementById("img-preview").src = reader.result;
    }
    reader.readAsDataURL(event.target.files[0]);
}


// ==========================
// BUSCAR CLIENTE (placeholder)
// ==========================
/*function buscarCliente() {
    alert("Aquí luego conectamos búsqueda de cliente por CI 😎");
}*/