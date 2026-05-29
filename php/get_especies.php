<?php
/*get_especies */
include("conexion.php");

$result = $conexion->query("SELECT id_especie, nombre FROM especies");

$data = [];

while($row = $result->fetch_assoc()){
    $data[] = $row;
}

header('Content-Type: application/json');
echo json_encode($data);
?>