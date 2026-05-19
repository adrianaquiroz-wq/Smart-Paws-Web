<?php
/* cancelar_cita.php */
header('Content-Type: application/json');
require_once 'conexion.php';

if (empty($_POST) && !empty(file_get_contents("php://input"))) {
    parse_str(file_get_contents("php://input"), $_POST);
}

if (!isset($_POST['id_cita']) || empty($_POST['id_cita'])) {
    echo json_encode([
        "success" => false, 
        "message" => "Falta el ID de la cita o el parámetro no es válido."
    ]);
    exit;
}

$id_cita = intval($_POST['id_cita']);

try {
    // 1. Validamos primero si la cita existe y cuál es su estado real antes de actualizar
    $checkQuery = "SELECT estado FROM citas WHERE id_cita = ?";
    $checkStmt = $conexion->prepare($checkQuery);
    $checkStmt->bind_param("i", $id_cita);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            "success" => false,
            "message" => "La cita con ID ($id_cita) no existe en la base de datos."
        ]);
        $checkStmt->close();
        exit;
    }

    $row = $result->fetch_assoc();
    if (trim(strtolower($row['estado'])) === 'cancelada') {
        echo json_encode([
            "success" => false,
            "message" => "Esta cita médica ya fue cancelada previamente."
        ]);
        $checkStmt->close();
        exit;
    }
    $checkStmt->close();

    // 2. Si pasa las validaciones, procedemos con la actualización
    $query = "UPDATE citas SET estado = 'Cancelada' WHERE id_cita = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("i", $id_cita);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true, 
            "message" => "¡Cita cancelada con éxito!"
        ]);
    } else {
        echo json_encode([
            "success" => false, 
            "message" => "Error interno al intentar actualizar el estado."
        ]);
    }
    $stmt->close();

} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Excepción del servidor: " . $e->getMessage()
    ]);
}

$conexion->close();
?>