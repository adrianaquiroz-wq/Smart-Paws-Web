-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-05-2026 a las 06:19:10
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `veterinaria`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `atenciones`
--

CREATE TABLE `atenciones` (
  `id_atencion` int(11) NOT NULL,
  `id_cita` int(11) DEFAULT NULL,
  `fecha` date NOT NULL,
  `diagnostico` text DEFAULT NULL,
  `prox_fecha` date DEFAULT NULL,
  `carnetVet` int(11) DEFAULT NULL,
  `asistente_nombre` varchar(100) DEFAULT NULL,
  `asistente_relacion` varchar(50) DEFAULT NULL,
  `peso_kg` decimal(5,2) DEFAULT NULL,
  `temperatura` decimal(4,1) DEFAULT NULL,
  `frecuencia_cardiaca` int(11) DEFAULT NULL,
  `tratamiento` text DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `id_mascota` int(11) NOT NULL,
  `tipo_atencion` varchar(20) NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `atenciones`
--

INSERT INTO `atenciones` (`id_atencion`, `id_cita`, `fecha`, `diagnostico`, `prox_fecha`, `carnetVet`, `asistente_nombre`, `asistente_relacion`, `peso_kg`, `temperatura`, `frecuencia_cardiaca`, `tratamiento`, `observaciones`, `id_mascota`, `tipo_atencion`, `hora_inicio`, `hora_fin`) VALUES
(13, 10, '2026-05-22', 'Está con sobrepeso y tiene estrés.', '2026-05-29', 9244226, 'Teresa Paredes', 'Familiar', 23.00, 23.0, 120, '0', 'Puede que muera si no sigue las indicaciones.', 17, 'Consulta', '22:46:00', '22:46:00'),
(14, 10, '2026-05-22', 'Está con sobrepeso y tiene estrés.', '2026-05-29', 9244226, 'Teresa Paredes', 'Familiar', 23.00, 23.0, 120, '0', 'Puede que muera si no sigue las indicaciones.', 17, 'Consulta', '22:46:00', '22:46:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas`
--

CREATE TABLE `citas` (
  `id_cita` int(11) NOT NULL,
  `id_mascota` int(11) NOT NULL,
  `carnetDue` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `motivo` varchar(100) DEFAULT NULL,
  `estado` enum('Pendiente','Cancelada','Atendida','Ausente') DEFAULT NULL,
  `carnetVet` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `citas`
--

INSERT INTO `citas` (`id_cita`, `id_mascota`, `carnetDue`, `fecha`, `hora`, `motivo`, `estado`, `carnetVet`) VALUES
(1, 17, 55555, '2026-05-20', '09:00:00', 'Control rutina mañanera.', 'Cancelada', 9244226),
(2, 17, 55555, '2026-05-20', '15:00:00', 'Contro rutinario tarde.', 'Cancelada', 9244226),
(3, 17, 55555, '2026-05-22', '11:00:00', 'Lavado de pelo.', 'Cancelada', 555666),
(4, 17, 55555, '2026-05-20', '10:00:00', 'Bañadita.', 'Cancelada', 9244226),
(5, 17, 55555, '2026-05-20', '09:00:00', 'Limpieza bucal.', 'Cancelada', 9244226),
(6, 17, 55555, '2026-05-21', '14:00:00', 'Corte de pelo.', 'Pendiente', 9244226),
(7, 17, 55555, '2026-05-19', '20:30:00', 'Dolor de barriga.', 'Pendiente', 9244226),
(8, 17, 55555, '2026-05-19', '23:30:00', 'Revisión de ojos.', 'Cancelada', 9244226),
(9, 17, 55555, '2026-05-19', '23:45:00', 'blsbla', 'Pendiente', 9244226),
(10, 17, 55555, '2026-05-22', '23:45:00', 'Bañito.', 'Atendida', 9244226),
(11, 17, 55555, '2026-05-22', '23:45:00', 'Boquita.', 'Pendiente', 9244226),
(12, 17, 55555, '2026-05-23', '17:00:00', 'Pelitos cortar.', 'Pendiente', 9244226);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `carnetDue` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`carnetDue`) VALUES
(13579),
(55555),
(313131),
(666999),
(777888),
(9258589),
(333555777),
(654654654),
(1020304050),
(2147483647);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes_mascotas`
--

CREATE TABLE `clientes_mascotas` (
  `id_registroMasc` int(11) NOT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `id_mascota` int(11) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes_mascotas`
--

INSERT INTO `clientes_mascotas` (`id_registroMasc`, `id_cliente`, `id_mascota`, `fecha_inicio`, `fecha_fin`) VALUES
(7, 666999, 8, '2026-05-13', NULL),
(8, 666999, 9, '2026-05-13', NULL),
(9, 777888, 10, '2026-05-13', NULL),
(10, 2147483647, 11, '2026-05-14', NULL),
(11, 654654654, 12, '2026-05-14', NULL),
(12, 666999, 13, '2026-05-14', NULL),
(13, 333555777, 14, '2026-05-14', NULL),
(14, 333555777, 15, '2026-05-14', NULL),
(15, 13579, 16, '2026-05-18', NULL),
(16, 55555, 17, '2026-05-19', NULL),
(17, 1020304050, 18, '2026-05-19', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `colores`
--

CREATE TABLE `colores` (
  `id_color` int(11) NOT NULL,
  `nombre` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `colores`
--

INSERT INTO `colores` (`id_color`, `nombre`) VALUES
(1, 'Negro'),
(2, 'Blanco'),
(3, 'Marrón'),
(4, 'Blanco'),
(5, 'Naranja'),
(6, 'Cafe'),
(7, 'Rojo'),
(8, 'Azul'),
(9, 'Amarillo'),
(10, 'Celeste'),
(11, 'Verde'),
(12, 'Rosa'),
(13, 'Gris');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compras`
--

CREATE TABLE `compras` (
  `id_compra` int(11) NOT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `id_mascota` int(11) DEFAULT NULL,
  `carnetDue` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `compras`
--

INSERT INTO `compras` (`id_compra`, `id_producto`, `cantidad`, `fecha`, `costo`, `id_mascota`, `carnetDue`) VALUES
(1, 7, 1, '0000-00-00', 30.00, NULL, 333555777),
(2, 1, 1, '0000-00-00', 185.00, NULL, 13579);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `especies`
--

CREATE TABLE `especies` (
  `id_especie` int(11) NOT NULL,
  `nombre` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `especies`
--

INSERT INTO `especies` (`id_especie`, `nombre`) VALUES
(1, 'Perro'),
(2, 'Gato'),
(3, 'Conejo'),
(4, 'Ave'),
(5, 'Reptil');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mascotas`
--

CREATE TABLE `mascotas` (
  `id_mascota` int(11) NOT NULL,
  `nombre` varchar(40) NOT NULL,
  `id_color` int(11) DEFAULT NULL,
  `id_raza` int(11) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `peso` decimal(5,2) DEFAULT NULL,
  `tamano` varchar(20) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `alergias` text DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mascotas`
--

INSERT INTO `mascotas` (`id_mascota`, `nombre`, `id_color`, `id_raza`, `fecha_nacimiento`, `peso`, `tamano`, `descripcion`, `alergias`, `foto`, `estado`) VALUES
(8, 'Chimuelo', 1, 6, '2025-01-01', 6.60, 'Mediano', '', '', 'img/mascotas/1778678431_gatoSiames.jpg', 'activo'),
(9, 'Bobby', 2, 12, '2026-01-01', 4.80, 'Pequeño', '', '', 'img/mascotas/1778704035_canario.jpg', 'activo'),
(10, 'ABBA', 1, 14, '2025-01-01', 8.10, 'Mediano', '', '', 'img/mascotas/1778723169_iguana.jpg', 'activo'),
(11, 'Yisu', 3, 2, '2016-01-01', 15.30, 'Pequeño', '', '', 'img/mascotas/1778760470_bulldog.jpg', 'activo'),
(12, 'Diana', 2, 6, '2020-01-01', 0.00, 'Mediano', '', '', 'img/mascotas/1778763140_gatoSiames.jpg', 'activo'),
(13, 'Cuellerin', 2, 10, '2025-10-10', 4.60, 'Mediano', '', '', NULL, 'activo'),
(14, 'Pepito', 1, 12, '2025-01-01', 4.20, 'Mediano', '', '', 'img/mascotas/1778764538_canario.jpg', 'activo'),
(15, 'Yogurt', 1, 11, '2025-01-01', 7.90, 'Pequeño', '', '', 'img/mascotas/1778769358_conejoCaLeon.jpg', 'activo'),
(16, 'Lorinho', 1, 13, '2026-01-01', 4.60, 'Mediano', '', '', 'img/mascotas/1779128211_loro.jpg', 'activo'),
(17, 'Alvin', 3, 4, '2025-01-01', 5.80, 'Pequeño', '', '', 'img/mascotas/1779220049_poodle.jpg', 'activo'),
(18, 'koala', 1, 6, '2025-10-01', 10.40, 'Mediano', '', '', 'img/mascotas/1779229419_gatoSiames.jpg', 'activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personas`
--

CREATE TABLE `personas` (
  `carnet` int(11) NOT NULL,
  `nombre` varchar(40) NOT NULL,
  `apellido` varchar(40) NOT NULL,
  `celular` varchar(15) DEFAULT NULL,
  `direccion` varchar(50) DEFAULT NULL,
  `usuario` varchar(40) NOT NULL,
  `contrasena` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `personas`
--

INSERT INTO `personas` (`carnet`, `nombre`, `apellido`, `celular`, `direccion`, `usuario`, `contrasena`) VALUES
(13579, 'Froilan ', 'Gutierrez', NULL, 'Calle Pajsi #123', 'froilan@gmail.com', '466e95f1'),
(55555, 'dadasd', 'sadsad', NULL, 'Av. America', 'sad@gmail.com', '8c5e4dc9'),
(313131, 'Camilaxa', 'Perezxa', NULL, 'Av. Colombia', 'camixa2020@gmail.com', '216c6386'),
(555666, 'Juanita', 'Ponce Armadil', '', '', 'juanita@gmail.com', '72546984'),
(666999, 'Clarita', 'Suárez', NULL, 'Av. san pablo', 'clarita2010@gmail.com', '9dae3690'),
(777888, 'Pedro', 'Canon Picaro', NULL, 'Av. Colombia', 'pedrito2000@gmailcom', '6d4e8def'),
(9244226, 'Adriana', 'Quiroz', '', '', 'adriqy2005@gmail.com', '72546984fmycga?'),
(9258589, 'Martha', 'Yujra', NULL, 'Av. America', 'mys@gmail.com', 'cf0d1451'),
(333555777, 'Rafael', 'De La Gueto', NULL, 'Calle wirma', 'rafita@gmail.com', 'aaf1d469'),
(654654654, 'Fabricio', 'Cardenas', NULL, 'Calle Pajsi #123', 'fabrixxx@gmail.com', '0b4d0439'),
(1020304050, 'Leo', 'Pacheco', NULL, 'Av. Colombia', 'leo@gmail.com', '8512f0f1'),
(2147483647, 'Fabiola Carla', 'Yujra Quiroz', NULL, 'Av. Pabellon', 'fabyxs@gmail.com', '33e26a8f');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `nombre` varchar(40) DEFAULT NULL,
  `descripcion` varchar(80) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `imagen` varchar(255) DEFAULT NULL,
  `categoria` varchar(40) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `nombre`, `descripcion`, `precio`, `stock`, `imagen`, `categoria`) VALUES
(1, 'Pro Plan Adulto 3kg', 'Alimento balanceado premium para perros adultos', 185.00, 11, 'https://d34xtejqjqcp3x.cloudfront.net/store/d3ed875c04ea93a088da60d182535b9f.webp', 'Alimento'),
(2, 'Royal Canin Gato 1.5kg', 'Nutrición específica para gatos domésticos', 135.00, 8, 'https://d34xtejqjqcp3x.cloudfront.net/store/f890525b942c7e3f9734f4126749fac6.webp', 'Alimento'),
(3, 'Shampoo Neutro 500ml', 'Shampoo suave sin parabenos para todo tipo de pelo', 35.00, 20, 'https://d34xtejqjqcp3x.cloudfront.net/store/a963e1560fdc2390924170fd0c7d0bed.webp', 'Higiene'),
(4, 'Cepillo Desmallador', 'Reduce enredos y caída de pelo eficientemente', 28.00, 15, 'https://m.media-amazon.com/images/S/aplus-media-library-service-media/4eb844b5-caae-46e4-8811-09d5e8da4419.__AC_SR166,182___.jpg', 'Higiene'),
(5, 'Cuerda Trenzada Resistente', 'Juguete dental de cuerda para perros medianos', 22.00, 30, 'https://m.media-amazon.com/images/I/81V3yf82dcL._AC_UF400,400_QL80_.jpg', 'Juguetes'),
(6, 'Pelota Interactiva', 'Pelota con sonido para gatos y perros pequeños', 18.00, 25, 'https://media.falabella.com/falabellaPE/138428445_01/w=1500,h=1500,fit=cover', 'Juguetes'),
(7, 'Plato Acero Inoxidable', 'Antideslizante, apto para lavavajillas', 30.00, 9, 'https://petkorp.com/wp-content/uploads/2023/02/AP-D003-043_2.webp', 'Accesorios'),
(8, 'Correa Retráctil 5m', 'Con freno de bloqueo y mango ergonómico', 65.00, 6, 'https://media.adeo.com/mkp/62680a51ac8de070d5a053670aee18e4/media.jpeg', 'Accesorios'),
(9, 'Cama Acolchada Talla L', 'Relleno de fibra suave, funda lavable', 120.00, 4, 'https://tottoco.vtexassets.com/arquivos/ids/514234/PDCBCA1009.jpg', 'Camas'),
(10, 'Cama Cáscara de Nuez M', 'Diseño nórdico, antideslizante, súper suave', 95.00, 0, 'https://acdn-us.mitiendanube.com/stores/880/994/products/cama-nordico-pet-max-bbb870bbbc9c95738f17214116333463-1024-1024.webp', 'Camas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `razas`
--

CREATE TABLE `razas` (
  `id_raza` int(11) NOT NULL,
  `nombre` varchar(40) NOT NULL,
  `id_especie` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `razas`
--

INSERT INTO `razas` (`id_raza`, `nombre`, `id_especie`) VALUES
(1, 'Labrador', 1),
(2, 'Bulldog', 1),
(3, 'Pastor Alemán', 1),
(4, 'Poodle', 1),
(5, 'Chihuahua', 1),
(6, 'Siames', 2),
(7, 'Persa', 2),
(8, 'Maine Coon', 2),
(9, 'Bengalí', 2),
(10, 'Holandés Enano', 3),
(11, 'Cabeza de León', 3),
(12, 'Canario', 4),
(13, 'Loro Amazónico', 4),
(14, 'Iguana Verde', 5),
(15, 'Gecko Leopardo', 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `veterinarios`
--

CREATE TABLE `veterinarios` (
  `carnetVet` int(11) NOT NULL,
  `especialidad` varchar(40) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `veterinarios`
--

INSERT INTO `veterinarios` (`carnetVet`, `especialidad`) VALUES
(555666, 'General'),
(9244226, 'General');

-- --------------------------------------------------------

--
-- Estructura de tabla para solicitudes pendientes de veterinarios
--

CREATE TABLE `solicitudes_veterinarios` (
  `id_solicitud` int(11) NOT NULL AUTO_INCREMENT,
  `carnetVet` int(11) NOT NULL,
  `especialidad` varchar(80) DEFAULT NULL,
  `matricula` varchar(60) DEFAULT NULL,
  `estado` enum('Pendiente','Aprobada','Rechazada') DEFAULT 'Pendiente',
  `fecha_solicitud` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_solicitud`),
  UNIQUE KEY `unique_solicitud_vet` (`carnetVet`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `atenciones`
--
ALTER TABLE `atenciones`
  ADD PRIMARY KEY (`id_atencion`),
  ADD KEY `carnetVet` (`carnetVet`),
  ADD KEY `fk_atencion_cita` (`id_cita`),
  ADD KEY `fk_atencion_mascota` (`id_mascota`);

--
-- Indices de la tabla `citas`
--
ALTER TABLE `citas`
  ADD PRIMARY KEY (`id_cita`),
  ADD KEY `fk_cita_mascota` (`id_mascota`),
  ADD KEY `fk_cita_cliente` (`carnetDue`),
  ADD KEY `fk_cita_veterinario` (`carnetVet`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`carnetDue`);

--
-- Indices de la tabla `clientes_mascotas`
--
ALTER TABLE `clientes_mascotas`
  ADD PRIMARY KEY (`id_registroMasc`),
  ADD KEY `carnetDue` (`id_cliente`),
  ADD KEY `id_mascota` (`id_mascota`);

--
-- Indices de la tabla `colores`
--
ALTER TABLE `colores`
  ADD PRIMARY KEY (`id_color`);

--
-- Indices de la tabla `compras`
--
ALTER TABLE `compras`
  ADD PRIMARY KEY (`id_compra`),
  ADD KEY `id_producto` (`id_producto`),
  ADD KEY `id_mascota` (`id_mascota`),
  ADD KEY `carnetDue` (`carnetDue`);

--
-- Indices de la tabla `especies`
--
ALTER TABLE `especies`
  ADD PRIMARY KEY (`id_especie`);

--
-- Indices de la tabla `mascotas`
--
ALTER TABLE `mascotas`
  ADD PRIMARY KEY (`id_mascota`),
  ADD KEY `id_color` (`id_color`),
  ADD KEY `id_raza` (`id_raza`);

--
-- Indices de la tabla `personas`
--
ALTER TABLE `personas`
  ADD PRIMARY KEY (`carnet`),
  ADD UNIQUE KEY `unique_usuario` (`usuario`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`);

--
-- Indices de la tabla `razas`
--
ALTER TABLE `razas`
  ADD PRIMARY KEY (`id_raza`),
  ADD KEY `id_especie` (`id_especie`);

--
-- Indices de la tabla `veterinarios`
--
ALTER TABLE `veterinarios`
  ADD PRIMARY KEY (`carnetVet`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `atenciones`
--
ALTER TABLE `atenciones`
  MODIFY `id_atencion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `citas`
--
ALTER TABLE `citas`
  MODIFY `id_cita` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `clientes_mascotas`
--
ALTER TABLE `clientes_mascotas`
  MODIFY `id_registroMasc` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `colores`
--
ALTER TABLE `colores`
  MODIFY `id_color` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `compras`
--
ALTER TABLE `compras`
  MODIFY `id_compra` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `especies`
--
ALTER TABLE `especies`
  MODIFY `id_especie` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `mascotas`
--
ALTER TABLE `mascotas`
  MODIFY `id_mascota` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `razas`
--
ALTER TABLE `razas`
  MODIFY `id_raza` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `atenciones`
--
ALTER TABLE `atenciones`
  ADD CONSTRAINT `atenciones_ibfk_2` FOREIGN KEY (`carnetVet`) REFERENCES `veterinarios` (`carnetVet`),
  ADD CONSTRAINT `fk_atencion_cita` FOREIGN KEY (`id_cita`) REFERENCES `citas` (`id_cita`),
  ADD CONSTRAINT `fk_atencion_mascota` FOREIGN KEY (`id_mascota`) REFERENCES `mascotas` (`id_mascota`);

--
-- Filtros para la tabla `citas`
--
ALTER TABLE `citas`
  ADD CONSTRAINT `fk_cita_cliente` FOREIGN KEY (`carnetDue`) REFERENCES `clientes` (`carnetDue`),
  ADD CONSTRAINT `fk_cita_mascota` FOREIGN KEY (`id_mascota`) REFERENCES `mascotas` (`id_mascota`),
  ADD CONSTRAINT `fk_cita_veterinario` FOREIGN KEY (`carnetVet`) REFERENCES `veterinarios` (`carnetVet`);

--
-- Filtros para la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`carnetDue`) REFERENCES `personas` (`carnet`);

--
-- Filtros para la tabla `clientes_mascotas`
--
ALTER TABLE `clientes_mascotas`
  ADD CONSTRAINT `clientes_mascotas_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`carnetDue`),
  ADD CONSTRAINT `clientes_mascotas_ibfk_2` FOREIGN KEY (`id_mascota`) REFERENCES `mascotas` (`id_mascota`);

--
-- Filtros para la tabla `compras`
--
ALTER TABLE `compras`
  ADD CONSTRAINT `compras_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`),
  ADD CONSTRAINT `compras_ibfk_2` FOREIGN KEY (`id_mascota`) REFERENCES `mascotas` (`id_mascota`),
  ADD CONSTRAINT `compras_ibfk_3` FOREIGN KEY (`carnetDue`) REFERENCES `clientes` (`carnetDue`);

--
-- Filtros para la tabla `mascotas`
--
ALTER TABLE `mascotas`
  ADD CONSTRAINT `mascotas_ibfk_1` FOREIGN KEY (`id_color`) REFERENCES `colores` (`id_color`),
  ADD CONSTRAINT `mascotas_ibfk_2` FOREIGN KEY (`id_raza`) REFERENCES `razas` (`id_raza`);

--
-- Filtros para la tabla `razas`
--
ALTER TABLE `razas`
  ADD CONSTRAINT `razas_ibfk_1` FOREIGN KEY (`id_especie`) REFERENCES `especies` (`id_especie`);

--
-- Filtros para la tabla `veterinarios`
--
ALTER TABLE `veterinarios`
  ADD CONSTRAINT `veterinarios_ibfk_1` FOREIGN KEY (`carnetVet`) REFERENCES `personas` (`carnet`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
