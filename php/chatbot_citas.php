<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once 'conexion.php';

if (!isset($_SESSION['carnet'])) {
    echo json_encode([]);
    exit;
}

$carnetDue = (int) $_SESSION['carnet'];

$sql = "SELECT c.fecha, c.hora, c.motivo, c.estado,
               m.nombre AS mascota,
               p.nombre AS vet_nombre
        FROM citas c
        INNER JOIN mascotas m ON c.id_mascota = m.id_mascota
        INNER JOIN personas p ON c.carnetVet = p.carnet
        WHERE c.carnetDue = ?
          AND c.estado = 'Pendiente'
        ORDER BY c.fecha ASC, c.hora ASC
        LIMIT 3";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $carnetDue);
$stmt->execute();
$resultado = $stmt->get_result();

$citas = [];
while ($fila = $resultado->fetch_assoc()) {
    $citas[] = $fila;
}

echo json_encode($citas);
?>
