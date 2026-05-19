<?php
// php/get_horas_ocupadas.php
session_start();
include("conexion.php");
header('Content-Type: application/json');

// Obtenemos los parámetros enviados por el Fetch
$carnetVet = $_GET['carnetVet'] ?? null;
$fecha = $_GET['fecha'] ?? null;

// Si faltan datos obligatorios, respondemos con una lista vacía por seguridad
if (!$carnetVet || !$fecha) {
    echo json_encode([]);
    exit;
}

// Consultamos las horas de las citas activas para ese médico y ese día específico
$sql = "SELECT hora FROM citas 
        WHERE carnetVet = '$carnetVet' 
          AND fecha = '$fecha' 
          AND estado = 'Pendiente'";

$res = $conexion->query($sql);
$horasOcupadas = [];

if ($res) {
    while ($fila = $res->fetch_assoc()) {
        // Formateamos de HH:MM:SS a HH:MM (ejemplo: \"09:30:00\" pasa a \"09:30\")
        $horaFormateada = date("H:i", strtotime($fila['hora']));
        $horasOcupadas[] = $horaFormateada;
    }
}

// Retorna un array plano como: ["08:30", "14:00"]
echo json_encode($horasOcupadas);
?>