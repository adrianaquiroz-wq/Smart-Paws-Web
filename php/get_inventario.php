<?php
// php/get_inventario.php
// Solo para veterinarios — retorna productos con stock y total de ventas
header('Content-Type: application/json');
session_start();
require_once 'conexion.php';

// Seguridad: solo veterinarios
if (empty($_SESSION['rol']) || $_SESSION['rol'] !== 'veterinario') {
    http_response_code(403);
    echo json_encode(['error' => 'Acceso no autorizado']);
    exit;
}

$sql = "
  SELECT 
    p.id_producto,
    p.nombre,
    p.categoria,
    p.precio,
    p.stock,
    COALESCE(SUM(c.cantidad), 0) AS total_vendido,
    COALESCE(SUM(c.costo), 0)    AS ingresos
  FROM productos p
  LEFT JOIN compras c ON c.id_producto = p.id_producto
  GROUP BY p.id_producto
  ORDER BY p.categoria, p.nombre
";

$res = $conexion->query($sql);
if (!$res) {
    http_response_code(500);
    echo json_encode(['error' => $conexion->error]);
    exit;
}

$inventario = [];
while ($fila = $res->fetch_assoc()) {
    $fila['precio']        = (float) $fila['precio'];
    $fila['stock']         = (int)   $fila['stock'];
    $fila['total_vendido'] = (int)   $fila['total_vendido'];
    $fila['ingresos']      = (float) $fila['ingresos'];
    $inventario[] = $fila;
}

echo json_encode($inventario);
$conexion->close();
?>
