<?php
/* php/buscar_dueno.php */
// Busca mascotas por CI del dueño.
// LEFT JOIN a razas para que mascotas sin raza (id_raza NULL) igual aparezcan.
include("conexion.php");

if (!isset($_GET['ci'])) {
    echo json_encode([]);
    exit;
}

$ci = (int) $_GET['ci'];

$sql = "
    SELECT
        m.id_mascota,
        m.nombre,
        m.foto,
        COALESCE(r.nombre, 'Sin raza') AS raza
    FROM clientes_mascotas cm
    INNER JOIN mascotas m  ON cm.id_mascota = m.id_mascota
    LEFT  JOIN razas    r  ON m.id_raza     = r.id_raza
    WHERE cm.id_cliente  = ?
      AND cm.fecha_fin  IS NULL
";

$st = $conexion->prepare($sql);
$st->bind_param("i", $ci);
$st->execute();
$result = $st->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

$st->close();
echo json_encode($data);
?>