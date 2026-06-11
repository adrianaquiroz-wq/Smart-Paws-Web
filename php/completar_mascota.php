<?php
// php/completar_mascota.php
// Completa los datos faltantes de una mascota registrada como emergencia (sin_dueno)

session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once 'conexion.php';

// ─── Validación mínima ───────────────────────────────────────────────────────
if (empty($_POST['id_mascota'])) {
    echo json_encode(['status' => 'error', 'message' => 'Falta el ID de la mascota.']);
    exit;
}

$id_mascota      = (int) $_POST['id_mascota'];
$id_raza         = !empty($_POST['id_raza'])         ? (int)   $_POST['id_raza']         : null;
$id_color        = !empty($_POST['id_color'])         ? (int)   $_POST['id_color']         : null;
$tamano          = !empty($_POST['tamano'])            ? trim($_POST['tamano'])             : null;
$fecha_nacimiento= !empty($_POST['fecha_nacimiento']) ? $_POST['fecha_nacimiento']          : null;
$alergias        = trim($_POST['alergias']  ?? '');
$descripcion     = trim($_POST['descripcion'] ?? '');

// ─── Foto (opcional) ─────────────────────────────────────────────────────────
$rutaFoto = null;

if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
    $ext = strtolower(pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION));

    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
        echo json_encode(['status' => 'error', 'message' => 'Formato de imagen no válido.']);
        exit;
    }

    $carpeta = "../img/mascotas/";
    if (!file_exists($carpeta)) {
        mkdir($carpeta, 0777, true);
    }

    $nombreFoto = time() . '_' . preg_replace('/\s+/', '_', $_FILES['foto']['name']);
    move_uploaded_file($_FILES['foto']['tmp_name'], $carpeta . $nombreFoto);
    $rutaFoto = "img/mascotas/" . $nombreFoto;
}

// ─── UPDATE: solo pisa los campos que llegaron ───────────────────────────────
// Construimos la query dinámicamente para no sobrescribir datos ya existentes
$sets   = [];
$types  = '';
$params = [];

if ($id_raza !== null)          { $sets[] = 'id_raza = ?';          $types .= 'i'; $params[] = $id_raza; }
if ($id_color !== null)         { $sets[] = 'id_color = ?';         $types .= 'i'; $params[] = $id_color; }
if ($tamano !== null)           { $sets[] = 'tamano = ?';           $types .= 's'; $params[] = $tamano; }
if ($fecha_nacimiento !== null) { $sets[] = 'fecha_nacimiento = ?'; $types .= 's'; $params[] = $fecha_nacimiento; }
if ($alergias !== '')           { $sets[] = 'alergias = ?';         $types .= 's'; $params[] = $alergias; }
if ($descripcion !== '')        { $sets[] = 'descripcion = ?';      $types .= 's'; $params[] = $descripcion; }
if ($rutaFoto !== null)         { $sets[] = 'foto = ?';             $types .= 's'; $params[] = $rutaFoto; }

if (empty($sets)) {
    echo json_encode(['status' => 'error', 'message' => 'No se enviaron datos para actualizar.']);
    exit;
}

// El estado se mantiene como 'sin_dueno' — solo cambia a 'activo'
// cuando se registra el titular en completar_registro.php

$sql = "UPDATE mascotas SET " . implode(', ', $sets) . " WHERE id_mascota = ?";
$types .= 'i';
$params[] = $id_mascota;

$stmt = $conexion->prepare($sql);
if (!$stmt) {
    echo json_encode(['status' => 'error', 'message' => 'Prepare falló: ' . $conexion->error]);
    exit;
}

// bind_param dinámico
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode([
        'status'  => 'success',
        'message' => 'Datos de la mascota actualizados correctamente.'
    ]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Error al actualizar: ' . $stmt->error]);
}

$stmt->close();
?>