<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'conexion.php';

$sql = "SELECT id_producto, nombre, precio, stock, categoria
        FROM productos
        ORDER BY stock DESC, nombre ASC
        LIMIT 8";

$resultado = $conexion->query($sql);
$productos = [];

if ($resultado) {
    while ($fila = $resultado->fetch_assoc()) {
        $fila['precio'] = (float) $fila['precio'];
        $fila['stock'] = (int) $fila['stock'];
        $productos[] = $fila;
    }
}

echo json_encode($productos);
?>
