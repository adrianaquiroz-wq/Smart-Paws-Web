<?php
//login.php
session_start();
include("conexion.php");

$usuario = $_POST['usuario'];
$contrasena = $_POST['contrasena'];
$rol = $_POST['rol'];

$sql = "SELECT * FROM PERSONAS WHERE usuario='$usuario' AND contrasena='$contrasena'";
$resultado = $conexion->query($sql);

if ($resultado->num_rows > 0) {

    $fila = $resultado->fetch_assoc();
    $carnet = $fila['carnet'];

    $_SESSION['nombre'] = $fila['nombre'];
    $_SESSION['carnet'] = $carnet;

    if ($rol == "cliente") {
        $check = $conexion->query("SELECT * FROM CLIENTES WHERE carnetDue = $carnet");

        if ($check->num_rows > 0) {
            $_SESSION['carnet'] = $carnet;
            $_SESSION['rol'] = "cliente";
            echo "cliente";
        } else {
            echo "no_rol";
        }
    }

    if ($rol == "veterinario") {
        $check = $conexion->query("SELECT * FROM VETERINARIOS WHERE carnetVet = $carnet");

        if ($check->num_rows > 0) {
            $_SESSION['rol'] = "veterinario";
            echo "veterinario";
        } else {
            $conexion->query("CREATE TABLE IF NOT EXISTS solicitudes_veterinarios (
                id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
                carnetVet INT NOT NULL,
                especialidad VARCHAR(80) DEFAULT NULL,
                matricula VARCHAR(60) DEFAULT NULL,
                estado ENUM('Pendiente','Aprobada','Rechazada') DEFAULT 'Pendiente',
                fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_solicitud_vet (carnetVet)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            $pendiente = $conexion->query("SELECT * FROM solicitudes_veterinarios WHERE carnetVet = $carnet AND estado = 'Pendiente'");
            echo ($pendiente && $pendiente->num_rows > 0) ? "pendiente" : "no_rol";
        }
    }

} else {
    echo "error";
}
?>
