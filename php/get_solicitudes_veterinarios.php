<?php
header('Content-Type: application/json; charset=utf-8');
include("conexion.php");

$conexion->query("CREATE TABLE IF NOT EXISTS solicitudes_veterinarios (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    carnetVet INT NOT NULL,
    especialidad VARCHAR(80) DEFAULT NULL,
    matricula VARCHAR(60) DEFAULT NULL,
    estado ENUM('Pendiente','Aprobada','Rechazada') DEFAULT 'Pendiente',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_solicitud_vet (carnetVet)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$sql = "SELECT s.id_solicitud, s.carnetVet, s.especialidad, s.matricula, s.estado,
               s.fecha_solicitud, p.nombre, p.apellido, p.usuario
        FROM solicitudes_veterinarios s
        INNER JOIN personas p ON s.carnetVet = p.carnet
        WHERE s.estado = 'Pendiente'
        ORDER BY s.fecha_solicitud ASC";

$resultado = $conexion->query($sql);
$solicitudes = [];

if ($resultado) {
    while ($fila = $resultado->fetch_assoc()) {
        $solicitudes[] = $fila;
    }
}

echo json_encode($solicitudes);
?>
