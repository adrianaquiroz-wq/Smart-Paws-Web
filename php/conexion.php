<?php
/* conexion.php */
date_default_timezone_set('America/La_Paz');

$conexion = new mysqli("localhost", "root", "", "veterinaria");

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$conexion->query("SET time_zone = '-04:00'");
$conexion->set_charset("utf8mb4");
?>