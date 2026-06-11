<?php
/* php/get_mascotas.php */
// Devuelve mascotas activas con sus datos para el buscador de atención directa.
// Solo mascotas con estado = 'activo' (excluye sin_dueno).
// Acepta parámetro opcional ?q= para filtrar por nombre.
include("conexion.php");

header('Content-Type: application/json');

$q = trim($_GET['q'] ?? '');

$sql = "
    SELECT
        m.id_mascota,
        m.nombre,
        m.foto,
        m.fecha_nacimiento,
        COALESCE(e.nombre, '--')  AS especie,
        COALESCE(r.nombre, 'Sin raza') AS raza,
        CONCAT(COALESCE(p.nombre,''), ' ', COALESCE(p.apellido,'')) AS nombre_dueno
    FROM mascotas m
    LEFT JOIN razas            r  ON m.id_raza    = r.id_raza
    LEFT JOIN especies         e  ON r.id_especie = e.id_especie
    LEFT JOIN clientes_mascotas cm ON cm.id_mascota = m.id_mascota AND cm.fecha_fin IS NULL
    LEFT JOIN personas         p  ON cm.id_cliente  = p.carnet
    WHERE m.estado = 'activo'
";

if ($q !== '') {
    $qEsc = $conexion->real_escape_string($q);
    $sql .= " AND m.nombre LIKE '%$qEsc%'";
}

$sql .= " ORDER BY m.nombre ASC";

$result = $conexion->query($sql);

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>