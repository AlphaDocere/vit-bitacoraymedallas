# 🚀 Guía de Instalación — Kreative Vit

## Requisitos del Sistema

| Herramienta | Versión mínima |
|---|---|
| Node.js | 18.x o superior |
| npm | 9.x o superior |
| PHP | 8.1 o superior |
| Composer | 2.x |
| MySQL | 8.x |
| Servidor web | Apache / Nginx con mod_rewrite |

## 1. Clonar el Repositorio

```bash
git clone https://github.com/TU_USUARIO/kreative-vit.git
cd kreative-vit
```

## 2. Instalar Dependencias del Frontend

```bash
npm install
```

Esto instalará:
- `react` + `react-dom` (v19)
- `react-router-dom` (v7)
- `lucide-react` (íconos)
- `vite` + plugins de desarrollo

## 3. Instalar Dependencias del Backend PHP

```bash
cd api
composer install
cd ..
```

Esto instalará:
- `vlucas/phpdotenv` — Carga de variables de entorno
- `phpmailer/phpmailer` — Envío de correos SMTP

## 4. Configurar Variables de Entorno

Copia el archivo de ejemplo y completa tus datos:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Conexión a la BD de Kreative Vit
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASS=tu_contraseña_mysql
DB_NAME=alphadocere_Vit
DB_PORT=3306

# Conexión al sistema de autenticación (BD externa)
DB_HOST_AUTH=localhost
DB_USER_AUTH=tu_usuario_mysql
DB_PASS_AUTH=tu_contraseña_mysql
DB_NAME_AUTH=alphadocere_auth_system
DB_PORT_AUTH=3306

# Configuración SMTP para alertas de email
SMTP_HOST=mail.tudominio.cl
SMTP_USER=tu_email@tudominio.cl
SMTP_PASS=tu_password_smtp
SMTP_PORT=465

# Remitente del email
MAIL_FROM=kreativevit@tudominio.cl
MAIL_FROM_NAME=Kreative Vit

# URL del sitio
SITE_URL=https://tudominio.cl
APP_NAME=Kreative Vit

# JWT (si se usa)
JWT_SECRET=cambia_esto_por_un_secreto_seguro
JWT_EXPIRY=86400
```

> ⚠️ **NUNCA** commitees el archivo `.env` real. Está incluido en `.gitignore`.

## 5. Crear la Base de Datos

Importa el schema inicial usando el dump SQL incluido:

```bash
mysql -u tu_usuario -p < alphadocere_Vit.sql
```

O bien, desde phpMyAdmin:
1. Crea la base de datos `alphadocere_Vit`
2. Ve a la pestaña **Importar**
3. Sube el archivo `alphadocere_Vit.sql`
4. Haz clic en **Continuar**

## 6. Ejecutar en Desarrollo

### Frontend (Vite dev server)

```bash
npm run dev
```

El servidor de desarrollo estará disponible en: `http://localhost:5173`

El archivo `vite.config.js` tiene `base: '/'`, compatible con hosting en subdominios.

### Backend PHP (local)

Si no tienes un servidor Apache/Nginx local, puedes usar el servidor integrado de PHP para pruebas rápidas:

```bash
cd api
php -S localhost:8080
```

> Nota: En producción, el backend vive en el mismo servidor cPanel que el frontend.

## 7. Build de Producción

```bash
npm run build
```

Los archivos generados estarán en `dist/`. Sube el contenido de `dist/` más la carpeta `api/` a tu hosting.

## 8. Configuración del Servidor (cPanel / Apache)

### Para el Frontend (SPA React)

Crea o edita el `.htaccess` en la raíz del sitio:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

Esto permite que React Router maneje las rutas del lado del cliente.

### Para el Backend PHP

Los archivos en `api/` deben tener PHP habilitado. Asegúrate de que:
- El archivo `.env` esté en la raíz del proyecto (un nivel arriba de `api/`)
- PHP tenga permiso de lectura sobre `.env`
- La extensión `mysqli` esté habilitada en PHP

## 9. Verificar la Instalación

Abre el navegador y navega a:

- `https://tudominio.cl/` — Debe mostrar la landing page de Kreative Vit
- `https://tudominio.cl/api/stats.php` — Debe retornar `{"success":true,"generation":...}`
- `https://tudominio.cl/login` — Debe mostrar el formulario de login

## Solución de Problemas Comunes

| Problema | Solución |
|---|---|
| `Cannot find module 'react'` | Ejecutar `npm install` |
| Error de conexión a BD en PHP | Verificar `.env` y credenciales MySQL |
| Las rutas del dashboard dan 404 | Configurar `.htaccess` para SPA |
| Error SMTP al enviar alertas | Verificar `SMTP_PORT` (465 para SSL, 587 para TLS) |
| `composer: command not found` | Instalar Composer globalmente |
| Los PHPs no cargan el `.env` | Verificar que `vlucas/phpdotenv` esté instalado con `composer install` |
