<?php
header('Content-Type: text/plain; charset=utf-8');
include("conexion.php");

$id = (int) ($_POST['id_solicitud'] ?? 0);
$accion = $_POST['accion'] ?? '';

if ($id <= 0 || !in_array($accion, ['aprobar', 'rechazar'])) {
    echo "Solicitud no valida";
    exit;
}

$stmt = $conexion->prepare("SELECT carnetVet, especialidad FROM solicitudes_veterinarios WHERE id_solicitud = ? AND estado = 'Pendiente'");
$stmt->bind_param("i", $id);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo "La solicitud ya fue procesada";
    exit;
}

$solicitud = $res->fetch_assoc();
$carnetVet = (int) $solicitud['carnetVet'];
$especialidad = $solicitud['especialidad'] ?: 'General';

if ($accion === 'aprobar') {
    $stmtVet = $conexion->prepare("INSERT IGNORE INTO veterinarios (carnetVet, especialidad) VALUES (?, ?)");
    $stmtVet->bind_param("is", $carnetVet, $especialidad);
    $stmtVet->execute();

    $estado = "Aprobada";
} else {
    $estado = "Rechazada";
}

$stmtUpdate = $conexion->prepare("UPDATE solicitudes_veterinarios SET estado = ? WHERE id_solicitud = ?");
$stmtUpdate->bind_param("si", $estado, $id);

echo $stmtUpdate->execute() ? "ok" : "Error al actualizar solicitud";
?>
