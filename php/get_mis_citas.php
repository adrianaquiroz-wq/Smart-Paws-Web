<?php
//get_mis_citas.php
session_start();
include("conexion.php");

if (!isset($_SESSION['carnet'])) {
    die(json_encode([]));
}

$carnetDue = $_SESSION['carnet'];

// CORRECCIÓN: Agregamos c.id_cita a la consulta SQL
$sql = "SELECT c.id_cita, c.fecha, c.hora, c.motivo, c.estado, m.nombre AS mascota, p.nombre AS vet_nombre 
        FROM citas c
        INNER JOIN mascotas m ON c.id_mascota = m.id_mascota
        INNER JOIN personas p ON c.carnetVet = p.carnet
        WHERE c.carnetDue = '$carnetDue' AND c.estado = 'Pendiente'
        ORDER BY c.fecha ASC, c.hora ASC";

$res = $conexion->query($sql);
$citas = [];

while($fila = $res->fetch_assoc()){
    // Formateamos la fecha para que se vea bonita (Día y Mes)
    $fecha_obj = new DateTime($fila['fecha']);
    $fila['dia'] = $fecha_obj->format('d');
    $fila['mes'] = $fecha_obj->format('M'); // Ene, Feb, Mar...
    
    // Como ya agregamos c.id_cita, $fila ya la incluye automáticamente aquí
    $citas[] = $fila;
}

header('Content-Type: application/json');
echo json_encode($citas);
?>