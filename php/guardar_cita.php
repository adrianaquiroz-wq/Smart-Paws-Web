<?php
/*guardar_cita.php */
session_start();
include("conexion.php");

if (!isset($_SESSION['carnet'])) {
    die("No autorizado");
}

// 1. Recibimos TODOS los datos del formulario (Faltaba id_mascota)
$carnetDue = $_SESSION['carnet'];
$id_mascota = $_POST['id_mascota']; // <--- Esto faltaba
$fecha = $_POST['fecha'];
$hora = $_POST['hora'];
$carnetVet = $_POST['carnetVet'];
$motivo = $_POST['motivo'];

// 2. Corregimos la consulta SQL (Sin comas dobles y con carnetDue)
// El orden debe ser: id_mascota, carnetDue, fecha, hora, motivo, estado, carnetVet
$sql = "INSERT INTO citas (id_mascota, carnetDue, fecha, hora, motivo, estado, carnetVet) 
        VALUES ('$id_mascota', '$carnetDue', '$fecha', '$hora', '$motivo', 'Pendiente', '$carnetVet')";

if ($conexion->query($sql)) {
    echo "ok";
} else {
    echo "Error en la base de datos: " . $conexion->error;
}
?>