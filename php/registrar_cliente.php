<?php
/*registrar_cliente.php */
include("conexion.php");

// DATOS
$carnet = $_POST['carnetDue'];
$nombre = $_POST['nombre'];
$apellido = $_POST['apellido'];
$usuario = $_POST['usuario'];
$direccion = $_POST['direccion'];

// VALIDAR SI YA EXISTE
$verificar = "SELECT * FROM PERSONAS WHERE carnet='$carnet'";
$res = $conexion->query($verificar);

if($res->num_rows > 0){
    die("Este cliente ya está registrado");
}

// CONTRASEÑA
$pass = substr(md5($usuario . time()), 0, 8);

// INSERT PERSONA
$sql1 = "INSERT INTO PERSONAS
(carnet, nombre, apellido, usuario, contrasena, direccion)
VALUES
('$carnet', '$nombre', '$apellido', '$usuario', '$pass', '$direccion')";

if(!$conexion->query($sql1)){
    die("Error en PERSONAS: " . $conexion->error);
}

// INSERT CLIENTE
$sql2 = "INSERT INTO CLIENTES (carnetDue)
VALUES ('$carnet')";

if(!$conexion->query($sql2)){
    die("Error en CLIENTES: " . $conexion->error);
}

echo "
Usuario: $usuario <br>
Contraseña: $pass
";
?>