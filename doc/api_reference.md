# 📡 Referencia de API — Kreative Vit

Todos los endpoints están ubicados en `/api/` y devuelven JSON con `Content-Type: application/json; charset=UTF-8`.

## Base URL

```
https://test-systemauth.alphadocere.cl/api/
```

---

## `GET /api/fetchLogs.php`

Obtiene todos los datos del dashboard: bitácoras, compañeros activos e insignias desbloqueadas.

### Respuesta Exitosa `200`

```json
{
  "success": true,
  "bitacoras": [
    {
      "id": 42,
      "user": "José Rivera",
      "practicante": "José Rivera",
      "fecha": "2026-05-23",
      "hechoHoy": "Implementé el sistema de insignias y arreglé el bug del streak.",
      "hacerManana": "Escribir la documentación del proyecto.",
      "mood": "bien",
      "ayuda": false,
      "ayudaDesc": null,
      "palabrasCount": 18
    }
  ],
  "fellows": [
    {
      "username": "José Rivera",
      "generation": 17,
      "status": "¡Programando con pasión!",
      "avatar": null,
      "badges": [47, 28],
      "streak": 0,
      "totalLogs": 0
    }
  ],
  "debug": {
    "db": "alphadocere_Vit",
    "env_found": true,
    "bitacoras_count": 1,
    "fellows_count": 1,
    "badge_users": ["José Rivera"]
  }
}
```

### Respuesta de Error `500`

```json
{
  "success": false,
  "error": "Error de conexión a la base de datos: ...",
  "debug": {
    "env_path": "/ruta/al/.env",
    "env_exists": false
  }
}
```

### Notas

- No requiere autenticación (el token se verifica en el lado del cliente)
- Las insignias en `fellows[].badges` son IDs persistidos en `insignias_desbloqueadas`
- El campo `streak` y `totalLogs` se calculan del lado del cliente

---

## `POST /api/saveLog.php`

Guarda una nueva bitácora del usuario en la base de datos MySQL.

### Headers

```
Content-Type: application/json
```

### Body

```json
{
  "email": "usuario@ejemplo.com",
  "fecha": "2026-05-23",
  "hechoHoy": "Texto de lo que hice hoy...",
  "hacerManana": "Texto de lo que haré mañana...",
  "mood": "bien",
  "ayuda": false,
  "ayudaDesc": null,
  "palabrasCount": 25
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `email` | string | ✅ | Email del usuario (identificador) |
| `fecha` | string | ✅ | Fecha en formato `YYYY-MM-DD` |
| `hechoHoy` | string | ✅ | Texto de actividades realizadas hoy |
| `hacerManana` | string | ❌ | Texto de planificación para mañana |
| `mood` | string | ❌ | Estado de ánimo: `"bien"`, `"cansado"`, `"frustrado"`, `"inspirado"` |
| `ayuda` | boolean | ❌ | `true` si necesita ayuda técnica |
| `ayudaDesc` | string | ❌ | Descripción del problema técnico |
| `palabrasCount` | number | ❌ | Conteo de palabras del texto |

### Respuesta Exitosa `200`

```json
{
  "success": true,
  "message": "Bitácora guardada permanentemente en MySQL."
}
```

### Respuesta de Error `400`

```json
{
  "success": false,
  "error": "Datos incompletos."
}
```

### Respuesta de Error `500`

```json
{
  "success": false,
  "error": "Usuario no encontrado en la base de datos."
}
```

---

## `POST /api/send_alert.php`

Envía una alerta por email a los administradores cuando un practicante reporta un estado emocional crítico o solicita ayuda técnica.

### Trigger de Alerta

La alerta **solo se envía** si:
- `mood` es `"frustrado"` o `"cansado"`, **O**
- `needsHelp` es `true`

### Headers

```
Content-Type: application/json
```

### Body

```json
{
  "user": "José Rivera",
  "email": "jose@ejemplo.com",
  "mood": "frustrado",
  "needsHelp": true,
  "helpDesc": "Tengo un bug en el sistema de autenticación que no puedo resolver.",
  "fecha": "2026-05-23",
  "hechoHoy": "Intenté arreglar el sistema de login durante 4 horas.",
  "hacerManana": "Pedir ayuda y revisar la documentación de JWT."
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `user` | string | ✅ | Nombre del practicante |
| `email` | string | ✅ | Email del practicante |
| `mood` | string | ✅ | Estado de ánimo actual |
| `needsHelp` | boolean | ❌ | Si solicitó ayuda técnica activa |
| `helpDesc` | string | ❌ | Descripción del bloqueo técnico |
| `fecha` | string | ❌ | Fecha de la bitácora |
| `hechoHoy` | string | ❌ | Texto de actividades del día |
| `hacerManana` | string | ❌ | Texto de planificación |

### Respuesta — Sin Alerta Necesaria

```json
{
  "success": true,
  "message": "No requiere alerta."
}
```

### Respuesta Exitosa `200`

```json
{
  "success": true,
  "message": "Alerta procesada desde el backend local de Vit.",
  "admins_notified": 1,
  "sent": true
}
```

### Respuesta de Error `500`

```json
{
  "success": false,
  "message": "Error al procesar alerta: ..."
}
```

---

## `GET /api/stats.php`

Obtiene estadísticas públicas para la landing page: generación activa y número de usuarios.

### Respuesta Exitosa `200`

```json
{
  "success": true,
  "generation": 17,
  "active_users": 8
}
```

### Notas

- Este endpoint **no requiere autenticación**
- Si la BD no está disponible, devuelve un fallback elegante con `generation: 17` y `active_users: 2`
- Se usa en `Home.jsx` para mostrar el contador animado de usuarios

---

## `GET /api/debug_env.php`

Endpoint de diagnóstico para verificar que las variables de entorno se carguen correctamente.

> ⚠️ **Solo usar en desarrollo.** Eliminar o proteger en producción.

### Respuesta

```json
{
  "env_path": "/ruta/completa/.env",
  "env_exists": true,
  "vars_loaded": {
    "DB_HOST": "localhost",
    "DB_NAME": "alphadocere_Vit"
  }
}
```

---

## Manejo de CORS

Todos los endpoints incluyen los siguientes headers para permitir peticiones desde el frontend:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

Las peticiones `OPTIONS` (preflight) son respondidas con `200` inmediatamente.
