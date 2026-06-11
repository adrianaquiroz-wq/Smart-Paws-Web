<?php
/* php/obtener_historial.php */
session_start();
include 'conexion.php';
header('Content-Type: application/json; charset=utf-8');

// Opcional: Verificar si el veterinario está logueado para ver historiales
if (!isset($_SESSION['carnet'])) {
    echo json_encode(['status' => 'error', 'message' => 'Sesión no iniciada.']);
    exit;
}

$id_mascota = !empty($_GET['id']) ? (int)$_GET['id'] : null;

if (!$id_mascota) {
    echo json_encode(['status' => 'error', 'message' => 'ID de mascota no proporcionado.']);
    exit;
}

try {
    // =========================================================================
    // 1. OBTENER DATOS DE LA MASCOTA Y SU DUEÑO ACTUAL
    // =========================================================================
    $sqlMascota = "SELECT m.id_mascota, m.nombre AS mascota_nombre, m.fecha_nacimiento, 
                          m.peso AS peso_inicial, m.tamano, m.descripcion, m.alergias, m.foto, m.estado,
                          e.nombre AS especie, r.nombre AS raza, c.nombre AS color
                   FROM mascotas m
                   LEFT JOIN razas r ON m.id_raza = r.id_raza
                   LEFT JOIN especies e ON r.id_especie = e.id_especie
                   LEFT JOIN colores c ON m.id_color = c.id_color
                   WHERE m.id_mascota = ?";
                   
    $stmtM = $conexion->prepare($sqlMascota);
    $stmtM->bind_param("i", $id_mascota);
    $stmtM->execute();
    $resMascota = $stmtM->get_result()->fetch_assoc();
    $stmtM->close();

    if (!$resMascota) {
        echo json_encode(['status' => 'error', 'message' => 'La mascota no existe.']);
        exit;
    }

    // Buscar al dueño en la tabla intermedia 'clientes_mascotas' (donde fecha_fin IS NULL)
    $sqlDueno = "SELECT p.carnet, p.nombre, p.apellido, p.celular, p.direccion, p.usuario 
                 FROM clientes_mascotas cm
                 INNER JOIN personas p ON cm.id_cliente = p.carnet
                 WHERE cm.id_mascota = ? AND cm.fecha_fin IS NULL 
                 LIMIT 1";
                 
    $stmtD = $conexion->prepare($sqlDueno);
    $stmtD->bind_param("i", $id_mascota);
    $stmtD->execute();
    $resDueno = $stmtD->get_result()->fetch_assoc();
    $stmtD->close();

    // =========================================================================
    // 2. OBTENER TODAS LAS ATENCIONES (HISTORIAL CLÍNICO)
    // =========================================================================
    $sqlAtenciones = "SELECT a.id_atencion, a.fecha, a.hora_inicio, a.hora_fin, a.tipo_atencion, 
                             a.diagnostico, a.tratamiento, a.observaciones, a.prox_fecha,
                             a.peso_kg, a.temperatura, a.frecuencia_cardiaca,
                             a.asistente_nombre, a.asistente_relacion,
                             p.nombre AS vet_nombre, p.apellido AS vet_apellido
                      FROM atenciones a
                      INNER JOIN personas p ON a.carnetVet = p.carnet
                      WHERE a.id_mascota = ?
                      ORDER BY a.fecha DESC, a.hora_inicio DESC";
                      
    $stmtA = $conexion->prepare($sqlAtenciones);
    $stmtA->bind_param("i", $id_mascota);
    $stmtA->execute();
    $resultAten = $stmtA->get_result();
    
    $atenciones = [];
    while ($row = $resultAten->fetch_assoc()) {
        $atenciones[] = $row;
    }
    $stmtA->close();

    // =========================================================================
    // 3. RETORNAR EL RETROPAQUETE COMPLETO
    // =========================================================================
    echo json_encode([
        'status' => 'success',
        'mascota' => $resMascota,
        'dueno' => $resDueno ? $resDueno : ['mensaje' => 'Sin dueño registrado o de la calle'],
        'historial' => $atenciones
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al obtener el historial: ' . $e->getMessage()
    ]);
}
?>