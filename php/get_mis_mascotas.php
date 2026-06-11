<?php
// Evitar que cualquier error de PHP se muestre como texto y rompa el JSON
error_reporting(0);
header('Content-Type: application/json');

session_start();
include("conexion.php");

if (!isset($_SESSION['carnet'])) {
    echo json_encode(["error" => "No hay sesion"]);
    exit;
}

$carnet = $_SESSION['carnet'];

// Consulta robusta: Trae mascota y su raza vinculada al cliente
$sql = "SELECT m.id_mascota, m.nombre, r.nombre AS raza, m.foto 
        FROM mascotas m
        INNER JOIN clientes_mascotas cm ON m.id_mascota = cm.id_mascota
        INNER JOIN razas r ON m.id_raza = r.id_raza
        WHERE cm.id_cliente = '$carnet'";

$res = $conexion->query($sql);
$mascotas = [];

if ($res && $res->num_rows > 0) {
    while($fila = $res->fetch_assoc()){
        // Ajuste de ruta de imagen
        if(empty($fila['foto'])) {
            $fila['foto'] = 'img/default.png';
        }
        $mascotas[] = $fila;
    }
}

echo json_encode($mascotas);
?>