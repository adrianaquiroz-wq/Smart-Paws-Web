<?php
// php/registrar_emer_comp.php


session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once 'conexion.php';

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['nombre_provisional']) || empty($input['id_especie'])) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'El nombre provisional y la especie son obligatorios.'
    ]);
    exit;
}

$nombre    = trim($input['nombre_provisional']);
$id_especie = (int) $input['id_especie'];
$id_color  = !empty($input['id_color'])   ? (int)   $input['id_color']   : null;
$descripcion = trim($input['descripcion'] ?? '');
$peso      = !empty($input['peso_aprox']) ? (float) $input['peso_aprox'] : null;

// id_raza queda NULL — se completará al registrar al dueño
// estado = 'sin_dueno

$st = $conexion->prepare(
    "INSERT INTO mascotas (nombre, id_color, id_raza, peso, descripcion, estado)
     VALUES (?, ?, NULL, ?, ?, 'sin_dueno')"
);

if (!$st) {
    echo json_encode(['status' => 'error', 'message' => 'Prepare falló: ' . $conexion->error]);
    exit;
}

// id_color puede ser NULL → usar bind con variable
$st->bind_param("sids", $nombre, $id_color, $peso, $descripcion);

if (!$st->execute()) {
    echo json_encode(['status' => 'error', 'message' => 'Error al crear mascota: ' . $st->error]);
    $st->close();
    exit;
}
$id_mascota = $conexion->insert_id;
$st->close();
// Devolvemos el id_mascota para que el JS lo pase a guardar_atencion.php
echo json_encode([
    'status'     => 'success',
    'id_mascota' => $id_mascota,
    'message'    => 'Mascota provisional creada. Continúe con el formulario clínico.'
]);
?>