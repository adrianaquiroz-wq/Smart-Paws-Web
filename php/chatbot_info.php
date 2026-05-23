<?php
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'nombre' => 'Asistente Smart Paws',
    'horarios' => 'Lunes a sabado de 08:00 a 19:00',
    'atenciones' => [
        'Consulta general',
        'Control medico',
        'Vacunacion',
        'Emergencia',
        'Seguimiento clinico'
    ]
]);
?>
