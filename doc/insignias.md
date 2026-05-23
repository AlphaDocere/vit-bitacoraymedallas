# 🏅 Sistema de Insignias — Kreative Vit

## Descripción General

El sistema de insignias de Kreative Vit es un motor de gamificación que motiva a los practicantes a mantener una práctica consistente de auto-documentación. Las insignias se calculan **dinámicamente** en el frontend usando `badgeHelper.js` y se persisten en la tabla `insignias_desbloqueadas` de MySQL.

## Flujo de Desbloqueo

```
Usuario guarda bitácora
        │
        ▼
DashboardLayout.useEffect()
        │
        ▼
calculateUserBadges(username, generation, bitacoras)
        │
        ├── Compara con badges ya reconocidas (localStorage)
        │
        └── Si hay nuevas → muestra CelebrationOverlay con confeti
                               │
                               └── Usuario presiona "¡Excelente! 🚀"
                                           │
                                           └── Badge se agrega a acknowledged[]
```

## Categorías de Insignias

### 📊 Bloque 1 — Hitos de Cantidad

| ID | Nombre | Requisito | Color |
|---|---|---|---|
| 1 | Mente Abierta | 1 bitácora | 🟡 #facc15 |
| 3 | Mente Ligera | 7 bitácoras | 🟡 #fbbf24 |
| 5 | Cable a Tierra | 15 bitácoras | 🔵 #3b82f6 |
| 7 | Zis-Zas Mental | 21 bitácoras | 🩷 #ec4899 |
| 8 | Hábitat de Calma | 30 bitácoras | 🟢 #10b981 |
| 10 | Paso a Paso | 45 bitácoras | 🟣 #8b5cf6 |
| 12 | Escudo de Papel | 60 bitácoras | ⚫ #64748b |
| 14 | Foco Claro | 75 bitácoras | 🩷 #d946ef |
| 16 | Maestría Interior | 90 bitácoras | 🟡 #eab308 |

### 🔥 Bloque 2 — Rachas de Días Consecutivos

| ID | Nombre | Requisito | Color |
|---|---|---|---|
| 2 | Primer Impulso | Racha de 3 días | 🟠 #f97316 |
| 4 | Semana Imparable | Racha de 7 días | 🔴 #ef4444 |
| 6 | Ritmo Constante | Racha de 14 días | 🟣 #6366f1 |
| 9 | Mes Inquebrantable | Racha de 30 días | 🔵 #06b6d4 |
| 11 | Flujo de Paz | Racha de 45 días | 🩵 #14b8a6 |
| 13 | Mente de Acero | Racha de 60 días | ⚪ #94a3b8 |
| 15 | Faro en la Tormenta | Racha de 75 días | 🟡 #f59e0b |
| 17 | Zen Absoluto | Racha de 90 días | 🟡 #fbbf24 |

### ✍️ Bloque 3 — Escritura Interior (Palabras)

| ID | Nombre | Requisito | Color |
|---|---|---|---|
| 19 | Bitácora Viva | 5,000 palabras acumuladas | 🩵 #34d399 |
| 20 | Mente en Movimiento | 10,000 palabras acumuladas | 🔵 #3b82f6 |
| 21 | Archivo Interior | 25,000 palabras acumuladas | 🟣 #a855f7 |

### 🕐 Bloque 4 — Rituales del Día (Horario)

| ID | Nombre | Requisito | Color |
|---|---|---|---|
| 22 | Noctámbulo Sereno | Escribir entre 22:00 – 00:00 | ⬛ #1e1b4b |
| 23 | Último Esfuerzo | Escribir entre 00:00 – 04:00 | 🔴 #ef4444 |
| 24 | Inicio Ligero | Escribir entre 06:00 – 09:00 | 🟡 #facc15 |

### 💪 Bloque 5 — Resiliencia Emocional

| ID | Nombre | Requisito | Color |
|---|---|---|---|
| 25 | Volver a Empezar | Tener una pausa >3 días y regresar | 🟢 #10b981 |
| 26 | Sigue Adelante | Retomar y continuar después de la pausa | — |
| 27 | Constancia Real | 60 bitácoras (no consecutivas) | — |

### 🛠️ Bloque 6 — Habilidades Técnicas (Análisis de Texto)

Estas insignias se desbloquean automáticamente si el texto de las bitácoras contiene palabras clave específicas:

| ID | Nombre | Palabras Clave | Color |
|---|---|---|---|
| 41 | Git Master | `git` + `rama` | 🔴 #f05032 |
| 42 | cPanel Explorer | `cpanel` | 🟠 #ff7600 |
| 43 | Wiki Contribuidor | `wiki` + verbos de acción | 🔵 #3b82f6 |
| 44 | Voz Activa | `podcast` + verbos de participación | 🩷 #ec4899 |
| 45 | Matriz de Eisenhower | `eisenhower` o `matriz` + priorización | 🟢 #328f49 |
| 46 | Bug Hunter | `bug`, `fix`, o `correg`+`error` | 🔴 #ef4444 |

**Verbos de acción para Wiki:** `publiqu`, `escrib`, `actualiz`, `aport`, `subi`, `cre`, `redact`

**Verbos de participación para Podcast:** `particip`, `grab`, `habl`, `estuv`, `asist`, `invit`

### ⭐ Insignias Especiales

| ID | Nombre | Condición | Color |
|---|---|---|---|
| 18 | El Creador | `username === 'Jose Eliecer Rivera Perez'` | 🟢 #39ff14 |
| 47 | Líder Alpha Docere | `username === 'Mauro Rojas'` | 🟡 #facc15 |
| 48 | Miembro de la Comunidad | Usuarios no pertenecientes a generaciones | 🟣 #a855f7 |

### 🎓 Insignias de Generación

| Rango de Gen | ID Asignado | Ejemplo |
|---|---|---|
| Gen 17 | 28 | Generación 17 |
| Gen 18–29 | 29–40 | Gen 18 → ID 29, Gen 19 → ID 30, ... |
| Gen 30–58 | 100+genNum | Gen 30 → ID 130, Gen 31 → ID 131, ... |
| Gen > 58 | 200 | Gen Forever |

## Esquema de Base de Datos

### Tabla `insignias_desbloqueadas`

```sql
CREATE TABLE insignias_desbloqueadas (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id  INT UNSIGNED NOT NULL,
    insignia_id INT UNSIGNED NOT NULL,
    desbloqueada_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_badge (usuario_id, insignia_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

## Modal de Celebración

Al desbloquear una nueva insignia, el sistema muestra un overlay cinematográfico con:

- 🎉 45 partículas de confeti animadas
- 🪙 Moneda 3D girando 1080° (3 vueltas completas)
- ✨ Efecto de llamas (`flame-particle`) alrededor de la moneda
- 💬 Nombre y descripción de la insignia
- 🎨 Border y glow del color único de la insignia

El usuario confirma con **"¡Excelente! 🚀"**, y automáticamente se muestra la siguiente insignia pendiente (si hay más en cola).

## Algoritmo de Racha

```js
calculateStreak(username, bitacoras):
  1. Filtrar bitácoras del usuario
  2. Obtener fechas únicas ordenadas DESC
  3. Si la fecha más reciente no es hoy ni ayer → racha = 0
  4. Contar días consecutivos hacia atrás desde la fecha más reciente
  5. Retornar el conteo
```

El campo `timestamp` de cada bitácora se usa para determinar el horario (rituales del día).
