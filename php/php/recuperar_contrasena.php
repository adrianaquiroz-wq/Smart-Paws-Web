<?php
// php/recuperar_contrasena.php
session_start();
include("conexion.php");

header("Content-Type: application/json");

if (empty($_POST['captcha_ok'])) {
    echo json_encode(["ok" => false, "msg" => "Completa la verificación."]);
    exit;
}

$correo = trim($_POST['correo'] ?? '');

if (empty($correo)) {
    echo json_encode(["ok" => false, "msg" => "Ingresa un correo."]);
    exit;
}

$stmt = $conexion->prepare("SELECT carnet, nombre FROM PERSONAS WHERE usuario = ?");
$stmt->bind_param("s", $correo);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["ok" => false, "msg" => "No existe una cuenta con ese correo."]);
    exit;
}

$persona = $res->fetch_assoc();

$codigo    = str_pad(random_int(0, 999999), 6, "0", STR_PAD_LEFT);
$expira_en = time() + (15 * 60);

$_SESSION['reset_correo'] = $correo;
$_SESSION['reset_codigo']  = $codigo;
$_SESSION['reset_expira']  = $expira_en;

$phpmailer_path = __DIR__ . "/PHPMailer/src/";

if (!file_exists($phpmailer_path . "PHPMailer.php")) {
    echo json_encode(["ok" => true, "msg" => "PHPMailer no instalado", "dev_codigo" => $codigo]);
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
    $mail->Username   = "luz.perez@ucb.edu.bo";  // ← tu Gmail
    $mail->Password   = "dvwh yvdc plrs bvbx";       // ← App Password sin espacios
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

    $mail->setFrom("TU_CORREO@gmail.com", "Smart Paws");  // ← tu Gmail
    $mail->addAddress($correo, $persona['nombre']);
    $mail->isHTML(true);
    $mail->Subject = "🐾 Código de recuperación — Smart Paws";
    $mail->Body    = "
    <div style='font-family:sans-serif;max-width:480px;margin:auto;padding:30px;border:1px solid #e0e0e0;border-radius:12px;'>
        <h2 style='color:#1a6b3c;margin-bottom:4px;'>Smart Paws</h2>
        <p style='color:#555;'>Hola, <strong>{$persona['nombre']}</strong>.</p>
        <p style='color:#555;'>Recibimos una solicitud para restablecer tu contraseña.</p>
        <div style='text-align:center;margin:28px 0;'>
            <span style='font-size:2.5rem;font-weight:800;letter-spacing:12px;color:#1a6b3c;background:#f0faf5;padding:16px 28px;border-radius:10px;display:inline-block;'>{$codigo}</span>
        </div>
        <p style='color:#555;font-size:.9rem;'>Este código expira en <strong>15 minutos</strong>.</p>
        <p style='color:#aaa;font-size:.8rem;'>Si no solicitaste esto, ignora este correo.</p>
    </div>";

    $mail->send();
    echo json_encode(["ok" => true, "msg" => "Código enviado a {$correo}. Revisa tu bandeja."]);

} catch (Exception $e) {
    echo json_encode(["ok" => false, "msg" => "Error al enviar correo: " . $mail->ErrorInfo]);
}
?>
