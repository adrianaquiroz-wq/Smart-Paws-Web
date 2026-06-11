<?php
include("conexion.php");

// Hacemos un JOIN para traer el nombre desde la tabla personas
$sql = "SELECT v.carnetVet, p.nombre, p.apellido 
        FROM veterinarios v
        INNER JOIN personas p ON v.carnetVet = p.carnet";

$res = $conexion->query($sql);

$vets = [];
if ($res) {
    while($fila = $res->fetch_assoc()){
        $vets[] = $fila;
    }
}

header('Content-Type: application/json');
echo json_encode($vets);
?>