<?php
// php/actualizar_stock.php
// Solo veterinarios — actualiza el stock de un producto
header('Content-Type: application/json');
session_start();
require_once 'conexion.php';

if (empty($_SESSION['rol']) || $_SESSION['rol'] !== 'veterinario') {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso no autorizado']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);

if (!isset($body['id_producto'], $body['stock'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

$id    = (int)   $body['id_producto'];
$stock = (int)   $body['stock'];

if ($stock < 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Stock no puede ser negativo']);
    exit;
}

$stmt = $conexion->prepare("UPDATE productos SET stock = ? WHERE id_producto = ?");
$stmt->bind_param('ii', $stock, $id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(['ok' => true, 'stock' => $stock]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Producto no encontrado']);
}

$conexion->close();
?>
