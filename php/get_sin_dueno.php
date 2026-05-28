<?php
// php/get_sin_dueno.php
// Devuelve mascotas con estado = 'sin_dueno' junto con su última atención registrada.
session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once 'conexion.php';

$sql = "
    SELECT
        m.id_mascota,
        m.nombre           AS nombre_mascota,
        m.descripcion,
        m.peso             AS peso_kg,
        m.foto,
        e.nombre           AS especie,
        r.nombre           AS raza,
        a.id_atencion,
        a.fecha            AS fecha_atencion,
        a.diagnostico,
        a.hora_inicio,
        a.tipo_atencion
    FROM mascotas m
    LEFT JOIN razas   r ON r.id_raza   = m.id_raza
    LEFT JOIN especies e ON e.id_especie = r.id_especie
    LEFT JOIN atenciones a ON a.id_atencion = (
        SELECT id_atencion FROM atenciones
        WHERE id_mascota = m.id_mascota
        ORDER BY fecha DESC, hora_inicio DESC
        LIMIT 1
    )
    WHERE m.estado = 'sin_dueno'
    ORDER BY a.fecha DESC, a.hora_inicio DESC
";

$result = $conexion->query($sql);

if (!$result) {
    echo json_encode(['status' => 'error', 'message' => $conexion->error]);
    exit;
}

$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}

echo json_encode($rows);
?>