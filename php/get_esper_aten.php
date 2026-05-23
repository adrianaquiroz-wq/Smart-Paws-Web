<?php
/* get_esper_aten.php */
session_start();
include 'conexion.php';
header('Content-Type: application/json; charset=utf-8');

$carnetVet = $_SESSION['carnet'] ?? null;

if (!$carnetVet) {
    echo json_encode([]);
    exit;
}

$fecha_hoy = date('Y-m-d');

$sql = "SELECT 
            c.id_cita, 
            c.hora, 
            c.fecha, 
            c.motivo, 
            c.estado,
            m.id_mascota, 
            m.nombre AS nombre_mascota, 
            m.fecha_nacimiento, 
            m.foto, 
            r.nombre AS raza,
            e.nombre AS especie,
            p.nombre AS dueno_nombre, 
            p.apellido AS dueno_apellido
        FROM citas c
        INNER JOIN mascotas m ON c.id_mascota = m.id_mascota
        INNER JOIN razas r ON m.id_raza = r.id_raza
        INNER JOIN especies e ON r.id_especie = e.id_especie
        INNER JOIN personas p ON c.carnetDue = p.carnet
        WHERE c.estado = 'Pendiente'
          AND c.carnetVet = ?
          AND c.fecha = ?
        ORDER BY c.hora ASC";

$stmt = $conexion->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["error" => "Prepare falló: " . $conexion->error]);
    exit;
}

$stmt->bind_param("is", $carnetVet, $fecha_hoy);
$stmt->execute();
$resultado = $stmt->get_result();

$pacientes = [];
while ($fila = $resultado->fetch_assoc()) {
    $fila['nombre_dueno'] = trim($fila['dueno_nombre'] . ' ' . $fila['dueno_apellido']) ?: 'Particular';
    $pacientes[] = $fila;
}

$stmt->close();
echo json_encode($pacientes, JSON_UNESCAPED_UNICODE);
?>