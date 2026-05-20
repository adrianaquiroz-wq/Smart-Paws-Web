<?php
// php/registrar_emer_comp.php
session_start();
header("Content-Type: application/json; charset=UTF-8");

// 1. Incluimos tu conexión normal de mysqli
require_once "conexion.php"; 

// 2. Capturar y decodificar el mega paquete JSON enviado desde el frontend
$inputData = json_decode(file_get_contents("php://input"), true);

if (!$inputData) {
    echo json_encode([
        "status" => "error",
        "message" => "No se recibieron datos válidos en el servidor."
    ]);
    exit;
}

// Separar las tres estructuras de datos del paquete
$dueno = $inputData['dueno'];
$mascota = $inputData['mascota'];
$atencion = $inputData['atencion'];

// Validación mínima de campos obligatorios
if (empty($dueno['ci']) || empty($mascota['nombre']) || empty($atencion['diagnostico'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Faltan campos mandatorios (CI del dueño, Nombre de mascota o Diagnóstico)."
    ]);
    exit;
}

try {
    // 3. INICIAR LA TRANSACCIÓN EN MYSQLI (Desactivamos el autocommit para proteger los datos)
    mysqli_begin_transaction($conexion);

    // Escape de strings preventivo para evitar inyecciones SQL en mysqli
    $ci_dueño = mysqli_real_escape_string($conexion, $dueno['ci']);
    $nombre_dueño = mysqli_real_escape_string($conexion, $dueno['nombre']);
    $apellido_dueño = mysqli_real_escape_string($conexion, $dueno['apellido']);
    $telefono_dueño = mysqli_real_escape_string($conexion, $dueno['telefono']);

    // =======================================================
    // PASO 1: INSERTAR O VERIFICAR PROPIETARIO EN 'personas'
    // =======================================================
    // Nota: Como en get_esper_aten.php buscas por p.carnet, usamos ese nombre de columna
    $sqlCheckDueno = "SELECT carnet FROM personas WHERE carnet = '$ci_dueño'";
    $resCheck = mysqli_query($conexion, $sqlCheckDueno);

    if (mysqli_num_rows($resCheck) == 0) {
        $sqlPersona = "INSERT INTO personas (carnet, nombre, apellido, telefono) 
                       VALUES ('$ci_dueño', '$nombre_dueño', '$apellido_dueño', '$telefono_dueño')";
        if (!mysqli_query($conexion, $sqlPersona)) {
            throw new Exception("Error al registrar los datos de la persona.");
        }

        // Bloque preventivo opcional por si tienes la tabla secundaria 'clientes'
        $sqlCheckCliente = "SELECT ci FROM clientes WHERE ci = '$ci_dueño'";
        $resCheckC = mysqli_query($conexion, $sqlCheckCliente);
        if (mysqli_num_rows($resCheckC) == 0) {
            $sqlCliente = "INSERT INTO clientes (ci) VALUES ('$ci_dueño')";
            mysqli_query($conexion, $sqlCliente);
        }
    }

    // =======================================================
    // PASO 2: REGISTRAR LA NUEVA MASCOTA EN 'mascotas'
    // =======================================================
    $nombre_m = mysqli_real_escape_string($conexion, $mascota['nombre']);
    $especie_m = mysqli_real_escape_string($conexion, $mascota['species']); // Atenciones.js manda 'species'
    $raza_m = !empty($mascota['raza']) ? mysqli_real_escape_string($conexion, $mascota['raza']) : 'Criollo';
    $nacimiento_m = !empty($mascota['fecha_nacimiento']) ? mysqli_real_escape_string($conexion, $mascota['fecha_nacimiento']) : null;

    // Ajustado a 'carnetDue' como figura en tu buscador de mesa de espera
    $sqlMascota = "INSERT INTO mascotas (nombre, especie, raza, fecha_nacimiento, carnetDue, foto) 
                   VALUES ('$nombre_m', '$especie_m', '$raza_m', " . ($nacimiento_m ? "'$nacimiento_m'" : "NULL") . ", '$ci_dueño', 'img/default.png')";
    
    if (!mysqli_query($conexion, $sqlMascota)) {
        throw new Exception("Error al registrar la nueva mascota en la base de datos.");
    }

    // Recuperamos el ID autoincremental de la mascota recién creada en MySQL
    $idMascotaGenerado = mysqli_insert_id($conexion);

    // =======================================================
    // PASO 3: REGISTRAR LA ATENCIÓN CLÍNICA VINCULADA
    // =======================================================
    $id_cita = !empty($atencion['id_cita']) ? intval($atencion['id_cita']) : "NULL";
    $diagnostico = mysqli_real_escape_string($conexion, $atencion['diagnostico']);
    $tratamiento = mysqli_real_escape_string($conexion, $atencion['tratamiento']);
    $observaciones = !empty($atencion['observaciones']) ? mysqli_real_escape_string($conexion, $atencion['observaciones']) : "";
    $prox_fecha = !empty($atencion['prox_fecha']) ? "'" . mysqli_real_escape_string($conexion, $atencion['prox_fecha']) . "'" : "NULL";
    $asistente_n = !empty($atencion['asistente_nombre']) ? mysqli_real_escape_string($conexion, $atencion['asistente_nombre']) : "";
    $asistente_r = !empty($atencion['asistente_relacion']) ? mysqli_real_escape_string($conexion, $atencion['asistente_relacion']) : "";
    
    $peso = !empty($atencion['peso_kg']) ? floatval($atencion['peso_kg']) : 0;
    $temp = !empty($atencion['temperatura']) ? floatval($atencion['temperatura']) : 0;
    $fc = !empty($atencion['frecuencia_cardiaca']) ? intval($atencion['frecuencia_cardiaca']) : 0;
    
    $medicoResponsable = mysqli_real_escape_string($conexion, $_SESSION['carnet'] ?? '123456');
    $hora_ini = mysqli_real_escape_string($conexion, $atencion['hora_inicio']);
    $hora_fin = mysqli_real_escape_string($conexion, $atencion['hora_fin']);
    $tipo_at = !empty($atencion['tipo_atencion']) ? mysqli_real_escape_string($conexion, $atencion['tipo_atencion']) : 'Emergencia';

    $sqlAtencion = "INSERT INTO atenciones (
                        id_cita, fecha, diagnostico, prox_fecha, carnetVet, 
                        asistente_nombre, asistente_relacion, peso_kg, 
                        temperatura, frecuencia_cardiaca, tratamiento, 
                        observaciones, id_mascota, tipo_atencion, hora_inicio, hora_fin
                    ) VALUES (
                        $id_cita, CURRENT_DATE(), '$diagnostico', $prox_fecha, '$medicoResponsable', 
                        '$asistente_n', '$asistente_r', $peso, 
                        $temp, $fc, '$tratamiento', 
                        '$observaciones', $idMascotaGenerado, '$tipo_at', '$hora_ini', '$hora_fin'
                    )";

    if (!mysqli_query($conexion, $sqlAtencion)) {
        throw new Exception("Error al insertar la atención médica final.");
    }

    // 4. SI TODO SALIÓ PERFECTO, CONFIRMAMOS LA TRANSACCIÓN
    mysqli_commit($conexion);

    echo json_encode([
        "status" => "success",
        "message" => "¡PUFF! Todo guardado y enlazado con éxito simultáneamente."
    ]);

} catch (Exception $e) {
    // 5. SI ALGO FALLÓ, HACEMOS ROLLBACK INMEDIATO (Nada se guarda en la DB)
    mysqli_rollback($conexion);

    echo json_encode([
        "status" => "error",
        "message" => "Error en la transacción en cadena: " . $e->getMessage()
    ]);
}
?>