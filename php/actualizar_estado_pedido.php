<?php
// php/actualizar_estado_pedido.php
header('Content-Type: application/json');
session_start();
require_once 'conexion.php';

$body = json_decode(file_get_contents('php://input'), true);
if (!$body || empty($body['nro_pedido']) || empty($body['estado'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

$nroPedido   = $conexion->real_escape_string($body['nro_pedido']);
$nuevoEstado = $conexion->real_escape_string($body['estado']);

$estados_validos = ['pendiente_verificacion', 'verificado', 'entregado', 'cancelado'];
if (!in_array($nuevoEstado, $estados_validos)) {
    http_response_code(400);
    echo json_encode(['error' => 'Estado inválido']);
    exit;
}

// ── Actualizar estado ──────────────────────────────────────────────────────
$stmt = $conexion->prepare("UPDATE pedidos_tienda SET estado_pedido = ? WHERE nro_pedido = ?");
$stmt->bind_param('ss', $nuevoEstado, $nroPedido);
$stmt->execute();

// ── Solo enviar correo en estados importantes ──────────────────────────────
if (!in_array($nuevoEstado, ['verificado', 'entregado', 'cancelado'])) {
    echo json_encode(['ok' => true]);
    exit;
}

// ── Obtener datos del pedido + cliente ────────────────────────────────────
$stmt2 = $conexion->prepare("
    SELECT pt.nro_pedido, pt.fecha, pt.total, pt.carnetDue,
           p.nombre, p.usuario AS correo
    FROM pedidos_tienda pt
    LEFT JOIN personas p ON p.carnet = pt.carnetDue
    WHERE pt.nro_pedido = ?
");
$stmt2->bind_param('s', $nroPedido);
$stmt2->execute();
$pedido = $stmt2->get_result()->fetch_assoc();

// ── Obtener items del pedido ───────────────────────────────────────────────
$stmt3 = $conexion->prepare("
    SELECT pr.nombre, pi.cantidad, pi.precio_unitario,
           (pi.cantidad * pi.precio_unitario) AS subtotal
    FROM pedidos_items pi
    JOIN productos pr ON pr.id_producto = pi.id_producto
    WHERE pi.id_pedido = (SELECT id_pedido FROM pedidos_tienda WHERE nro_pedido = ?)
");
$stmt3->bind_param('s', $nroPedido);
$stmt3->execute();
$items = $stmt3->get_result()->fetch_all(MYSQLI_ASSOC);

if (!$pedido || empty($pedido['correo'])) {
    echo json_encode(['ok' => true, 'correo' => 'sin correo']);
    exit;
}

// ── Definir contenido según estado ────────────────────────────────────────
$emojis  = ['verificado' => '✅', 'entregado' => '📦', 'cancelado' => '❌'];
$titulos = [
    'verificado' => '¡Tu pedido fue confirmado!',
    'entregado'  => '¡Tu pedido fue entregado!',
    'cancelado'  => 'Tu pedido fue cancelado',
];
$mensajes = [
    'verificado' => 'Hemos verificado tu comprobante de pago. Nos contactaremos contigo para coordinar la entrega.',
    'entregado'  => '¡Tu pedido ha sido entregado exitosamente! Gracias por confiar en Smart Paws 🐾',
    'cancelado'  => 'Lamentablemente tu pedido fue cancelado. Si tienes dudas, contáctanos.',
];
$colores = ['verificado' => '#1a6b3c', 'entregado' => '#0d6efd', 'cancelado' => '#dc3545'];

$emoji   = $emojis[$nuevoEstado];
$titulo  = $titulos[$nuevoEstado];
$mensaje = $mensajes[$nuevoEstado];
$color   = $colores[$nuevoEstado];

// ── Construir tabla de items ───────────────────────────────────────────────
$tabla_items = '';
foreach ($items as $item) {
    $tabla_items .= "
    <tr>
        <td style='padding:6px 0;border-bottom:1px solid #eee;'>{$item['nombre']}</td>
        <td style='padding:6px 0;border-bottom:1px solid #eee;text-align:center;'>{$item['cantidad']}</td>
        <td style='padding:6px 0;border-bottom:1px solid #eee;text-align:right;'>Bs. " . number_format($item['subtotal'], 2) . "</td>
    </tr>";
}

$fecha_formato = date('d/m/Y H:i', strtotime($pedido['fecha']));

// ── Enviar correo con PHPMailer ────────────────────────────────────────────
$phpmailer_path = __DIR__ . "/PHPMailer/src/";
if (!file_exists($phpmailer_path . "PHPMailer.php")) {
    echo json_encode(['ok' => true, 'correo' => 'PHPMailer no instalado']);
    exit;
}

require $phpmailer_path . "Exception.php";
require $phpmailer_path . "PHPMailer.php";
require $phpmailer_path . "SMTP.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = "smtp.gmail.com";
    $mail->SMTPAuth   = true;
    $mail->Username   = "luz.perez@ucb.edu.bo"; // ← tu correo
    $mail->Password   = "dvwh yvdc plrs bvbx";      // ← app password sin espacios
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->CharSet    = "UTF-8";
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer'       => false,
            'verify_peer_name'  => false,
            'allow_self_signed' => true,
        ]
    ];

    $mail->setFrom("luz.perez@ucb.edu.bo", "Smart Paws");
    $mail->addAddress($pedido['correo'], $pedido['nombre']);
    $mail->isHTML(true);
    $mail->Subject = "{$emoji} {$titulo} — Smart Paws";
    $mail->Body    = "
    <div style='font-family:sans-serif;max-width:520px;margin:auto;padding:30px;border:1px solid #e0e0e0;border-radius:12px;'>
        <div style='border-left:5px solid {$color};padding-left:14px;margin-bottom:20px;'>
            <h2 style='color:{$color};margin:0;'>{$emoji} {$titulo}</h2>
        </div>
        <p style='color:#555;'>Hola, <strong>{$pedido['nombre']}</strong>.</p>
        <p style='color:#555;'>{$mensaje}</p>
        <div style='background:#f8f8f8;border-radius:8px;padding:16px;margin:20px 0;'>
            <div style='display:flex;justify-content:space-between;margin-bottom:10px;'>
                <span style='color:#888;font-size:.85rem;'>Pedido #</span>
                <strong style='color:#1a6b3c;'>{$pedido['nro_pedido']}</strong>
            </div>
            <div style='display:flex;justify-content:space-between;margin-bottom:14px;'>
                <span style='color:#888;font-size:.85rem;'>Fecha</span>
                <span>{$fecha_formato}</span>
            </div>
            <table style='width:100%;border-collapse:collapse;font-size:.88rem;'>
                <thead>
                    <tr style='color:#888;font-size:.78rem;'>
                        <th style='text-align:left;padding-bottom:6px;'>Producto</th>
                        <th style='text-align:center;padding-bottom:6px;'>Cant.</th>
                        <th style='text-align:right;padding-bottom:6px;'>Subtotal</th>
                    </tr>
                </thead>
                <tbody>{$tabla_items}</tbody>
            </table>
            <div style='display:flex;justify-content:space-between;padding-top:10px;border-top:2px solid #ddd;margin-top:8px;font-weight:700;font-size:1rem;'>
                <span>TOTAL</span>
                <span style='color:{$color};'>Bs. " . number_format($pedido['total'], 2) . "</span>
            </div>
        </div>
        <p style='color:#aaa;font-size:.78rem;text-align:center;'>Smart Paws · Veterinaria Digital · La Paz, Bolivia 🐾</p>
    </div>";

    $mail->send();
    echo json_encode(['ok' => true, 'correo' => 'enviado a ' . $pedido['correo']]);

} catch (Exception $e) {
    echo json_encode(['ok' => true, 'correo_error' => $mail->ErrorInfo]);
}
$conexion->close();
?>
