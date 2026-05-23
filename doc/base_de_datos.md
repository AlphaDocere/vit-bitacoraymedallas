# 🗄️ Base de Datos — Kreative Vit

## Bases de Datos Utilizadas

El sistema usa **dos bases de datos MySQL** separadas:

| BD | Nombre | Propósito |
|---|---|---|
| Auth | `alphadocere_auth_system` | Autenticación de usuarios, roles, sesiones |
| Vit | `alphadocere_Vit` | Bitácoras, usuarios, insignias, generaciones |

---

## Base de Datos: `alphadocere_Vit`

### Tabla `usuarios`

Almacena los practicantes registrados en el sistema Kreative Vit.

```sql
CREATE TABLE usuarios (
    id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre            VARCHAR(100)  NOT NULL,
    email             VARCHAR(150)  NOT NULL UNIQUE,
    generacion_id     INT UNSIGNED  NULL,
    activo            TINYINT(1)    NOT NULL DEFAULT 1,
    estado_personal   VARCHAR(255)  NULL,
    avatar_url        TEXT          NULL,
    created_at        DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (generacion_id) REFERENCES generaciones(id) ON DELETE SET NULL
);
```

| Columna | Descripción |
|---|---|
| `id` | Identificador único |
| `nombre` | Nombre completo del practicante |
| `email` | Email (se usa como login key desde auth_system) |
| `generacion_id` | FK a la generación Alpha a la que pertenece |
| `activo` | `1` = activo, `0` = inactivo/baja |
| `estado_personal` | Frase de estado personalizable |
| `avatar_url` | URL de la foto de perfil |

---

### Tabla `generaciones`

Registra las generaciones Alpha de Alpha Docere.

```sql
CREATE TABLE generaciones (
    id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    numero  INT          NOT NULL UNIQUE,
    nombre  VARCHAR(100) NULL,
    activa  TINYINT(1)   NOT NULL DEFAULT 0,
    inicio  DATE         NULL,
    fin     DATE         NULL
);
```

| Columna | Descripción |
|---|---|
| `numero` | Número de la generación (17, 18, 19...) |
| `activa` | Solo `1` generación puede estar activa a la vez |
| `inicio` / `fin` | Fechas del período de la generación |

**Query usada en `stats.php`:**
```sql
SELECT numero FROM generaciones WHERE activa = 1 ORDER BY id DESC LIMIT 1
```

---

### Tabla `bitacoras`

Registros diarios de los practicantes.

```sql
CREATE TABLE bitacoras (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT UNSIGNED NOT NULL,
    fecha           DATE         NOT NULL,
    hecho_hoy       TEXT         NOT NULL,
    hacer_manana    TEXT         NULL,
    estado_animo    VARCHAR(20)  NOT NULL DEFAULT 'bien',
    necesita_ayuda  TINYINT(1)   NOT NULL DEFAULT 0,
    desc_ayuda      TEXT         NULL,
    palabras_count  INT UNSIGNED NOT NULL DEFAULT 0,
    timestamp       DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

| Columna | Descripción |
|---|---|
| `usuario_id` | FK al usuario propietario |
| `fecha` | Fecha de la bitácora (`YYYY-MM-DD`) |
| `hecho_hoy` | Texto de actividades realizadas |
| `hacer_manana` | Texto de planificación |
| `estado_animo` | `bien`, `cansado`, `frustrado`, `inspirado` |
| `necesita_ayuda` | `1` si solicitó ayuda técnica |
| `desc_ayuda` | Descripción del bloqueo técnico |
| `palabras_count` | Total de palabras escritas |
| `timestamp` | Fecha y hora exacta de registro |

**Índices recomendados:**
```sql
CREATE INDEX idx_bitacoras_usuario ON bitacoras(usuario_id);
CREATE INDEX idx_bitacoras_fecha ON bitacoras(fecha);
```

---

### Tabla `insignias_desbloqueadas`

Registro permanente de insignias ganadas por cada usuario.

```sql
CREATE TABLE insignias_desbloqueadas (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT UNSIGNED NOT NULL,
    insignia_id     INT UNSIGNED NOT NULL,
    desbloqueada_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_badge (usuario_id, insignia_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

| Columna | Descripción |
|---|---|
| `usuario_id` | FK al usuario |
| `insignia_id` | ID de la insignia (ver `insignias.md`) |
| `desbloqueada_at` | Timestamp de desbloqueo |

La restricción `UNIQUE KEY unique_user_badge` garantiza **idempotencia**: una insignia no puede otorgarse dos veces al mismo usuario.

---

## Queries Principales

### Obtener todas las bitácoras con usuario

```sql
SELECT
    b.id,
    u.nombre        AS user,
    u.nombre        AS practicante,
    b.fecha         AS fecha,
    b.hecho_hoy     AS hechoHoy,
    b.hacer_manana  AS hacerManana,
    b.estado_animo  AS mood,
    b.necesita_ayuda AS ayuda,
    b.desc_ayuda    AS ayudaDesc,
    b.palabras_count AS palabrasCount
FROM bitacoras b
JOIN usuarios u ON b.usuario_id = u.id
ORDER BY b.fecha DESC, b.id DESC
```

### Obtener insignias por usuario

```sql
SELECT u.nombre AS username, i.insignia_id
FROM insignias_desbloqueadas i
JOIN usuarios u ON i.usuario_id = u.id
```

### Obtener fellows activos

```sql
SELECT
    u.nombre        AS username,
    COALESCE(g.numero, 17) AS generation,
    COALESCE(u.estado_personal, '¡Practicando en Kreative Vit!') AS status,
    u.avatar_url    AS avatar
FROM usuarios u
LEFT JOIN generaciones g ON u.generacion_id = g.id
WHERE u.activo = 1
```

### Insertar bitácora

```sql
INSERT INTO bitacoras 
(usuario_id, fecha, hecho_hoy, hacer_manana, estado_animo, necesita_ayuda, desc_ayuda, palabras_count)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
```

---

## Relaciones entre Tablas

```
generaciones (1)
    │
    └─── (N) usuarios
                │
                ├─── (N) bitacoras
                │
                └─── (N) insignias_desbloqueadas
```

---

## Dump de Base de Datos

El archivo `alphadocere_Vit.sql` en la raíz del proyecto contiene el dump completo de la estructura y datos iniciales de ejemplo.

Para restaurar:

```bash
mysql -u root -p alphadocere_Vit < alphadocere_Vit.sql
```
