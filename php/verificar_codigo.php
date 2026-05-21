<?php
// php/verificar_codigo.php
session_start();
header("Content-Type: application/json");

$codigo_ingresado = trim($_POST['codigo'] ?? '');

if (empty($codigo_ingresado)) {
    echo json_encode(["ok" => false, "msg" => "Ingresa el código."]);
    exit;
}

if (empty($_SESSION['reset_codigo']) || empty($_SESSION['reset_expira'])) {
    echo json_encode(["ok" => false, "msg" => "Sesión expirada. Solicita el código de nuevo."]);
    exit;
}

// Verificar expiración
if ($_SESSION['reset_expira'] < time()) {
    unset($_SESSION['reset_codigo'], $_SESSION['reset_expira'], $_SESSION['reset_correo']);
    echo json_encode(["ok" => false, "msg" => "El código expiró. Solicita uno nuevo."]);
    exit;
}

// Verificar coincidencia
if ($codigo_ingresado !== $_SESSION['reset_codigo']) {
    echo json_encode(["ok" => false, "msg" => "Código incorrecto. Inténtalo de nuevo."]);
    exit;
}

// Marcar como verificado
$_SESSION['reset_verificado'] = true;

echo json_encode(["ok" => true, "msg" => "Código correcto."]);
?>
