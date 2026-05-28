/**registro_dueno.js */
document.addEventListener("DOMContentLoaded", () => {

    const formCliente = document.getElementById("form-cliente");

    if(formCliente){

        formCliente.addEventListener("submit", async (e) => {

            e.preventDefault();

            const datos = new FormData(formCliente);

            try{

                const res = await fetch("php/registrar_cliente.php", {
                    method: "POST",
                    body: datos
                });

                const texto = await res.text();

                const modalInfo = document.getElementById("modal-info");
                const modalExito = document.getElementById("modal-exito");

                if(modalInfo){
                    modalInfo.innerHTML = texto;
                }

                if(modalExito){
                    modalExito.classList.remove("hidden");
                }

                // LIMPIAR FORMULARIO
                formCliente.reset();

            }catch(err){

                console.error("Error al registrar:", err);

            }

        });

    }

});

function cerrarModal(){

    const modal = document.getElementById("modal-exito");

    if(modal){
        modal.classList.add("hidden");
    }

}

// Agrega esto al final de tu archivo registro_dueno.js

document.addEventListener("DOMContentLoaded", () => {
    const inputNombre = document.getElementById("cli-nombre");
    const inputApellido = document.getElementById("cli-apellido");

    // Función que remueve cualquier cosa que no sea letra o espacio
    const filtrarSoloLetras = (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    };

    if (inputNombre) {
        inputNombre.addEventListener("input", filtrarSoloLetras);
    }
    
    if (inputApellido) {
        inputApellido.addEventListener("input", filtrarSoloLetras);
    }
});