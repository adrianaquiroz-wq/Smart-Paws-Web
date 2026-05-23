<?php
// php/completar_registro.php
// Recibe JSON: { id_mascota, dueno: { ci, nombre, apellido, celular, direccion, usuario } }
// La contraseña se genera automáticamente igual que en registrar_cliente.php
// 1. Verifica/crea persona y cliente.
// 2. Crea entrada en clientes_mascotas.
// 3. Actualiza mascota a estado = 'activo'.
// Todo en una transacción. Devuelve la contraseña generada para mostrarla al vet.

session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once 'conexion.php';

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['id_mascota']) || empty($input['dueno']['ci'])) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos obligatorios (id_mascota o CI del dueño).']);
    exit;
}

$id_mascota = (int) $input['id_mascota'];
$d          = $input['dueno'];

$ci        = (int)  ($d['ci']        ?? 0);
$nombre    = trim($d['nombre']    ?? '');
$apellido  = trim($d['apellido']  ?? '');
$celular   = trim($d['celular']   ?? '');
$direccion = trim($d['direccion'] ?? '');
$usuario   = trim($d['usuario']   ?? '');

if (!$ci || !$nombre || !$apellido || !$usuario) {
    echo json_encode(['status' => 'error', 'message' => 'CI, nombre, apellido y usuario son obligatorios.']);
    exit;
}

// Generar contraseña igual que registrar_cliente.php
$passGenerada = substr(md5($usuario . time()), 0, 8);

$conexion->begin_transaction();

try {
    // ── 1. ¿Ya existe la persona? ─────────────────────────────
    $stCheck = $conexion->prepare("SELECT carnet FROM personas WHERE carnet = ? LIMIT 1");
    $stCheck->bind_param("i", $ci);
    $stCheck->execute();
    $stCheck->store_result();
    $existePersona = $stCheck->num_rows > 0;
    $stCheck->close();

    if (!$existePersona) {
        $stP = $conexion->prepare(
            "INSERT INTO personas (carnet, nombre, apellido, celular, direccion, usuario, contrasena)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stP->bind_param("issssss", $ci, $nombre, $apellido, $celular, $direccion, $usuario, $passGenerada);
        if (!$stP->execute()) {
            throw new Exception('Error al crear la persona: ' . $stP->error);
        }
        $stP->close();
    }

    // ── 2. ¿Ya existe como cliente? ───────────────────────────
    $stCC = $conexion->prepare("SELECT carnetDue FROM clientes WHERE carnetDue = ? LIMIT 1");
    $stCC->bind_param("i", $ci);
    $stCC->execute();
    $stCC->store_result();
    $existeCliente = $stCC->num_rows > 0;
    $stCC->close();

    if (!$existeCliente) {
        $stCli = $conexion->prepare("INSERT INTO clientes (carnetDue) VALUES (?)");
        $stCli->bind_param("i", $ci);
        if (!$stCli->execute()) {
            throw new Exception('Error al crear el cliente: ' . $stCli->error);
        }
        $stCli->close();
    }

    // ── 3. Crear relación en clientes_mascotas ────────────────
    $fechaHoy = date('Y-m-d');
    $stRel = $conexion->prepare(
        "INSERT INTO clientes_mascotas (id_cliente, id_mascota, fecha_inicio)
         VALUES (?, ?, ?)"
    );
    $stRel->bind_param("iis", $ci, $id_mascota, $fechaHoy);
    if (!$stRel->execute()) {
        throw new Exception('Error al crear relación cliente-mascota: ' . $stRel->error);
    }
    $stRel->close();

    // ── 4. Activar mascota ────────────────────────────────────
    $stM = $conexion->prepare("UPDATE mascotas SET estado = 'activo' WHERE id_mascota = ?");
    $stM->bind_param("i", $id_mascota);
    if (!$stM->execute()) {
        throw new Exception('Error al activar la mascota: ' . $stM->error);
    }
    $stM->close();

    $conexion->commit();

    echo json_encode([
        'status'    => 'success',
        'message'   => 'Registro completado. Mascota activada y vinculada al propietario.',
        'usuario'   => $usuario,
        'contrasena'=> $passGenerada   // El frontend la muestra al vet para que la anote
    ]);

} catch (Exception $ex) {
    $conexion->rollback();
    echo json_encode(['status' => 'error', 'message' => $ex->getMessage()]);
}
?>