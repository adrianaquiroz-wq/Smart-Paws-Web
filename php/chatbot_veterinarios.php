<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'conexion.php';

$sql = "SELECT v.carnetVet, p.nombre, p.apellido, v.especialidad
        FROM veterinarios v
        INNER JOIN personas p ON v.carnetVet = p.carnet
        ORDER BY p.nombre ASC";

$resultado = $conexion->query($sql);
$veterinarios = [];

if ($resultado) {
    while ($fila = $resultado->fetch_assoc()) {
        $veterinarios[] = $fila;
    }
}

echo json_encode($veterinarios);
?>
