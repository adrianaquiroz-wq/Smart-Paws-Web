<?php
/*get_mascotas.php */
include("conexion.php");

header('Content-Type: application/json');

$sql = "SELECT 
            m.id_mascota,
            m.nombre,
            m.foto,
            r.nombre AS raza
        FROM mascotas m
        LEFT JOIN razas r ON m.id_raza = r.id_raza";

$result = $conexion->query($sql);

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>