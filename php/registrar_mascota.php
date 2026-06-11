<?php
/*registrar_mascota.php*/
include("conexion.php");

header('Content-Type: text/plain');

// =====================
// VALIDACIÓN BÁSICA
// =====================
if (!isset($_POST['nombre']) || !isset($_POST['carnetDue'])) {
    echo "Faltan datos";
    exit;
}

// =====================
// DATOS MASCOTA
// =====================
$carnetDue = (int) $_POST['carnetDue'];

$nombre = $_POST['nombre'];
$fecha_nacimiento = $_POST['fecha_nacimiento'] ?? null;
$peso = $_POST['peso'] ?? null;
$tamano = $_POST['tamano'] ?? null;
$descripcion = $_POST['descripcion'] ?? null;
$alergias = $_POST['alergias'] ?? null;

$id_raza = (int) ($_POST['id_raza'] ?? 0);
$id_color = (int) ($_POST['id_color'] ?? 0);

// =====================
// FOTO
// =====================
$rutaFoto = null;

if (isset($_FILES['foto']) && $_FILES['foto']['error'] == 0) {

    $ext = strtolower(pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION));

    if (!in_array($ext, ["jpg", "jpeg", "png", "webp"])) {
        echo "Formato de imagen no válido";
        exit;
    }

    $nombreFoto = time() . "_" . $_FILES['foto']['name'];
    $carpeta = "../img/mascotas/";

    if (!file_exists($carpeta)) {
        mkdir($carpeta, 0777, true);
    }

    move_uploaded_file($_FILES['foto']['tmp_name'], $carpeta . $nombreFoto);

    $rutaFoto = "img/mascotas/" . $nombreFoto;
}

// =====================
// 1. INSERTAR MASCOTA
// =====================
$stmt = $conexion->prepare("
    INSERT INTO mascotas 
    (nombre, fecha_nacimiento, peso, tamano, descripcion, alergias, foto, id_raza, id_color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "ssdssssii",
    $nombre,
    $fecha_nacimiento,
    $peso,
    $tamano,
    $descripcion,
    $alergias,
    $rutaFoto,
    $id_raza,
    $id_color
);

if (!$stmt->execute()) {
    echo "Error mascota: " . $stmt->error;
    exit;
}

// =====================
// ID DE MASCOTA RECIÉN CREADA
// =====================
$id_mascota = $conexion->insert_id;

// =====================
// 2. RELACIÓN CLIENTE-MASCOTA
// =====================
$stmt2 = $conexion->prepare("
    INSERT INTO clientes_mascotas
    (id_cliente, id_mascota, fecha_inicio, fecha_fin)
    VALUES (?, ?, NOW(), NULL)
");

$stmt2->bind_param(
    "ii",
    $carnetDue,
    $id_mascota
);

if ($stmt2->execute()) {
    echo "ok";
} else {
    echo "Error relación: " . $stmt2->error;
}
?>