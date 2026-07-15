# 🚀 Kreative Vit — Guía de Levantamiento Local

> **Stack:** React + Vite · PHP 8.x · MySQL/MariaDB · Composer · Node.js  
> **SO:** Windows (XAMPP recomendado)

---

## 📋 Requisitos previos

Antes de empezar asegúrate de tener instalado:

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| **XAMPP** (Apache + MySQL) | 8.x | https://www.apachefriends.org |
| **Node.js** | 18 LTS | https://nodejs.org |
| **Composer** | 2.x | https://getcomposer.org |
| **Git** | cualquiera | https://git-scm.com |

> ⚠️ **Importante:** El binario `mysql` de XAMPP suele estar en `C:\xampp\mysql\bin`.  
> Agrégalo al PATH del sistema para que el `setup.bat` lo encuentre.
>
> **Cómo agregar al PATH:**  
> `Inicio → Editar las variables de entorno del sistema → Variables de entorno → Path → Nuevo`  
> Pega la ruta: `C:\xampp\mysql\bin`

---

## 📁 Estructura del proyecto

```
kreative Vit/
│
├── 📄 setup.bat                          ← Script de instalación interactivo
├── 📄 .env                               ← Generado por setup.bat (NO subir a git)
├── 📄 .env.example                       ← Plantilla de variables
│
├── 🗄️ alphadocere_Vit.sql               ← BD principal (bitácoras, usuarios, insignias)
├── 🗄️ alphadocere_auth_system_LOCAL.sql ← BD auth SIMULADA para desarrollo local
│
├── 📁 api/                               ← Backend PHP
│   ├── config.php                        ← Configuración de conexiones y mailer
│   ├── saveLog.php                       ← Guardar bitácoras
│   ├── fetchLogs.php                     ← Obtener bitácoras
│   ├── send_alert.php                    ← Envío de alertas emocionales
│   ├── stats.php                         ← Estadísticas del dashboard
│   └── composer.json                     ← Dependencias PHP
│
├── 📁 src/                               ← Frontend React
│   ├── pages/
│   ├── components/
│   └── layout/
│
└── 📁 patch_auth_system/                 ← Scripts de registro y roles (sistema auth)
    ├── register.php
    └── roles.php
```

---

## 🗄️ Arquitectura de Bases de Datos

El proyecto usa **dos bases de datos** con conexiones independientes:

```
┌─────────────────────────────────┐     ┌──────────────────────────────────────┐
│   alphadocere_auth_system       │     │   alphadocere_Vit                    │
│   (Sistema global de auth)      │     │   (BD principal del panel)           │
│─────────────────────────────────│     │──────────────────────────────────────│
│ clients                         │     │ usuarios          (client_id → FK)   │
│ proyectos                       │◄────│ bitacoras                            │
│ roles                           │     │ generaciones                         │
│ usuarios_roles_proyectos        │     │ insignias_desbloqueadas              │
└─────────────────────────────────┘     │ alertas_admin                        │
                                        │ sesiones_log                         │
                                        └──────────────────────────────────────┘
         ▲ Variables .env                         ▲ Variables .env
         DB_*_AUTH                                DB_*_VIT
```

| BD | Propósito | Archivo SQL |
|---|---|---|
| `alphadocere_auth_system` | Login, roles por proyecto, usuarios globales | `alphadocere_auth_system_LOCAL.sql` |
| `alphadocere_Vit` | Bitácoras, insignias, alertas, sesiones | `alphadocere_Vit.sql` |

> 📝 **En local**, la BD `auth` es **simulada**. Los usuarios tienen contraseña `LOCAL_NO_AUTH` — la autenticación real la maneja el servidor de producción de Alpha Docere.

---

## ⚡ Levantamiento paso a paso

### Paso 1 — Iniciar MySQL en XAMPP

1. Abre el **XAMPP Control Panel**
2. Haz clic en **Start** junto a **MySQL**
3. Verifica que el indicador quede en verde

---

### Paso 2 — Clonar o ubicar el proyecto

```powershell
# Si tienes acceso al repositorio:
git clone <url-del-repo> "kreative Vit"
cd "kreative Vit"

# Si ya tienes la carpeta:
cd "c:\Users\<TuUsuario>\Documents\kreative Vit"
```

---

### Paso 3 — Ejecutar `setup.bat`

Haz **doble clic** en `setup.bat` o desde PowerShell:

```powershell
.\setup.bat
```

Aparecerá el menú interactivo:

```
╔══════════════════════════════════════════════════════╗
║          KREATIVE VIT — SETUP LOCAL v1.0             ║
╠══════════════════════════════════════════════════════╣
║  [1] Instalacion completa (primera vez)              ║
║  [2] Importar solo las BDs                           ║
║  [3] Crear / regenerar archivo .env                  ║
║  [4] Instalar dependencias PHP (composer)            ║
║  [5] Instalar dependencias Node (npm)                ║
║  [6] Gestionar roles de usuario                      ║
║  [7] Agregar practicante de prueba                   ║
║  [8] Ver usuarios registrados                        ║
║  [9] Iniciar servidor de desarrollo (npm run dev)    ║
║  [0] Salir                                           ║
╚══════════════════════════════════════════════════════╝
```

**Selecciona `[1] Instalación completa`** para la primera vez.

El script ejecutará automáticamente:
- ✅ Crear e importar `alphadocere_auth_system`
- ✅ Crear e importar `alphadocere_Vit`
- ✅ Generar el archivo `.env`
- ✅ `composer install` en `/api`
- ✅ `npm install` en la raíz

---

### Paso 4 — Verificar el `.env` generado

El bat crea el `.env` en la raíz. Revisa que se vea así:

```env
# BD Auth (simulada local)
DB_HOST_AUTH=localhost
DB_USER_AUTH=root
DB_PASS_AUTH=
DB_NAME_AUTH=alphadocere_auth_system
DB_PORT_AUTH=3306

# BD Kreative Vit
DB_HOST_VIT=localhost
DB_USER_VIT=root
DB_PASS_VIT=
DB_NAME_VIT=alphadocere_Vit
DB_PORT_VIT=3306

# Aplicación
SITE_URL=http://localhost
APP_NAME=Kreative Vit
JWT_SECRET=local_dev_secret_123
JWT_EXPIRY=86400

# SMTP (vacío = no envía correos en local)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=noreply@localhost
MAIL_FROM_NAME=Kreative Vit Local

# Admin Vit Secret
ADMIN_VIT_SECRET=Joseph_vit
```

> ⚠️ Si tu MySQL tiene contraseña, edita la línea `set MYSQL_PASS=` dentro de `setup.bat` antes de ejecutarlo.

---

### Paso 5 — Iniciar el servidor de desarrollo

Desde el menú selecciona **`[9]`** o directamente:

```powershell
npm run dev
```

```
  VITE v5.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

---

### Paso 6 — Configurar Apache para la API PHP

La API PHP debe servirse mediante Apache (XAMPP).

**Opción A — Virtual Host (recomendada):**

1. Copia la carpeta del proyecto a `C:\xampp\htdocs\kreative-vit\`
2. O crea un enlace simbólico:
   ```powershell
   # PowerShell como Administrador
   New-Item -ItemType SymbolicLink `
     -Path "C:\xampp\htdocs\kreative-vit" `
     -Target "C:\Users\<TuUsuario>\Documents\kreative Vit"
   ```
3. La API quedará en: `http://localhost/kreative-vit/api/`

**Opción B — Apuntar directamente en vite.config.js:**

```js
// vite.config.js — proxy ya configurado
server: {
  proxy: {
    '/api': 'http://localhost/kreative-vit'
  }
}
```

---

## 👥 Gestión de roles y usuarios

### Ver usuarios registrados — opción `[8]`

Muestra una tabla con todos los usuarios de ambas BDs y sus roles asignados.

### Cambiar rol de un usuario — opción `[6]`

```
Email del usuario:  rjoseeliecer@gmail.com
ID del proyecto:    4
ID del nuevo rol:   12
```

**Proyectos disponibles:**

| ID | Nombre |
|---|---|
| 1 | Kreative |
| 2 | Match |
| 3 | Wiki |
| 4 | **Kreative Vit** |

**Roles disponibles:**

| ID | Rol | Proyecto | Nivel de acceso |
|---|---|---|---|
| 1 | admin_k | Kreative | 90 — Admin total |
| 2 | lider_k | Kreative | 70 — Líder |
| 3 | practicante_k | Kreative | 30 — Practicante |
| 4 | visitante_k | Kreative | 1 — Solo lectura |
| 5 | admin_mc | Match | 90 |
| 6 | lider_mc | Match | 70 |
| 7 | usuario_mc | Match | 30 |
| 8 | visitante_mc | Match | 1 |
| 9 | admin_wiki | Wiki | 90 |
| 10 | editor_wiki | Wiki | 50 |
| 11 | lector_wiki | Wiki | 10 |
| **12** | **admin_vit** | **Kreative Vit** | **90 — Admin total** |
| **13** | **lider_vit** | **Kreative Vit** | **70 — Líder (Mauro)** |
| **14** | **practicante_vit** | **Kreative Vit** | **30 — Practicante** |

### Agregar practicante de prueba — opción `[7]`

Ingresa nombre, email y generación. El script:
1. Inserta el usuario en `alphadocere_auth_system.clients`
2. Asigna roles por defecto (visitante en Kreative/Match/Wiki, `practicante_vit` en Vit)
3. Inserta el usuario en `alphadocere_Vit.usuarios` con el `client_id` correcto

---

## 🔄 Flujo de datos

```
[React App :5173]
       │
       │ POST /api/saveLog.php
       ▼
[Apache :80 / api/saveLog.php]
       │
       ├──► getVitDbConnection()  ──► alphadocere_Vit.bitacoras
       │
       └──► si mood=frustrado/cansado o needsHelp=true
             │
             └──► send_alert.php
                       │
                       └──► PHPMailer ──► mrojas@alphadocere.cl
```

```
[React App :5173]
       │
       │ GET /api/fetchLogs.php (con JWT en header X-Token)
       ▼
[api/fetchLogs.php]
       │
       ├──► getAuthDbConnection() ──► valida JWT + rol en alphadocere_auth_system
       │
       └──► getVitDbConnection()  ──► devuelve bitácoras de alphadocere_Vit
```

---

## 🐛 Problemas frecuentes

| Error | Causa | Solución |
|---|---|---|
| `'mysql' no se reconoce` | MySQL no está en PATH | Agrega `C:\xampp\mysql\bin` al PATH del sistema |
| `Error de conexión a BD Auth` | MySQL no está corriendo | Inicia MySQL en XAMPP Control Panel |
| `Error de conexión a BD Vit` | BD no importada | Ejecuta opción `[2]` del bat |
| La app carga pero sin datos | `.env` falta o incorrecto | Ejecuta opción `[3]` del bat |
| `composer: command not found` | Composer no instalado globalmente | Instala desde getcomposer.org |
| Error 403 en la API | Apache / `.htaccess` | Activa `mod_rewrite` en Apache y verifica el `.htaccess` |
| `Foreign key constraint fails` | Orden de importación | El SQL usa `FOREIGN_KEY_CHECKS=0`, reinténtalo desde `[2]` |
| CORS error desde Vite | Proxy no configurado | Verifica `vite.config.js` tiene el proxy `/api` |
| Correos no llegan | SMTP vacío en local | Normal — en local el SMTP está vacío, configúralo solo en producción |

---

## 🔧 Comandos útiles

```powershell
# Ver el servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Instalar dependencias PHP manualmente
cd api
composer install

# Acceder a MySQL directo (sin contraseña)
mysql -u root

# Importar una BD manualmente
mysql -u root alphadocere_Vit < alphadocere_Vit.sql
mysql -u root alphadocere_auth_system < alphadocere_auth_system_LOCAL.sql
```

---

## 👤 Usuarios precargados (desarrollo local)

| client_id | Nombre | Email | Rol en Vit |
|---|---|---|---|
| 1 | Mauro Rojas | mrojas@alphadocere.cl | lider_vit |
| 145 | Jose Eliecer Rivera Perez | rjoseeliecer@gmail.com | admin_vit |

> Las contraseñas en local son `LOCAL_NO_AUTH` — no se usan. La autenticación real requiere el servidor auth de producción.

---

## 📤 Diferencias local vs producción

| Aspecto | Local | Producción |
|---|---|---|
| Auth system | BD simulada | BD real (`alphadocere_auth_system`) |
| Contraseñas | `LOCAL_NO_AUTH` | Bcrypt hash real |
| SMTP | Desactivado | SendGrid / SMTP real |
| URL API | `http://localhost/kreative-vit/api` | `https://kreativevit.alphadocere.cl/api` |
| Frontend | Vite HMR `:5173` | Build estático `/dist` en Apache |

---

*Guía generada para Kreative Vit — Alpha Docere · 2026*
