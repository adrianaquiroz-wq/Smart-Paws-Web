<?php
/* guardar_atencion.php */
session_start();
include 'conexion.php';
header('Content-Type: application/json; charset=utf-8');

$carnetVet = $_SESSION['carnet'] ?? null;
if (!$carnetVet) {
    echo json_encode(['status' => 'error', 'message' => 'Sesión no iniciada.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit;
}

// ── Leer POST ─────────────────────────────────────────────────
$id_cita             = !empty($_POST['id_cita'])             ? (int)$_POST['id_cita']             : null;
$id_mascota          = !empty($_POST['id_mascota'])          ? (int)$_POST['id_mascota']           : null;
$asistente_nombre    = trim($_POST['asistente_nombre']    ?? '');
$asistente_relacion  = trim($_POST['asistente_relacion']  ?? '');
$peso_kg             = !empty($_POST['peso_kg'])             ? (float)$_POST['peso_kg']            : null;
$temperatura         = !empty($_POST['temperatura'])         ? (float)$_POST['temperatura']        : null;
$frecuencia_cardiaca = !empty($_POST['frecuencia_cardiaca']) ? (int)$_POST['frecuencia_cardiaca']  : null;
$diagnostico         = trim($_POST['diagnostico']   ?? '');
$tratamiento         = trim($_POST['tratamiento']   ?? '');
$observaciones       = trim($_POST['observaciones'] ?? '');
$prox_fecha          = !empty($_POST['prox_fecha'])          ? $_POST['prox_fecha']                : null;
$tipo_atencion       = trim($_POST['tipo_atencion'] ?? 'Consulta');
$hora_inicio         = trim($_POST['hora_inicio']   ?? date('H:i'));
$hora_fin            = trim($_POST['hora_fin']       ?? date('H:i'));
$fecha_hoy           = date('Y-m-d');

// ── Validar obligatorios ──────────────────────────────────────
if (!$id_mascota || empty($diagnostico) || empty($tratamiento)) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan campos obligatorios.']);
    exit;
}

// ── Insertar ──────────────────────────────────────────────────
// 16 parámetros: i i s s s i s s d d i s s s s s
$sql = "INSERT INTO atenciones 
            (id_cita, id_mascota, fecha, diagnostico, prox_fecha, carnetVet,
             asistente_nombre, asistente_relacion, peso_kg, temperatura,
             frecuencia_cardiaca, tratamiento, observaciones,
             tipo_atencion, hora_inicio, hora_fin)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conexion->prepare($sql);
if (!$stmt) {
    echo json_encode(['status' => 'error', 'message' => 'Prepare falló: ' . $conexion->error]);
    exit;
}

$stmt->bind_param(
    "iisssissddiissss",
    $id_cita,
    $id_mascota,
    $fecha_hoy,
    $diagnostico,
    $prox_fecha,
    $carnetVet,
    $asistente_nombre,
    $asistente_relacion,
    $peso_kg,
    $temperatura,
    $frecuencia_cardiaca,
    $tratamiento,
    $observaciones,
    $tipo_atencion,
    $hora_inicio,
    $hora_fin
);

if (!$stmt->execute()) {
    echo json_encode(['status' => 'error', 'message' => 'Error al insertar: ' . $stmt->error]);
    exit;
}
$stmt->close();

// ── Marcar cita como Atendida ─────────────────────────────────
if ($id_cita) {
    $stmtCita = $conexion->prepare("UPDATE citas SET estado = 'Atendida' WHERE id_cita = ?");
    if ($stmtCita) {
        $stmtCita->bind_param("i", $id_cita);
        $stmtCita->execute();
        $stmtCita->close();
    }
}

echo json_encode(['status' => 'success', 'message' => 'Atención registrada correctamente.']);
?>