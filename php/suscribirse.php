<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

$correo = $_POST['correo'];

$mail = new PHPMailer(true);

try {

    // CONFIG SMTP
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;

    // TU CORREO
    $mail->Username = 'luz.perez@ucb.edu.bo';

    // APP PASSWORD
    $mail->Password = 'dvwh yvdc plrs bvbx';

    // SSL MEJOR PARA XAMPP
    $mail->SMTPSecure = 'ssl';
    $mail->Port = 465;

    // SOLUCIÓN SSL XAMPP
    $mail->SMTPOptions = array(
        'ssl' => array(
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        )
    );

    // REMITENTE
    $mail->setFrom('luz.perez@ucb.edu.bo', 'Smart Paws');

    // DESTINATARIO
    $mail->addAddress($correo);

    // FORMATO HTML
    $mail->isHTML(true);

    // ASUNTO
    $mail->Subject = 'Bienvenido a Smart Paws 🐾';

    // MENSAJE
    $mail->Body = "
        <div style='font-family:Arial;padding:20px;'>

            <h2 style='color:#1e5c3a;'>
                Gracias por suscribirte 🐾
            </h2>

            <p>
                Ahora recibirás:
            </p>

            <ul>
                <li>Consejos veterinarios</li>
                <li>Promociones</li>
                <li>Vacunas y recordatorios</li>
                <li>Novedades Smart Paws</li>
            </ul>

            <br>

            <b>Smart Paws Veterinaria</b>

        </div>
    ";

    // ENVIAR
    $mail->send();

    echo "
    <script>
        alert('Correo enviado correctamente 🐾');
        window.history.back();
    </script>
    ";

} catch (Exception $e) {

    echo 'Error SMTP: ' . $mail->ErrorInfo;

}
?>
