<?php
// php/get_mascota_detalle.php
// Devuelve los datos de una mascota por id_mascota, incluyendo id_especie para preseleccionar.

session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once 'conexion.php';

$id = isset($_GET['id_mascota']) ? (int) $_GET['id_mascota'] : 0;

if (!$id) {
    echo json_encode(['error' => 'ID no válido']);
    exit;
}

$sql = "
    SELECT
        m.id_mascota,
        m.nombre,
        m.id_color,
        m.id_raza,
        m.fecha_nacimiento,
        m.tamano,
        m.descripcion,
        m.alergias,
        m.foto,
        m.estado,
        r.id_especie
    FROM mascotas m
    LEFT JOIN razas r ON r.id_raza = m.id_raza
    WHERE m.id_mascota = ?
    LIMIT 1
";

$stmt = $conexion->prepare($sql);
if (!$stmt) {
    echo json_encode(['error' => 'Prepare falló: ' . $conexion->error]);
    exit;
}

$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();
$row    = $result->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode(['error' => 'Mascota no encontrada']);
    exit;
}

echo json_encode($row);
?>