<?php
//get_dashboard_stats.php
session_start();
include 'conexion.php';
header('Content-Type: application/json');

$hoy = date('Y-m-d');
$carnet_vet = $_SESSION['carnet'] ?? null;

if (!$carnet_vet) {
    echo json_encode(["mascotas_hoy" => 0, "citas_pendientes" => 0, "total_clientes" => 0, "total_animales" => 0, "proxima_cita" => "--:--"]);
    exit;
}

// 1. Mascotas hoy (Filtrado por carnetVet)
$resMascotas = mysqli_query($conexion, "SELECT COUNT(DISTINCT id_mascota) as total FROM citas WHERE fecha = '$hoy' AND carnetVet = '$carnet_vet'");
$mascotasHoy = mysqli_fetch_assoc($resMascotas)['total'] ?? 0;

// 2. Citas pendientes (Filtrado por carnetVet)
$resCitas = mysqli_query($conexion, "SELECT COUNT(*) as total FROM citas WHERE estado = 'Pendiente' AND carnetVet = '$carnet_vet'"); 
$citasPendientes = mysqli_fetch_assoc($resCitas)['total'] ?? 0;

// 3. Total clientes (Global)
$resClientes = mysqli_query($conexion, "SELECT COUNT(*) as total FROM clientes");
$totalClientes = mysqli_fetch_assoc($resClientes)['total'] ?? 0;

// 4. NUEVO: Total de mascotas registradas en Smart Paws
$resTotalMascotas = mysqli_query($conexion, "SELECT COUNT(*) as total FROM mascotas");
$totalMascotasReg = mysqli_fetch_assoc($resTotalMascotas)['total'] ?? 0;

// 5. Próxima cita del día
$resProxima = mysqli_query($conexion, "SELECT hora FROM citas WHERE fecha = '$hoy' AND estado = 'Pendiente' AND carnetVet = '$carnet_vet' ORDER BY hora ASC LIMIT 1");
$proximaFila = mysqli_fetch_assoc($resProxima);
$proxima = $proximaFila ? date("H:i", strtotime($proximaFila['hora'])) : "--:--";

echo json_encode([
    "mascotas_hoy" => (int)$mascotasHoy,
    "citas_pendientes" => (int)$citasPendientes,
    "total_clientes" => (int)$totalClientes,
    "total_animales" => (int)$totalMascotasReg, // Aquí mandamos el total de mascotas    
    "proxima_cita" => $proxima
]);
?>