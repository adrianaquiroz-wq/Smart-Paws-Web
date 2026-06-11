<?php
include("conexion.php");

header('Content-Type: application/json');

// 👇 AQUÍ ESTABA EL ERROR
$id_especie = isset($_GET['id_especie']) ? (int)$_GET['id_especie'] : 0;

$sql = "SELECT id_raza, nombre 
        FROM razas
        WHERE id_especie = $id_especie";

$result = $conexion->query($sql);

$data = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

echo json_encode($data);
?>