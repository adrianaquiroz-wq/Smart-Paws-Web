<?php
/* marcar_ausente.php */
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

$id_cita = !empty($_POST['id_cita']) ? (int)$_POST['id_cita'] : null;

if (!$id_cita) {
    echo json_encode(['status' => 'error', 'message' => 'ID de cita no válido.']);
    exit;
}

// El enum de citas es: 'Pendiente','Confirmada','Cancelada','Atendida'
// Usamos 'Cancelada' para ausente (no hay valor Ausente en el enum)
$sql = "UPDATE citas SET estado = 'Cancelada' WHERE id_cita = ? AND carnetVet = ?";
$stmt = $conexion->prepare($sql);
if (!$stmt) {
    echo json_encode(['status' => 'error', 'message' => 'Error prepare: ' . $conexion->error]);
    exit;
}

$stmt->bind_param("ii", $id_cita, $carnetVet);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['status' => 'success', 'message' => 'Paciente marcado como ausente.']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'No se encontró la cita o no tiene permiso.']);
}

$stmt->close();
?>