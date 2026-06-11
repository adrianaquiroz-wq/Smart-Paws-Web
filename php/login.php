<?php
session_start();
include("conexion.php");

// Validar que los datos lleguen por POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario = mysqli_real_escape_string($conexion, $_POST['usuario']);
    $contrasena = mysqli_real_escape_string($conexion, $_POST['contrasena']);
    $rol = $_POST['rol'];

    $sql = "SELECT * FROM PERSONAS WHERE usuario='$usuario' AND contrasena='$contrasena'";
    $resultado = $conexion->query($sql);

    if ($resultado && $resultado->num_rows > 0) {
        $fila = $resultado->fetch_assoc();
        $carnet = $fila['carnet'];

        $_SESSION['nombre'] = $fila['nombre'];
        $_SESSION['carnet'] = $carnet;

        if ($rol == "cliente") {
            $check = $conexion->query("SELECT * FROM CLIENTES WHERE carnetDue = $carnet");

            if ($check && $check->num_rows > 0) {
                $_SESSION['rol'] = "cliente";
                echo "cliente";
            } else {
                echo "no_rol";
            }
        }

        if ($rol == "veterinario") {
            $check = $conexion->query("SELECT * FROM VETERINARIOS WHERE carnetVet = $carnet");

            if ($check && $check->num_rows > 0) {
                $_SESSION['rol'] = "veterinario";
                echo "veterinario";
            } else {
                // Capturar campos adicionales obligatorios enviados desde el Login modificado
                $especialidad = isset($_POST['especialidad']) ? mysqli_real_escape_string($conexion, $_POST['especialidad']) : '';
                $matricula = isset($_POST['matricula']) ? mysqli_real_escape_string($conexion, $_POST['matricula']) : '';

                // Verificar si ya tiene una solicitud registrada previa
                $pendiente = $conexion->query("SELECT * FROM solicitudes_veterinarios WHERE carnetVet = $carnet");
                
                if ($pendiente && $pendiente->num_rows > 0) {
                    $solicitud = $pendiente->fetch_assoc();
                    echo ($solicitud['estado'] == 'Pendiente') ? "pendiente" : "no_rol";
                } else {
                    // Si no tiene solicitud y envió los datos del formulario, se crea la nueva postulación
                    if (!empty($especialidad) && !empty($matricula)) {
                        $insertarSolicitud = $conexion->query("INSERT INTO solicitudes_veterinarios (carnetVet, especialidad, matricula, estado) VALUES ($carnet, '$especialidad', '$matricula', 'Pendiente')");
                        echo "pendiente";
                    } else {
                        echo "datos_incompletos";
                    }
                }
            }
        }
    } else {
        echo "error";
    }
} else {
    echo "metodo_no_permitido";
}
?>