-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 21-05-2026 a las 00:28:50
-- Versión del servidor: 10.6.25-MariaDB-cll-lve
-- Versión de PHP: 8.3.31

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `alphadocere_Vit`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alertas_admin`
--

DROP TABLE IF EXISTS `alertas_admin`;
CREATE TABLE `alertas_admin` (
  `id` int(11) NOT NULL,
  `bitacora_id` int(11) NOT NULL COMMENT 'FK → bitacoras.id',
  `usuario_id` int(11) NOT NULL COMMENT 'FK → usuarios.id (practicante)',
  `tipo` enum('ayuda','animo_critico','combinada') NOT NULL DEFAULT 'ayuda',
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `atendida` tinyint(1) NOT NULL DEFAULT 0,
  `email_enviado` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = correo de alerta fue enviado',
  `notas_admin` text DEFAULT NULL COMMENT 'Notas internas del admin al atender',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `atendida_en` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bitacoras`
--

DROP TABLE IF EXISTS `bitacoras`;
CREATE TABLE `bitacoras` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL COMMENT 'FK → usuarios.id',
  `fecha` date NOT NULL COMMENT 'Fecha del registro (YYYY-MM-DD)',
  `hecho_hoy` text NOT NULL COMMENT '¿Qué hice hoy?',
  `hacer_manana` text NOT NULL COMMENT '¿Qué haré mañana?',
  `estado_animo` enum('excelente','bien','regular','cansado','frustrado') NOT NULL DEFAULT 'bien' COMMENT 'Estado de ánimo al registrar',
  `necesita_ayuda` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = solicitó apoyo activo',
  `desc_ayuda` text DEFAULT NULL COMMENT 'Descripción del bloqueo o ayuda necesaria',
  `atendido` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = admin ya atendió la alerta',
  `atendido_por` int(11) DEFAULT NULL COMMENT 'FK → usuarios.id del admin que atendió',
  `fecha_atencion` timestamp NULL DEFAULT NULL COMMENT 'Cuándo fue atendido',
  `palabras_count` int(11) DEFAULT 0 COMMENT 'Conteo de palabras para insignias de escritura',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `bitacoras`
--

INSERT INTO `bitacoras` (`id`, `usuario_id`, `fecha`, `hecho_hoy`, `hacer_manana`, `estado_animo`, `necesita_ayuda`, `desc_ayuda`, `atendido`, `atendido_por`, `fecha_atencion`, `palabras_count`, `creado_en`) VALUES
(1, 2, '2026-03-04', 'Mi primer dia de practica comence con nerviosismo pero hice la histalacion de los programas a utilizar junto con el levantamiento de Kreative de manera local y registrarme para acceder', 'crear perfil en Kreative no de manera local', 'bien', 0, NULL, 0, NULL, NULL, 238, CURRENT_TIMESTAMP),
(2, 2, '2026-03-05', 'Segundo dia de practica esta todo bien tubimos una reunion bien larga con mauro donde sali de gran parte de mis dudas, hoy reporte algunos fix y bugs  vi los proyectos en los que se esta trabajando los cuales son 4 dos de alpha digamos y dos de clientes.\n\nasiti al cierre de un practicante llamado juan el que me hizo ver que las confuciones que tenoa eran communes pero en fin fue un buen dia', 'Analizar bugs y fix encontrados y estimar tiempo', 'bien', 0, NULL, 0, NULL, NULL, 284, CURRENT_TIMESTAMP),
(3, 2, '2026-03-06', 'tercer dia todo esta bien  con los bug y fix que se encontraron ayer se estipulo un tiempo promedio que se podria solucionar el  problema y se trabajo en miro en las plantillas para las bitacoras', 'para el lunes resolver errores simples encontrados y revisar pagina dicreme landing para correjir detalles que seran informados', 'bien', 0, NULL, 0, NULL, NULL, 254, CURRENT_TIMESTAMP),
(4, 2, '2026-03-09', 'cuarto dia de practica hoy fue bien productivo trabaje em fix algunos detalles  trabajamos en comprender el flujo de sourcetree efectuamos revicion de los cambios aplicados a cada rama segun su codigo', 'combinar todo lo de Di cream donde todos los cambios que hemos realizado con el grupo se verian reflejados', 'bien', 0, NULL, 0, NULL, NULL, 251, CURRENT_TIMESTAMP),
(5, 2, '2026-03-10', 'Hoy se trabajo con Kreati CV resolviendo ciertos fix y se ayudo a compañeros en dudas que aparecieron  se nos informo que ya debiamos empezar a socializar con los demas compañeros del area y nos fueramos metiendo en los demas proyectos poco a poco', 'continuar con la resolucion de fix y leer la documentacion que me fue proporcionada hoy', 'bien', 0, NULL, 0, NULL, NULL, 259, CURRENT_TIMESTAMP),
(6, 2, '2026-03-11', 'hoy se resolvio un fix de kreative cv posteriormente lei el protocolo de pruebas de validacion de arquitectura , seguridad e integracion  de la wiki kreative  tambien el informe de estabilizacion de autenticacion y hoja de ruta del proyecto y para dar fin a la lectura la propuesta del systemauth.\n\nya con todo lo anterior se dio levantamiento a creative  de manera local para hacer revicion de fix o bugs segun se vallan encontrando con ayuda de los mas avanzados', 'Seguir buscando algun que otro Fix o bug y planificar la creacion de un post de manera grupal para la wiki', 'bien', 0, NULL, 0, NULL, NULL, 301, CURRENT_TIMESTAMP),
(7, 2, '2026-03-12', 'hoy se realizo mas busquedas de fix/bugs se planifico la publicacion grupal para la wiki donde decidimos mostrar el uso/ primeros pasos de la metodologia de trabajo en alpha docere donde se hizo un video explicativo de el paso a paso se asistio al cierre de practica de una chica llamada rocio y a la otra por temas de estudio no pude participar\n\na pd lei documentacion que me entrego moises sobre la wiki', 'buscar mas fix/bugs y nose que mas realizare', 'bien', 0, NULL, 0, NULL, NULL, 282, CURRENT_TIMESTAMP),
(8, 2, '2026-03-13', 'hoy fue un dia piola se participo de el cierre de practica de un muchacho se encontro pocos fix y se participo del podcast se comberso con mauro ciertos puntos  y nos delego temprano a casa bueno no a casa si no a salir tramando de la jornada laboral xd', 'para el lunes se espera hacer la matriz de einsenhower con los fix/bug que se allan pillado mencionaron que quizas entra jente nueva y ahi estaremos para ellos en sus primeras dudas', 'bien', 0, NULL, 0, NULL, NULL, 282, CURRENT_TIMESTAMP),
(9, 2, '2026-03-14', 'chambeo pero de electricista XD', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 206, CURRENT_TIMESTAMP),
(10, 2, '2026-03-16', 'hoy hicimos la matriz de eisenhower con los fix/bug encontradoes en FixBug Kreative Gen 17 NUEVOS y ayudando a las 3 peronas nuevas que ingresaron hoy tambien se participo de la retroalimentacion general y despues de almuerzo de el cierre de practica de feranando y se sigio ayudando a la gente nueva reunion con moises y nico sobre la wiki', 'Reunion con arturo y trabajar en la wiki', 'bien', 0, NULL, 0, NULL, NULL, 268, CURRENT_TIMESTAMP),
(11, 2, '2026-03-17', 'Se trabajo en la wiki  se hizo una reunion con arturo para hablar de los fix/bug que se allan encontrado en contribuir, se le ayudo en lo que pudo a los chic@ nuevos posterior mente se hizo una reunion para hablar de la wiki y mostrar los cambios que tenia para ver que mejorar y hablar del futuro de la wiki', 'Continuar el trabajo en la wiki', 'bien', 0, NULL, 0, NULL, NULL, 267, CURRENT_TIMESTAMP),
(12, 2, '2026-03-18', 'Bitacora del capitan hoy trabaje en la wiki y en contribuir segui apoyando a los nuevos y en eso estube', 'Revisar contribuir', 'bien', 0, NULL, 0, NULL, NULL, 222, CURRENT_TIMESTAMP),
(13, 2, '2026-03-19', 'Bitacora del capitan revisamos las tareas realizadas al contribuir para un proximo release pd hoy es dia de jojos se participo de la precentacion de cierre del sensei arturo', 'hacer Release', 'bien', 0, NULL, 0, NULL, NULL, 231, CURRENT_TIMESTAMP),
(14, 2, '2026-03-20', 'no se hizo release si hubieron varios detallitos que ver hoyse revisaron todas lastareas de los demas y corrijieron algunas y participe en mi primer potcast', 'nose', 'bien', 0, NULL, 0, NULL, NULL, 227, CURRENT_TIMESTAMP),
(15, 2, '2026-03-23', 'Bitacora del capitan Hoy en un buen dia para morir hace mucho sueño no hice  muchas cosas hiciemos los realice de kreative cv y de contribuir revisamos si lo correjido estababien luego me puse a leer ver codigo y un curso de AWS se ayudo a los nuevos entro un chico nuevo y eso no habia mucho que hacer', 'nose la verdad', 'bien', 0, NULL, 0, NULL, NULL, 262, CURRENT_TIMESTAMP),
(16, 2, '2026-03-24', 'se ayudo a los nuevos y se intento hacer una reunion para hacer el release en wiki pero quedo pendiente aun', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 222, CURRENT_TIMESTAMP),
(17, 2, '2026-03-25', 'se participo de una reunion para mostrar programas o herramientas mejor decir que usaran ia para ser precentadas para los demas se ayudo a los nuevos con creative y se quedo a pasos de release', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 236, CURRENT_TIMESTAMP),
(18, 2, '2026-03-26', 'se participo de la hackaton presentando ideas y interactuando en pocas palabras fallo', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 214, CURRENT_TIMESTAMP),
(19, 2, '2026-03-27', 'se hizo el deploy de autra collection y se partisipo en un proyecto llamado vaquita web 3.0 y del potcast de la semana', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 224, CURRENT_TIMESTAMP),
(20, 2, '2026-03-30', 'se creo la documentacion y video de aura collection y los mas nuevos hicieron el release de kreative guiados y se hizo la presentacion tambien se inicio un nuevo proyecto', 'continuar con el proyecto', 'bien', 0, NULL, 0, NULL, NULL, 234, CURRENT_TIMESTAMP),
(21, 2, '2026-03-31', 'se contino con autral collection', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 206, CURRENT_TIMESTAMP),
(22, 2, '2026-04-01', 'cambioamos austral collection por aura collection y empezamos a a finar detalles para dejarla de legado', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 217, CURRENT_TIMESTAMP),
(23, 2, '2026-04-02', 'se entrego para legado aura collection para posibles futuras generaciones', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 211, CURRENT_TIMESTAMP),
(24, 2, '2026-04-03', 'se partizipo del potscat  y se me informo de un nuevo proyecto a participar', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 215, CURRENT_TIMESTAMP),
(25, 2, '2026-04-06', 'se me dio detalles de el nuevo proyecto y que el martes habria reunion la cual no puedo participar pero si podria tener un prototipo', 'continuar con el prototipo', 'bien', 0, NULL, 0, NULL, NULL, 229, CURRENT_TIMESTAMP),
(26, 2, '2026-04-07', 'continuamos con el prototipo y pude entregar uno basico para que se pueda combersar con el cliente y entrar a mas detalle en la reunion que no podre participar tambien genere unas preguntas sobre dudas que tenia', 'depende de la reunion', 'bien', 0, NULL, 0, NULL, NULL, 241, CURRENT_TIMESTAMP),
(27, 2, '2026-04-08', 'se me entrego la reunion para visualizarla para trascribirla tambien los detalles y alcance basico del proyecto junto a las respuesta de mis preguntas con todo eso ahora irme bajando a piso la idea', 'trabajar en diagramas y pantallas', 'bien', 0, NULL, 0, NULL, NULL, 239, CURRENT_TIMESTAMP),
(28, 2, '2026-04-09', 'comence a hacer diagramas dudas junto con las historias de usuario para ver las conecciones que deberia implementar y consultas para una proxima reunion y trabaje en otras pantallas', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 230, CURRENT_TIMESTAMP),
(29, 2, '2026-04-10', 'segui trabajando en lo visual para ejemplos sin aun implemnetar funciones bien para ver si las ideas que tenemos con el cliente van para el mismo destino, tambien trabajamos en un proyecto de web3 llamado vaquita y de igualmaneta  hoy igual tube la primera reunion con el donde todo fue grabado para despues retroalimentarme de las cosas comentadas y en base y en su mayoria ibamos hacia el mismo lado con las ideas', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 274, CURRENT_TIMESTAMP),
(30, 2, '2026-04-13', 'se trabajo ahora ya en funciones de la pagina de austral y se guio al equipo en labores que habia que hacer', 'la verdad no lo se', 'bien', 0, NULL, 0, NULL, NULL, 227, CURRENT_TIMESTAMP),
(31, 2, '2026-04-14', 'se hizo como una guia con la ia sobre la web 3 donde habian  ejemplos de como trabajaba por detras y se comberso con pablo guzman para que viniera a dar una charla a todos sobre web3 y continuamos con autrall collection', 'una charla y australl', 'bien', 0, NULL, 0, NULL, NULL, 246, CURRENT_TIMESTAMP),
(32, 2, '2026-04-15', 'se participo de la charla de web3 de Pablo Guzmán continuamos con australl y funciones no recuerdo lo que le dije a los chicos hoy pero creo los hice que hicieran su propio web3 para que practicaran ya llevaban dias estudiando', 'nolose pero si austral', 'bien', 0, NULL, 0, NULL, NULL, 245, CURRENT_TIMESTAMP),
(33, 2, '2026-04-16', 'les di una tarea mas comun y de utilidad a los chicos que era hacer funciones las cuales pueden reciclar para sus proyectos y continue con autral collection', 'nolose pero si austral y la reunion', 'bien', 0, NULL, 0, NULL, NULL, 235, CURRENT_TIMESTAMP),
(34, 2, '2026-04-17', 'continue con australl para la reunion de hoy con el cliente', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 212, CURRENT_TIMESTAMP),
(35, 2, '2026-04-20', 'comenzo el estudio de agentes y continuamos con australl', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 210, CURRENT_TIMESTAMP),
(36, 2, '2026-04-21', 'australl funciones seguirdad', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 204, CURRENT_TIMESTAMP),
(37, 2, '2026-04-22', 'me llego equipo para autral wii', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 207, CURRENT_TIMESTAMP),
(38, 2, '2026-04-23', 'segimos con austral aunque igual todos estos dias le he hechado un ojo a los de lso agentes', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 219, CURRENT_TIMESTAMP),
(39, 2, '2026-04-24', 'ajustes a la documentacion y reunion  con cliente y visente', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 211, CURRENT_TIMESTAMP),
(40, 2, '2026-04-27', 'correcciones Austral Collector', 'no se la verdad', 'bien', 0, NULL, 0, NULL, NULL, 207, CURRENT_TIMESTAMP),
(41, 2, '2026-04-28', 'hoy hice poco estube mas de espectador de todo', 'vercion movil o tablet de austral', 'bien', 0, NULL, 0, NULL, NULL, 215, CURRENT_TIMESTAMP),
(42, 2, '2026-04-29', 'trabaje en la vercion movil de australl', 'vercion movil austral', 'bien', 0, NULL, 0, NULL, NULL, 210, CURRENT_TIMESTAMP),
(43, 2, '2026-04-30', 'segui con el modo movil y le dije a vicente que lo revisara', 'dia del chambeador', 'bien', 0, NULL, 0, NULL, NULL, 216, CURRENT_TIMESTAMP),
(44, 2, '2026-05-01', 'dia libre', 'Seguir avanzando en los proyectos.', 'bien', 0, NULL, 0, NULL, NULL, 203, CURRENT_TIMESTAMP),
(45, 2, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Diseño inicial de la base de datos de Kreative Vit y diagramado estructural.', 'Comenzar a maquetar el frontend en React.', 'excelente', 0, NULL, 0, NULL, NULL, 500, CURRENT_TIMESTAMP),
(46, 2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Integración del sistema de autenticación global con la base de datos local.', 'Crear el panel de compañeros.', 'bien', 0, NULL, 0, NULL, NULL, 650, CURRENT_TIMESTAMP),
(47, 2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Desarrollo del directorio de compañeros y lógica de filtrado por generación.', 'Implementar el modal de insignias y medallas.', 'excelente', 0, NULL, 0, NULL, NULL, 800, CURRENT_TIMESTAMP),
(48, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Creación del sistema de logros, limpieza de base de datos y migración a producción.', 'Pulir detalles finales de interfaz.', 'excelente', 0, NULL, 0, NULL, NULL, 1200, CURRENT_TIMESTAMP),
(49, 2, CURDATE(), 'Despliegue final de Kreative Vit, pruebas de estrés y validación de usuarios.', 'Monitorear la adopción por parte de los practicantes.', 'excelente', 0, NULL, 0, NULL, NULL, 1500, CURRENT_TIMESTAMP);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `generaciones`
--

DROP TABLE IF EXISTS `generaciones`;
CREATE TABLE `generaciones` (
  `id` int(11) NOT NULL,
  `numero` int(4) NOT NULL COMMENT 'Número de generación (ej. 17)',
  `nombre` varchar(100) DEFAULT NULL COMMENT 'Nombre de la generación (ej. Alpha 2R)',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1 = activa, 0 = archivada',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `generaciones`
--

INSERT INTO `generaciones` (`id`, `numero`, `nombre`, `fecha_inicio`, `fecha_fin`, `activa`, `creado_en`) VALUES
(1, 17, 'Generación 17', '2025-03-01', NULL, 1, '2026-05-19 00:21:35'),
(2, 18, 'Generación 18', NULL, NULL, 0, '2026-05-19 00:21:35'),
(3, 19, 'Generación 19', NULL, NULL, 0, '2026-05-19 00:21:35'),
(4, 20, 'Generación 20', NULL, NULL, 0, '2026-05-19 00:21:35'),
(5, 21, 'Generación 21', NULL, NULL, 0, '2026-05-19 00:21:35'),
(6, 22, 'Generación 22', NULL, NULL, 0, '2026-05-19 00:21:35'),
(7, 23, 'Generación 23', NULL, NULL, 0, '2026-05-19 00:21:35'),
(8, 24, 'Generación 24', NULL, NULL, 0, '2026-05-19 00:21:35'),
(9, 25, 'Generación 25', NULL, NULL, 0, '2026-05-19 00:21:35'),
(10, 26, 'Generación 26', NULL, NULL, 0, '2026-05-19 00:21:35'),
(11, 27, 'Generación 27', NULL, NULL, 0, '2026-05-19 00:21:35'),
(12, 28, 'Generación 28', NULL, NULL, 0, '2026-05-19 00:21:35'),
(13, 29, 'Generación 29', NULL, NULL, 0, '2026-05-19 00:21:35'),
(14, 30, 'Generación 30', NULL, NULL, 0, '2026-05-19 00:21:35'),
(15, 31, 'Generación 31', NULL, NULL, 0, '2026-05-19 00:21:35'),
(16, 32, 'Generación 32', NULL, NULL, 0, '2026-05-19 00:21:35'),
(17, 33, 'Generación 33', NULL, NULL, 0, '2026-05-19 00:21:35'),
(18, 34, 'Generación 34', NULL, NULL, 0, '2026-05-19 00:21:35'),
(19, 35, 'Generación 35', NULL, NULL, 0, '2026-05-19 00:21:35'),
(20, 36, 'Generación 36', NULL, NULL, 0, '2026-05-19 00:21:35'),
(21, 37, 'Generación 37', NULL, NULL, 0, '2026-05-19 00:21:35'),
(22, 38, 'Generación 38', NULL, NULL, 0, '2026-05-19 00:21:35'),
(23, 39, 'Generación 39', NULL, NULL, 0, '2026-05-19 00:21:35'),
(24, 40, 'Generación 40', NULL, NULL, 0, '2026-05-19 00:21:35'),
(25, 41, 'Generación 41', NULL, NULL, 0, '2026-05-19 00:21:35'),
(26, 42, 'Generación 42', NULL, NULL, 0, '2026-05-19 00:21:35'),
(27, 43, 'Generación 43', NULL, NULL, 0, '2026-05-19 00:21:35'),
(28, 44, 'Generación 44', NULL, NULL, 0, '2026-05-19 00:21:35'),
(29, 45, 'Generación 45', NULL, NULL, 0, '2026-05-19 00:21:35'),
(30, 46, 'Generación 46', NULL, NULL, 0, '2026-05-19 00:21:35'),
(31, 47, 'Generación 47', NULL, NULL, 0, '2026-05-19 00:21:35'),
(32, 48, 'Generación 48', NULL, NULL, 0, '2026-05-19 00:21:35'),
(33, 49, 'Generación 49', NULL, NULL, 0, '2026-05-19 00:21:35'),
(34, 50, 'Generación 50', NULL, NULL, 0, '2026-05-19 00:21:35'),
(35, 51, 'Generación 51', NULL, NULL, 0, '2026-05-19 00:21:35'),
(36, 52, 'Generación 52', NULL, NULL, 0, '2026-05-19 00:21:35'),
(37, 53, 'Generación 53', NULL, NULL, 0, '2026-05-19 00:21:35'),
(38, 54, 'Generación 54', NULL, NULL, 0, '2026-05-19 00:21:35'),
(39, 55, 'Generación 55', NULL, NULL, 0, '2026-05-19 00:21:35'),
(40, 56, 'Generación 56', NULL, NULL, 0, '2026-05-19 00:21:35'),
(41, 57, 'Generación 57', NULL, NULL, 0, '2026-05-19 00:21:35'),
(42, 58, 'Generación 58', NULL, NULL, 0, '2026-05-19 00:21:35'),
(43, 59, 'Generación 59', NULL, NULL, 0, '2026-05-19 00:21:35'),
(44, 60, 'Generación 60', NULL, NULL, 0, '2026-05-19 00:21:35'),
(45, 61, 'Generación 61', NULL, NULL, 0, '2026-05-19 00:21:35'),
(46, 62, 'Generación 62', NULL, NULL, 0, '2026-05-19 00:21:35'),
(47, 63, 'Generación 63', NULL, NULL, 0, '2026-05-19 00:21:35'),
(48, 64, 'Generación 64', NULL, NULL, 0, '2026-05-19 00:21:35'),
(49, 65, 'Generación 65', NULL, NULL, 0, '2026-05-19 00:21:35'),
(50, 66, 'Generación 66', NULL, NULL, 0, '2026-05-19 00:21:35'),
(51, 67, 'Generación 67', NULL, NULL, 0, '2026-05-19 00:21:35'),
(52, 68, 'Generación 68', NULL, NULL, 0, '2026-05-19 00:21:35'),
(53, 69, 'Generación 69', NULL, NULL, 0, '2026-05-19 00:21:35'),
(54, 70, 'Generación 70', NULL, NULL, 0, '2026-05-19 00:21:35'),
(55, 71, 'Generación 71', NULL, NULL, 0, '2026-05-19 00:21:35'),
(56, 72, 'Generación 72', NULL, NULL, 0, '2026-05-19 00:21:35'),
(57, 73, 'Generación 73', NULL, NULL, 0, '2026-05-19 00:21:35'),
(58, 74, 'Generación 74', NULL, NULL, 0, '2026-05-19 00:21:35'),
(59, 75, 'Generación 75', NULL, NULL, 0, '2026-05-19 00:21:35'),
(60, 76, 'Generación 76', NULL, NULL, 0, '2026-05-19 00:21:35'),
(61, 77, 'Generación 77', NULL, NULL, 0, '2026-05-19 00:21:35'),
(62, 78, 'Generación 78', NULL, NULL, 0, '2026-05-19 00:21:35'),
(63, 79, 'Generación 79', NULL, NULL, 0, '2026-05-19 00:21:35'),
(64, 80, 'Generación 80', NULL, NULL, 0, '2026-05-19 00:21:35'),
(65, 81, 'Generación 81', NULL, NULL, 0, '2026-05-19 00:21:35'),
(66, 82, 'Generación 82', NULL, NULL, 0, '2026-05-19 00:21:35'),
(67, 83, 'Generación 83', NULL, NULL, 0, '2026-05-19 00:21:35'),
(68, 84, 'Generación 84', NULL, NULL, 0, '2026-05-19 00:21:35'),
(69, 85, 'Generación 85', NULL, NULL, 0, '2026-05-19 00:21:35'),
(70, 86, 'Generación 86', NULL, NULL, 0, '2026-05-19 00:21:35'),
(71, 87, 'Generación 87', NULL, NULL, 0, '2026-05-19 00:21:35'),
(72, 88, 'Generación 88', NULL, NULL, 0, '2026-05-19 00:21:35'),
(73, 89, 'Generación 89', NULL, NULL, 0, '2026-05-19 00:21:35'),
(74, 90, 'Generación 90', NULL, NULL, 0, '2026-05-19 00:21:35'),
(75, 91, 'Generación 91', NULL, NULL, 0, '2026-05-19 00:21:35'),
(76, 92, 'Generación 92', NULL, NULL, 0, '2026-05-19 00:21:35'),
(77, 93, 'Generación 93', NULL, NULL, 0, '2026-05-19 00:21:35'),
(78, 94, 'Generación 94', NULL, NULL, 0, '2026-05-19 00:21:35'),
(79, 95, 'Generación 95', NULL, NULL, 0, '2026-05-19 00:21:35'),
(80, 96, 'Generación 96', NULL, NULL, 0, '2026-05-19 00:21:35'),
(81, 97, 'Generación 97', NULL, NULL, 0, '2026-05-19 00:21:35'),
(82, 98, 'Generación 98', NULL, NULL, 0, '2026-05-19 00:21:35'),
(83, 99, 'Generación 99', NULL, NULL, 0, '2026-05-19 00:21:35'),
(84, 100, 'Generación 100', NULL, NULL, 0, '2026-05-19 00:21:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `insignias_desbloqueadas`
--

DROP TABLE IF EXISTS `insignias_desbloqueadas`;
CREATE TABLE `insignias_desbloqueadas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL COMMENT 'FK → usuarios.id',
  `insignia_id` int(11) NOT NULL COMMENT 'ID de la insignia (1-48 según el sistema frontend)',
  `desbloqueada_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `insignias_desbloqueadas`
--

INSERT INTO `insignias_desbloqueadas` (`id`, `usuario_id`, `insignia_id`, `desbloqueada_en`) VALUES
(1, 2, 1, '2026-05-19 00:21:57'),
(2, 2, 2, '2026-05-19 00:21:57'),
(3, 2, 3, '2026-05-19 00:21:57'),
(4, 2, 4, '2026-05-19 00:21:57'),
(5, 2, 5, '2026-05-19 00:21:57'),
(6, 2, 6, '2026-05-19 00:21:57'),
(7, 2, 7, '2026-05-19 00:21:57'),
(8, 2, 8, '2026-05-19 00:21:57'),
(9, 2, 9, '2026-05-19 00:21:57'),
(10, 2, 10, '2026-05-19 00:21:57'),
(11, 2, 11, '2026-05-19 00:21:57'),
(12, 2, 12, '2026-05-19 00:21:57'),
(13, 2, 13, '2026-05-19 00:21:57'),
(14, 2, 14, '2026-05-19 00:21:57'),
(15, 2, 15, '2026-05-19 00:21:57'),
(16, 2, 16, '2026-05-19 00:21:57'),
(17, 2, 17, '2026-05-19 00:21:57'),
(18, 2, 18, '2026-05-19 00:21:57'),
(19, 2, 19, '2026-05-19 00:21:57'),
(20, 2, 20, '2026-05-19 00:21:57'),
(21, 2, 21, '2026-05-19 00:21:57'),
(22, 2, 22, '2026-05-19 00:21:57'),
(23, 2, 23, '2026-05-19 00:21:57'),
(24, 2, 24, '2026-05-19 00:21:57'),
(25, 2, 25, '2026-05-19 00:21:57'),
(26, 2, 26, '2026-05-19 00:21:57'),
(27, 2, 27, '2026-05-19 00:21:57'),
(28, 2, 28, '2026-05-19 00:21:57'),
(29, 2, 41, '2026-05-19 00:21:57'),
(30, 2, 42, '2026-05-19 00:21:57'),
(31, 2, 43, '2026-05-19 00:21:57'),
(32, 2, 44, '2026-05-19 00:21:57'),
(33, 2, 45, '2026-05-19 00:21:57'),
(34, 2, 46, '2026-05-19 00:21:57'),
(35, 2, 48, '2026-05-19 00:21:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesiones_log`
--

DROP TABLE IF EXISTS `sesiones_log`;
CREATE TABLE `sesiones_log` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `accion` varchar(100) DEFAULT 'login' COMMENT 'login | logout | token_refresh',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL COMMENT 'FK → alphadocere_auth_system.clients.id',
  `nombre` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `generacion_id` int(11) DEFAULT NULL COMMENT 'FK → generaciones.id',
  `rol` enum('usuario','lider','admin') NOT NULL DEFAULT 'usuario',
  `avatar_url` text DEFAULT NULL COMMENT 'URL o base64 del avatar personalizado',
  `estado_personal` varchar(255) DEFAULT NULL COMMENT 'Frase de estado visible en el perfil',
  `fecha_ingreso` date DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `client_id`, `nombre`, `email`, `generacion_id`, `rol`, `avatar_url`, `estado_personal`, `fecha_ingreso`, `activo`, `creado_en`, `actualizado_en`) VALUES
(1, 1, 'Mauro Rojas', 'mauro.rojas@alphadocere.cl', 1, 'lider', NULL, 'Liderando Alpha Docere con pasión y propósito.', '2025-03-01', 1, '2026-05-19 00:21:35', '2026-05-19 00:21:35'),
(2, 145, 'Jose Eliecer Rivera Perez', 'rjoseeliecer@gmail.com', 1, 'admin', NULL, 'Construyendo el futuro de Kreative Vit 🚀', '2025-03-01', 1, '2026-05-19 00:21:57', '2026-05-19 00:21:57');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_alertas_pendientes`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_alertas_pendientes` (
`alerta_id` int(11)
,`tipo` enum('ayuda','animo_critico','combinada')
,`creado_en` timestamp
,`leida` tinyint(1)
,`atendida` tinyint(1)
,`email_enviado` tinyint(1)
,`practicante` varchar(120)
,`email_practicante` varchar(120)
,`generacion` int(4)
,`fecha_bitacora` date
,`estado_animo` enum('excelente','bien','regular','cansado','frustrado')
,`necesita_ayuda` tinyint(1)
,`desc_ayuda` text
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_practicantes_resumen`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_practicantes_resumen` (
`id` int(11)
,`nombre` varchar(120)
,`email` varchar(120)
,`rol` enum('usuario','lider','admin')
,`generacion` int(4)
,`nombre_generacion` varchar(100)
,`total_bitacoras` bigint(21)
,`ultima_bitacora` date
,`dias_animo_critico` decimal(22,0)
,`solicitudes_ayuda` decimal(22,0)
,`total_insignias` bigint(21)
,`activo` tinyint(1)
);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alertas_admin`
--
ALTER TABLE `alertas_admin`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_leida` (`leida`),
  ADD KEY `idx_atendida` (`atendida`),
  ADD KEY `fk_alerta_bitacora` (`bitacora_id`),
  ADD KEY `fk_alerta_usuario` (`usuario_id`);

--
-- Indices de la tabla `bitacoras`
--
ALTER TABLE `bitacoras`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_dia_usuario` (`usuario_id`,`fecha`) COMMENT 'Un registro por día por usuario',
  ADD KEY `idx_fecha` (`fecha`),
  ADD KEY `idx_estado_animo` (`estado_animo`),
  ADD KEY `idx_necesita_ayuda` (`necesita_ayuda`),
  ADD KEY `idx_atendido` (`atendido`),
  ADD KEY `fk_bitacora_atendido_por` (`atendido_por`),
  ADD KEY `idx_creado_en` (`creado_en`);

--
-- Indices de la tabla `generaciones`
--
ALTER TABLE `generaciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_numero` (`numero`);

--
-- Indices de la tabla `insignias_desbloqueadas`
--
ALTER TABLE `insignias_desbloqueadas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_usuario_insignia` (`usuario_id`,`insignia_id`),
  ADD KEY `idx_insignia_id` (`insignia_id`);

--
-- Indices de la tabla `sesiones_log`
--
ALTER TABLE `sesiones_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_fecha` (`creado_en`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_client` (`client_id`),
  ADD UNIQUE KEY `unique_email` (`email`),
  ADD KEY `fk_usuario_generacion` (`generacion_id`),
  ADD KEY `idx_activo` (`activo`),
  ADD KEY `idx_rol` (`rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alertas_admin`
--
ALTER TABLE `alertas_admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `bitacoras`
--
ALTER TABLE `bitacoras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `generaciones`
--
ALTER TABLE `generaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT de la tabla `insignias_desbloqueadas`
--
ALTER TABLE `insignias_desbloqueadas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de la tabla `sesiones_log`
--
ALTER TABLE `sesiones_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_alertas_pendientes`
--
DROP TABLE IF EXISTS `v_alertas_pendientes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`alphadocere`@`localhost` SQL SECURITY DEFINER VIEW `v_alertas_pendientes`  AS SELECT `a`.`id` AS `alerta_id`, `a`.`tipo` AS `tipo`, `a`.`creado_en` AS `creado_en`, `a`.`leida` AS `leida`, `a`.`atendida` AS `atendida`, `a`.`email_enviado` AS `email_enviado`, `u`.`nombre` AS `practicante`, `u`.`email` AS `email_practicante`, `g`.`numero` AS `generacion`, `b`.`fecha` AS `fecha_bitacora`, `b`.`estado_animo` AS `estado_animo`, `b`.`necesita_ayuda` AS `necesita_ayuda`, `b`.`desc_ayuda` AS `desc_ayuda` FROM (((`alertas_admin` `a` join `usuarios` `u` on(`a`.`usuario_id` = `u`.`id`)) join `bitacoras` `b` on(`a`.`bitacora_id` = `b`.`id`)) left join `generaciones` `g` on(`u`.`generacion_id` = `g`.`id`)) WHERE `a`.`atendida` = 0 ORDER BY `a`.`creado_en` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_practicantes_resumen`
--
DROP TABLE IF EXISTS `v_practicantes_resumen`;

CREATE ALGORITHM=UNDEFINED DEFINER=`alphadocere`@`localhost` SQL SECURITY DEFINER VIEW `v_practicantes_resumen`  AS SELECT `u`.`id` AS `id`, `u`.`nombre` AS `nombre`, `u`.`email` AS `email`, `u`.`rol` AS `rol`, `g`.`numero` AS `generacion`, `g`.`nombre` AS `nombre_generacion`, count(distinct `b`.`id`) AS `total_bitacoras`, max(`b`.`fecha`) AS `ultima_bitacora`, sum(case when `b`.`estado_animo` in ('frustrado','cansado') then 1 else 0 end) AS `dias_animo_critico`, sum(case when `b`.`necesita_ayuda` = 1 then 1 else 0 end) AS `solicitudes_ayuda`, count(distinct `i`.`insignia_id`) AS `total_insignias`, `u`.`activo` AS `activo` FROM (((`usuarios` `u` left join `generaciones` `g` on(`u`.`generacion_id` = `g`.`id`)) left join `bitacoras` `b` on(`b`.`usuario_id` = `u`.`id`)) left join `insignias_desbloqueadas` `i` on(`i`.`usuario_id` = `u`.`id`)) GROUP BY `u`.`id`, `u`.`nombre`, `u`.`email`, `u`.`rol`, `g`.`numero`, `g`.`nombre`, `u`.`activo` ;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alertas_admin`
--
ALTER TABLE `alertas_admin`
  ADD CONSTRAINT `fk_alerta_bitacora` FOREIGN KEY (`bitacora_id`) REFERENCES `bitacoras` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_alerta_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `bitacoras`
--
ALTER TABLE `bitacoras`
  ADD CONSTRAINT `fk_bitacora_atendido_por` FOREIGN KEY (`atendido_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_bitacora_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `insignias_desbloqueadas`
--
ALTER TABLE `insignias_desbloqueadas`
  ADD CONSTRAINT `fk_insignia_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `sesiones_log`
--
ALTER TABLE `sesiones_log`
  ADD CONSTRAINT `fk_sesion_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuario_generacion` FOREIGN KEY (`generacion_id`) REFERENCES `generaciones` (`id`) ON DELETE SET NULL;
  
SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
