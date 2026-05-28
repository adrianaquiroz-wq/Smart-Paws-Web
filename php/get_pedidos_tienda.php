<?php
// php/get_pedidos_tienda.php
// Devuelve todos los pedidos de la tienda con captura de pago
header('Content-Type: application/json');
session_start();
require_once 'conexion.php';

// Solo veterinarios y admin pueden ver pedidos
// if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'veterinario') {
//     http_response_code(403);
//     echo json_encode(['error' => 'Sin autorización']);
//     exit;
// }

$estado = $_GET['estado'] ?? 'todos';
$limit  = max(1, min(100, (int)($_GET['limit'] ?? 50)));

$where = '';
if ($estado !== 'todos') {
    $estadoSafe = $conexion->real_escape_string($estado);
    $where = "WHERE p.estado_pedido = '$estadoSafe'";
}

$sql = "
    SELECT 
        p.id_pedido,
        p.nro_pedido,
        p.fecha,
        p.total,
        p.estado_pedido AS estado,
        p.captura_base64 AS captura,
        p.carnetDue,
        GROUP_CONCAT(
            JSON_OBJECT(
                'nombre',   pr.nombre,
                'cantidad', pi.cantidad,
                'precio',   pi.precio_unitario
            )
        ) AS items_json
    FROM pedidos_tienda p
    LEFT JOIN pedidos_items pi ON pi.id_pedido = p.id_pedido
    LEFT JOIN productos pr     ON pr.id_producto = pi.id_producto
    $where
    GROUP BY p.id_pedido
    ORDER BY p.fecha DESC
    LIMIT $limit
";

$result = $conexion->query($sql);
$pedidos = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $items = [];
        if (!empty($row['items_json'])) {
            // items_json es una lista de JSON objects separados por coma
            $decoded = json_decode('[' . $row['items_json'] . ']', true);
            $items = is_array($decoded) ? $decoded : [];
        }
        $pedidos[] = [
            'id_compra'   => $row['id_pedido'],
            'nro_pedido'  => $row['nro_pedido'],
            'fecha'       => $row['fecha'],
            'total'       => $row['total'],
            'estado'      => $row['estado'] ?? 'pendiente_verificacion',
            'captura'     => $row['captura'],
            'carnetDue'   => $row['carnetDue'],
            'items'       => $items,
        ];
    }
}

echo json_encode($pedidos);
$conexion->close();
?>
