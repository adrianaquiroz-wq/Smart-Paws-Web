<?php
include("conexion.php");

$conexion->query("CREATE TABLE IF NOT EXISTS solicitudes_veterinarios (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    carnetVet INT NOT NULL,
    especialidad VARCHAR(80) DEFAULT NULL,
    matricula VARCHAR(60) DEFAULT NULL,
    estado ENUM('Pendiente','Aprobada','Rechazada') DEFAULT 'Pendiente',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_solicitud_vet (carnetVet)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

$carnet = (int) ($_POST['carnet'] ?? 0);
$nombre = trim($_POST['nombre'] ?? '');
$apellido = trim($_POST['apellido'] ?? '');
$correo = trim($_POST['correo'] ?? '');
$password = $_POST['password'] ?? '';
$rol = $_POST['rol'] ?? '';
$celular = trim($_POST['celular'] ?? '');
$direccion = trim($_POST['direccion'] ?? '');
$especialidad = trim($_POST['especialidad'] ?? '');
$matricula = trim($_POST['matricula'] ?? '');

if ($carnet <= 0 || $nombre === '' || $apellido === '' || $correo === '' || $password === '') {
    echo "Completa los campos obligatorios";
    exit;
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    echo "Correo electronico no valido";
    exit;
}

if ($rol !== "cliente" && $rol !== "veterinario") {
    echo "Tipo de cuenta no valido";
    exit;
}

if ($rol === "veterinario" && ($especialidad === '' || $matricula === '')) {
    echo "Completa la especialidad y matricula profesional";
    exit;
}

$stmtCheck = $conexion->prepare("SELECT carnet FROM personas WHERE carnet = ? OR usuario = ?");
$stmtCheck->bind_param("is", $carnet, $correo);
$stmtCheck->execute();
$check = $stmtCheck->get_result();

if ($check->num_rows > 0) {
    echo "El usuario ya existe";
    exit;
}

$stmtPersona = $conexion->prepare("
    INSERT INTO personas (carnet, nombre, apellido, celular, direccion, usuario, contrasena)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");
$stmtPersona->bind_param("issssss", $carnet, $nombre, $apellido, $celular, $direccion, $correo, $password);

if (!$stmtPersona->execute()) {
    echo "Error al registrar";
    exit;
}

if ($rol === "cliente") {
    $stmtCliente = $conexion->prepare("INSERT INTO clientes (carnetDue) VALUES (?)");
    $stmtCliente->bind_param("i", $carnet);
    echo $stmtCliente->execute() ? "ok" : "Error al asignar rol cliente";
    exit;
}

$stmtSolicitud = $conexion->prepare("
    INSERT INTO solicitudes_veterinarios (carnetVet, especialidad, matricula, estado)
    VALUES (?, ?, ?, 'Pendiente')
");
$stmtSolicitud->bind_param("iss", $carnet, $especialidad, $matricula);

echo $stmtSolicitud->execute() ? "pendiente" : "Error al registrar solicitud veterinaria";
?>
