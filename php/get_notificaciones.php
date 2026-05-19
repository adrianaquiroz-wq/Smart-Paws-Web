<?php
// php/get_notificaciones.php
session_start();
include 'conexion.php';
header('Content-Type: application/json');

$carnet_vet = $_SESSION['carnet'] ?? null;

// Si no hay sesión de veterinario, respondemos vacío de forma segura
if (!$carnet_vet) {
    echo json_encode(["success" => false, "data" => [], "message" => "Sesión no válida."]);
    exit;
}

try {
    // Consulta para traer las citas canceladas asignadas a ESTE veterinario
    // Cruzamos datos con la tabla mascotas y personas (para el nombre del dueño)
    $sql = "SELECT 
                c.id_cita, 
                c.fecha, 
                c.hora, 
                c.motivo, 
                m.nombre AS mascota, 
                p.nombre AS dueno
            FROM citas c
            INNER JOIN mascotas m ON c.id_mascota = m.id_mascota
            INNER JOIN personas p ON c.carnetDue = p.carnet
            WHERE c.estado = 'Cancelada' 
              AND c.carnetVet = ?
            ORDER BY c.fecha DESC, c.hora DESC 
            LIMIT 10"; // Limitamos a las últimas 10 para no saturar el panel

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $carnet_vet);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $notificaciones = [];
    while ($fila = $resultado->fetch_assoc()) {
        $notificaciones[] = [
            "id_cita" => $fila['id_cita'],
            "fecha"   => $fila['fecha'],
            "hora"    => $fila['hora'],
            "motivo"  => $fila['motivo'],
            "mascota" => $fila['mascota'],
            "dueno"   => $fila['dueno']
        ];
    }

    // Retornamos la estructura exacta que tu JS espera de forma síncrona
    echo json_encode([
        "success" => true,
        "data"    => $notificaciones
    ]);

    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "data"    => [],
        "message" => "Error en el servidor: " . $e->getMessage()
    ]);
}

$conexion->close();
?>