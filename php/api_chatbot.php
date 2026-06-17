<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

$datosRecibidos = json_decode(file_get_contents("php://input"), true);
$mensajeUsuario = $datosRecibidos['mensaje'] ?? '';

if(empty($mensajeUsuario)) {
    echo json_encode(["estado" => "error", "respuesta" => "No se recibió ningún mensaje."]);
    exit;
}

$apiKey = "AIzaSyAHGaSw67ZYWUubH7i1ZdXYfAslWcexy1Q"; 
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey;

$instruccionSistema = "Eres el asistente virtual de la clínica veterinaria Smart Paws en Bolivia. Eres experto, empático, atento, cordial y explicativo. 
Tus reglas:
1. Responde de forma concisa (máximo 2 párrafos).
2. Solo hablas de temas veterinarios, mascotas y adopción.
3. No das diagnósticos médicos finales; ante emergencias, pide que acudan a la clínica.";

$data = [
    "system_instruction" => [
        "parts" => [ ["text" => $instruccionSistema] ]
    ],
    "contents" => [
        [
            "parts" => [ ["text" => $mensajeUsuario] ]
        ]
    ],
    "generationConfig" => [
        "temperature" => 0.4,
        "maxOutputTokens" => 800
    ]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

$resultadoAPI = curl_exec($ch);
$httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$errorCurl = curl_error($ch);
curl_close($ch);

if ($httpStatus == 200) {
    $jsonDecodificado = json_decode($resultadoAPI, true);
    $respuestaIA = $jsonDecodificado['candidates'][0]['content']['parts'][0]['text'] ?? "Lo siento, tuve un problema procesando tu solicitud.";
    
    echo json_encode([
        "estado" => "exito",
        "respuesta" => $respuestaIA
    ]);
} else {
    echo json_encode([
        "estado" => "error",
        "respuesta" => "Error API. Código HTTP: $httpStatus. Detalles: $errorCurl"
    ]);
}
?>
