<?php
// php/guardar_compra.php — v2 con captura + pedidos_tienda
header('Content-Type: application/json');
session_start();
require_once 'conexion.php';

$body = json_decode(file_get_contents('php://input'), true);
if (!$body || empty($body['items'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Sin items']);
    exit;
}

$carnetDue  = $_SESSION['carnet'] ?? null;
$fecha      = date('Y-m-d H:i:s');
$nroPedido  = $body['nro_pedido'] ?? ('SP-' . time());
$capturaB64 = $body['captura'] ?? null;   // data:image/...;base64,...
$total      = 0;

foreach ($body['items'] as $item) {
    $total += (float)$item['costo'];
}

$conexion->begin_transaction();

try {
    // 1. Intentar insertar en tabla pedidos_tienda (nueva tabla con captura)
    $tableCheck = $conexion->query("SHOW TABLES LIKE 'pedidos_tienda'");
    if ($tableCheck->num_rows === 0) {
        // Crear tabla si no existe
        $conexion->query("
            CREATE TABLE pedidos_tienda (
                id_pedido       INT AUTO_INCREMENT PRIMARY KEY,
                nro_pedido      VARCHAR(30) UNIQUE,
                fecha           DATETIME,
                total           DECIMAL(10,2),
                estado_pedido   VARCHAR(40) DEFAULT 'pendiente_verificacion',
                captura_base64  LONGTEXT,
                carnetDue       VARCHAR(20),
                INDEX(estado_pedido),
                INDEX(fecha)
            )
        ");
        $conexion->query("
            CREATE TABLE IF NOT EXISTS pedidos_items (
                id_item         INT AUTO_INCREMENT PRIMARY KEY,
                id_pedido       INT,
                id_producto     INT,
                cantidad        INT,
                precio_unitario DECIMAL(10,2),
                FOREIGN KEY(id_pedido) REFERENCES pedidos_tienda(id_pedido)
            )
        ");
    }

    // 2. Insertar cabecera del pedido
    $stmtPedido = $conexion->prepare(
        "INSERT INTO pedidos_tienda (nro_pedido, fecha, total, captura_base64, carnetDue)
         VALUES (?, ?, ?, ?, ?)"
    );
    $stmtPedido->bind_param('ssdss', $nroPedido, $fecha, $total, $capturaB64, $carnetDue);
    $stmtPedido->execute();
    $idPedido = $conexion->insert_id;

    // 3. Insertar items del pedido
    $stmtItem = $conexion->prepare(
        "INSERT INTO pedidos_items (id_pedido, id_producto, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)"
    );
    // 4. Descontar stock
    $stmtStock = $conexion->prepare(
        "UPDATE productos SET stock = stock - ? WHERE id_producto = ? AND stock >= ?"
    );
    // 5. Registrar en tabla compras (tabla original, compatibilidad)
    $stmtCompra = $conexion->prepare(
        "INSERT INTO compras (id_producto, cantidad, fecha, costo, carnetDue)
         VALUES (?, ?, ?, ?, ?)"
    );

    foreach ($body['items'] as $item) {
        $id    = (int)   $item['id_producto'];
        $cant  = (int)   $item['cantidad'];
        $costo = (float) $item['costo'];
        $precioUnit = $cant > 0 ? ($costo / $cant) : $costo;

        // Item del pedido
        $stmtItem->bind_param('iiid', $idPedido, $id, $cant, $precioUnit);
        $stmtItem->execute();

        // Stock
        $stmtStock->bind_param('iii', $cant, $id, $cant);
        $stmtStock->execute();
        if ($stmtStock->affected_rows === 0) {
            throw new Exception("Stock insuficiente para producto $id");
        }

        // Tabla compras original
        $fechaSimple = date('Y-m-d');
        $stmtCompra->bind_param('iiidi', $id, $cant, $fechaSimple, $costo, $carnetDue);
        $stmtCompra->execute();
    }

    $conexion->commit();
    echo json_encode(['ok' => true, 'nro_pedido' => $nroPedido, 'id_pedido' => $idPedido]);

} catch (Exception $e) {
    $conexion->rollback();
    http_response_code(409);
    echo json_encode(['error' => $e->getMessage()]);
}

$conexion->close();
?>
