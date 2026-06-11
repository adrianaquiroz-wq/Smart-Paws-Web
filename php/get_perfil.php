<?php
//get_perfil.php
session_start();
include("conexion.php");

if(isset($_SESSION['carnet'])){
    $carnet = $_SESSION['carnet'];
    $res = $conexion->query("SELECT nombre, apellido FROM PERSONAS WHERE carnet = '$carnet'");
    echo json_encode($res->fetch_assoc());
} else {
    echo json_encode(["error" => "No session"]);
}
?>