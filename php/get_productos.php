<?php
// php/get_productos.php
// Devuelve todos los productos con stock e imagen
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'conexion.php';

$sql = "SELECT id_producto, nombre, descripcion, precio, stock, imagen, categoria 
        FROM productos 
        ORDER BY categoria, nombre";

$resultado = $conexion->query($sql);

if (!$resultado) {
    http_response_code(500);
    echo json_encode(['error' => $conexion->error]);
    exit;
}

$productos = [];
while ($fila = $resultado->fetch_assoc()) {
    $fila['precio'] = (float) $fila['precio'];
    $fila['stock']  = (int)   $fila['stock'];
    $productos[] = $fila;
}

echo json_encode($productos);
$conexion->close();
?>
