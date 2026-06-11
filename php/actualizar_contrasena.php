<?php
// php/actualizar_contrasena.php
session_start();
include("conexion.php");

header("Content-Type: application/json");

// Verificar que pasó por el flujo correcto
if (empty($_SESSION['reset_verificado']) || empty($_SESSION['reset_correo'])) {
    echo json_encode(["ok" => false, "msg" => "Acceso no autorizado. Inicia el proceso desde el inicio."]);
    exit;
}

$nueva = trim($_POST['nueva_contrasena'] ?? '');
$confirmar = trim($_POST['confirmar_contrasena'] ?? '');

if (empty($nueva) || strlen($nueva) < 6) {
    echo json_encode(["ok" => false, "msg" => "La contraseña debe tener al menos 6 caracteres."]);
    exit;
}

if ($nueva !== $confirmar) {
    echo json_encode(["ok" => false, "msg" => "Las contraseñas no coinciden."]);
    exit;
}

// Actualizar contraseña (usar hash si tu app ya lo hace; aquí se respeta el formato actual)
// NOTA: Si tu app usa hash, reemplaza $nueva por password_hash($nueva, PASSWORD_DEFAULT)
$correo = $_SESSION['reset_correo'];

$stmt = $conexion->prepare("UPDATE PERSONAS SET contrasena = ? WHERE usuario = ?");
$stmt->bind_param("ss", $nueva, $correo);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    // Limpiar sesión de recuperación
    unset($_SESSION['reset_codigo'], $_SESSION['reset_expira'], $_SESSION['reset_correo'], $_SESSION['reset_verificado']);
    echo json_encode(["ok" => true, "msg" => "Contraseña actualizada correctamente. Ya puedes iniciar sesión."]);
} else {
    echo json_encode(["ok" => false, "msg" => "Error al actualizar. Intenta de nuevo."]);
}
?>
