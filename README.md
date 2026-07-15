# 🌿 Kreative Vit

> **Plataforma de bienestar y productividad para practicantes de Alpha Docere.**  
> Registra tu día, cuida tu mente, desbloquea logros.

---

## ✨ ¿Qué es Kreative Vit?

Kreative Vit es un sistema de bitácora diaria interna para los practicantes de [Alpha Docere](https://alphadocere.cl). Permite documentar actividades, monitorear el estado emocional, solicitar ayuda técnica cuando hay bloqueos, y gamificar el proceso con un sistema de **47+ insignias desbloqueables**.

---

## 🚀 Demo

> Disponible en producción en el servidor de Alpha Docere.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite 8 |
| Routing | React Router DOM 7 |
| Íconos | Lucide React |
| Backend | PHP 8.3 (REST API) |
| Base de datos | MySQL 8 |
| Mailer | PHPMailer (Composer) |
| Env vars | vlucas/phpdotenv |

---

## 📋 Características Principales

- 📝 **Bitácora Diaria** — Registra qué hiciste hoy y qué planeas mañana
- 😊 **Seguimiento Emocional** — Estado de ánimo con alerta automática al líder
- 🆘 **Solicitud de Ayuda Técnica** — Documenta bloqueos y pide asistencia
- 🏅 **Sistema de Insignias** — 47+ logros desbloqueables por comportamiento real
- 👥 **Directorio de Compañeros**   **Perfil de Usuario Expandible:** Los practicantes pueden subir foto de perfil, ver su generación dinámica y configurar una frase de estado.
*   **Panel de Administración Integral:** Interfaz exclusiva para Líderes (Jefe/Creador) con monitoreo en vivo, lecturas de historial completas por usuario, detección de inactividad e indicadores de crisis.
*   **Gestor de Alertas de Bienestar:** Envío silencioso y en segundo plano de correos electrónicos de emergencia al equipo líder cuando un practicante reporta "frustrado", "cansado" o presiona el botón de "Necesito Ayuda", incluyendo feedback visual post-envío.
*   **Backup Automático Inteligente:** Script PHP configurable por Cron para realizar volcados SQL programados y auto-gestionados en la raíz del servidor.
- ⚡ **Offline-first** — Cache local en localStorage, sincroniza con MySQL al conectarse

---

## 🗓️ Novedades Julio 2026

*   **Perfil de Usuario Expandible:** Gestión de fotos de perfil, visualización de generación y estados personalizados.
*   **Panel de Administración:** Control total para líderes, incluyendo detección de inactividad y métricas de crisis en tiempo real.
*   **Alertas de Emergencia:** Sistema mejorado de notificaciones por email con feedback visual inmediato para el usuario.
*   **Backup Automatizado:** Implementación de volcados SQL mediante Cron Jobs para seguridad de datos.

---

## ⚡ Inicio Rápido

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/kreative-vit.git
cd kreative-vit
```

### 2. Instalar dependencias

```bash
# Frontend
npm install

# Backend PHP
cd api && composer install && cd ..
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env con tus credenciales de MySQL y SMTP
```

### 4. Importar la base de datos

```bash
mysql -u root -p < alphadocere_Vit.sql
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
# → http://localhost:5173
```

---

## 📁 Estructura del Proyecto

```
kreative Vit/
├── api/                  # Backend PHP (endpoints REST)
│   ├── fetchLogs.php     # GET: datos del dashboard
│   ├── saveLog.php       # POST: guardar bitácora
│   ├── send_alert.php    # POST: alerta emocional por email
│   ├── stats.php         # GET: estadísticas públicas
│   └── config.php        # Conexiones BD + PHPMailer
│
├── src/                  # Frontend React
│   ├── pages/            # 9 páginas (Home, Login, Dashboard, etc.)
│   ├── components/       # Navbar, BadgeViewer, OnThisDay
│   ├── layout/           # DashboardLayout (nav + sidebar + modals)
│   ├── context/          # ThemeContext (dark/light mode)
│   └── utils/            # badgeHelper.js (lógica de insignias)
│
├── public/insignias/     # Imágenes de todas las insignias
├── doc/                  # 📖 Documentación completa
├── .env.example          # Plantilla de variables de entorno
├── alphadocere_Vit.sql   # Schema + datos de la base de datos
└── package.json
```

---

## 📖 Documentación

La documentación completa está en la carpeta [`/doc`](./doc/):

| Documento | Contenido |
|---|---|
| [arquitectura.md](./doc/arquitectura.md) | Stack, estructura de directorios, flujo de datos |
| [instalacion.md](./doc/instalacion.md) | Guía paso a paso de instalación y despliegue |
| [api_reference.md](./doc/api_reference.md) | Referencia completa de endpoints PHP |
| [componentes.md](./doc/componentes.md) | Documentación de todos los componentes React |
| [insignias.md](./doc/insignias.md) | Sistema de insignias — lógica y catálogo completo |
| [base_de_datos.md](./doc/base_de_datos.md) | Esquema ER y queries principales |
| [diagramas.html](./doc/diagramas.html) | 🎨 Diagramas interactivos (abrir en navegador) |

---

## 🗺️ Rutas de la Aplicación

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | Home | Público |
| `/login` | Login | Público |
| `/dashboard` | DashboardHome | Autenticado |
| `/dashboard/bitacora` | Bitacora | Autenticado |
| `/dashboard/historial` | Historial | Autenticado |
| `/dashboard/insignias` | Insignias | Autenticado |
| `/dashboard/companeros` | Companeros | Autenticado |
| `/dashboard/perfil` | Profile | Autenticado |
| `/dashboard/admin` | AdminPanel | Admin |

---

## 📡 API Endpoints

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/fetchLogs.php` | `GET` | Bitácoras + compañeros + insignias |
| `/api/saveLog.php` | `POST` | Guardar una bitácora |
| `/api/send_alert.php` | `POST` | Alerta emocional por email |
| `/api/stats.php` | `GET` | Estadísticas públicas |

---

## 🏗️ Comandos de Desarrollo

```bash
npm run dev      # Servidor de desarrollo (HMR)
npm run build    # Build de producción → /dist
npm run preview  # Preview del build de producción
npm run lint     # Lint con ESLint
```

---

## 🤝 Contribuir

1. Haz fork del repositorio
2. Crea tu rama: `git checkout -b feature/mi-feature`
3. Commitea tus cambios: `git commit -m 'Add: mi nueva feature'`
4. Push a la rama: `git push origin feature/mi-feature`
5. Abre un Pull Request

---

## 👤 Autor

**Jose Eliecer Rivera Perez** (Joseph Joestar · Gen 17)  
Desarrollador principal de Kreative Vit  
Alpha Docere — Generación 17

---

## 📄 Licencia

Proyecto privado de uso interno de Alpha Docere. Todos los derechos reservados.
