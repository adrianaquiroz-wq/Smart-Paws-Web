<?php
//get_citas_vet.php
session_start();
include 'conexion.php'; 
header('Content-Type: application/json');

$carnet_vet = $_SESSION['carnet'] ?? null;

if (!$carnet_vet) {
    echo json_encode([]);
    exit;
}

// Usamos carnetVet que es el nombre real en tu tabla 'citas'
$sql = "SELECT c.id_cita, c.fecha, c.hora, m.nombre as mascota, c.motivo 
        FROM citas c
        JOIN mascotas m ON c.id_mascota = m.id_mascota
        WHERE c.estado = 'Pendiente' 
        AND c.carnetVet = '$carnet_vet' 
        ORDER BY c.fecha ASC, c.hora ASC";

$resultado = mysqli_query($conexion, $sql);
$eventos = [];

while($fila = mysqli_fetch_assoc($resultado)) {
    $eventos[] = [
        'id'    => $fila['id_cita'],
        'title' => $fila['mascota'],
        'start' => $fila['fecha'] . "T" . $fila['hora'],
        'description' => $fila['motivo'],
        'color' => '#2ecc71'
    ];
}
echo json_encode($eventos);
?>