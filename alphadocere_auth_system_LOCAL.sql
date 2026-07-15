-- ============================================================
--  KREATIVE VIT — BASE DE DATOS AUTH (SIMULADA LOCAL)
--  Base de datos: alphadocere_auth_system
--  Propósito: Simular el sistema auth de producción para dev
--  Generada automáticamente por setup.bat
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- ============================================================
-- TABLA: clients  (usuarios globales del sistema auth)
-- ============================================================
DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (
  `id`                  int(11)      NOT NULL AUTO_INCREMENT,
  `email`               varchar(120) NOT NULL,
  `password`            varchar(255) NOT NULL DEFAULT 'temporal',
  `nombre`              varchar(120) NOT NULL,
  `company`             varchar(120) DEFAULT NULL,
  `ciudad`              varchar(100) DEFAULT NULL,
  `location`            varchar(100) DEFAULT NULL,
  `phone`               varchar(30)  DEFAULT NULL,
  `description`         text         DEFAULT NULL,
  `photo`               text         DEFAULT NULL,
  `status`              enum('active','pending','banned') NOT NULL DEFAULT 'active',
  `token_verificacion`  varchar(64)  DEFAULT NULL,
  `creado_en`           timestamp    NOT NULL DEFAULT current_timestamp(),
  `actualizado_en`      timestamp    NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Usuarios globales del ecosistema Alpha Docere';

-- ============================================================
-- TABLA: proyectos  (Kreative, Match, Wiki, Vit, etc.)
-- ============================================================
DROP TABLE IF EXISTS `proyectos`;
CREATE TABLE `proyectos` (
  `id_proyecto`     int(11)      NOT NULL AUTO_INCREMENT,
  `nombre_proyecto` varchar(80)  NOT NULL,
  `descripcion`     text         DEFAULT NULL,
  `activo`          tinyint(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_proyecto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: roles  (roles por proyecto)
-- ============================================================
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id_rol`      int(11)      NOT NULL AUTO_INCREMENT,
  `nombre_rol`  varchar(80)  NOT NULL,
  `proyecto_id` int(11)      NOT NULL,
  `estado_rol`  enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `nivel`       int(3)       NOT NULL DEFAULT 1 COMMENT '1=visitante … 99=superadmin',
  PRIMARY KEY (`id_rol`),
  KEY `fk_rol_proyecto` (`proyecto_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLA: usuarios_roles_proyectos  (asignación usuario⟷rol⟷proyecto)
-- ============================================================
DROP TABLE IF EXISTS `usuarios_roles_proyectos`;
CREATE TABLE `usuarios_roles_proyectos` (
  `id`          int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id`  int(11) NOT NULL,
  `proyecto_id` int(11) NOT NULL,
  `rol_id`      int(11) NOT NULL,
  `asignado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_usuario_proyecto` (`usuario_id`,`proyecto_id`),
  KEY `fk_urp_usuario`  (`usuario_id`),
  KEY `fk_urp_proyecto` (`proyecto_id`),
  KEY `fk_urp_rol`      (`rol_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DATOS: Proyectos del ecosistema
-- ============================================================
INSERT INTO `proyectos` (`id_proyecto`, `nombre_proyecto`, `descripcion`, `activo`) VALUES
(1,  'Kreative',      'Plataforma principal Kreative CV',     1),
(2,  'Match',         'Sistema de matching Alpha Docere',     1),
(3,  'Wiki',          'Base de conocimiento colaborativa',    1),
(4,  'Kreative Vit',  'Panel de bienestar para practicantes', 1);

-- ============================================================
-- DATOS: Roles por proyecto
-- ============================================================
INSERT INTO `roles` (`id_rol`, `nombre_rol`, `proyecto_id`, `estado_rol`, `nivel`) VALUES
-- Kreative (proyecto 1)
(1,  'admin_k',       1, 'activo', 90),
(2,  'lider_k',       1, 'activo', 70),
(3,  'practicante_k', 1, 'activo', 30),
(4,  'visitante_k',   1, 'activo',  1),
-- Match (proyecto 2)
(5,  'admin_mc',      2, 'activo', 90),
(6,  'lider_mc',      2, 'activo', 70),
(7,  'usuario_mc',    2, 'activo', 30),
(8,  'visitante_mc',  2, 'activo',  1),
-- Wiki (proyecto 3)
(9,  'admin_wiki',    3, 'activo', 90),
(10, 'editor_wiki',   3, 'activo', 50),
(11, 'lector_wiki',   3, 'activo', 10),
-- Kreative Vit (proyecto 4)
(12, 'admin_vit',     4, 'activo', 90),
(13, 'lider_vit',     4, 'activo', 70),
(14, 'practicante_vit',4,'activo', 30);

-- ============================================================
-- DATOS: Usuarios base (contraseñas ignoradas en local dev)
-- ID 1  → Mauro Rojas  (client_id referenciado en alphadocere_Vit)
-- ID 145 → Joseph (client_id real en producción)
-- ============================================================
INSERT INTO `clients` (`id`, `email`, `password`, `nombre`, `company`, `status`) VALUES
(1,   'mrojas@alphadocere.cl',   'LOCAL_NO_AUTH', 'Mauro Rojas',              'Alpha Docere', 'active'),
(145, 'rjoseeliecer@gmail.com',  'LOCAL_NO_AUTH', 'Jose Eliecer Rivera Perez','Alpha Docere', 'active');

-- ============================================================
-- DATOS: Asignación de roles
-- ============================================================
INSERT INTO `usuarios_roles_proyectos` (`usuario_id`, `proyecto_id`, `rol_id`) VALUES
-- Mauro: líder en todos
(1, 1, 2),   -- lider_k
(1, 2, 6),   -- lider_mc
(1, 3, 10),  -- editor_wiki
(1, 4, 13),  -- lider_vit
-- Joseph: admin en todos
(145, 1, 1),   -- admin_k
(145, 2, 5),   -- admin_mc
(145, 3, 9),   -- admin_wiki
(145, 4, 12);  -- admin_vit

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
