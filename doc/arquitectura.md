# 🏗️ Arquitectura — Kreative Vit

## Descripción General

**Kreative Vit** es una plataforma de bienestar y productividad para practicantes de Alpha Docere. Permite a los usuarios registrar bitácoras diarias, hacer seguimiento emocional, solicitar ayuda técnica y desbloquear insignias según su progreso.

## Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React | 19.x |
| Enrutamiento | React Router DOM | 7.x |
| Íconos | Lucide React | 1.x |
| Build Tool | Vite | 8.x |
| Linting | ESLint | 10.x |
| Backend API | PHP | 8.3+ |
| Base de datos | MySQL | 8.x |
| Mailer | PHPMailer | via Composer |
| Variables de entorno | vlucas/phpdotenv | via Composer |

## Estructura de Directorios

```
kreative Vit/
├── api/                         # Backend PHP (endpoints REST)
│   ├── config.php               # Conexiones BD y mailer
│   ├── fetchLogs.php            # GET: bitácoras, compañeros, insignias
│   ├── saveLog.php              # POST: guardar bitácora
│   ├── send_alert.php           # POST: alerta emocional por email
│   ├── stats.php                # GET: estadísticas públicas (generación activa)
│   ├── debug_env.php            # Diagnóstico de variables de entorno
│   ├── composer.json            # Dependencias PHP
│   └── vendor/                  # Dependencias instaladas
│
├── src/                         # Código fuente React
│   ├── main.jsx                 # Punto de entrada
│   ├── App.jsx                  # Enrutamiento principal
│   ├── index.css                # Sistema de diseño global (CSS Variables)
│   ├── App.css                  # Estilos base
│   │
│   ├── context/
│   │   └── ThemeContext.jsx     # Estado global del tema (dark/light)
│   │
│   ├── layout/
│   │   └── DashboardLayout.jsx  # Layout raíz del dashboard (nav, sidebar, modals)
│   │
│   ├── pages/
│   │   ├── Home.jsx             # Landing page pública
│   │   ├── Login.jsx            # Autenticación (integración con auth system)
│   │   ├── DashboardHome.jsx    # Panel principal del usuario
│   │   ├── Bitacora.jsx         # Formulario de bitácora diaria
│   │   ├── Historial.jsx        # Historial de bitácoras pasadas
│   │   ├── Insignias.jsx        # Galería de insignias del usuario
│   │   ├── Companeros.jsx       # Directorio de compañeros activos
│   │   ├── Profile.jsx          # Perfil de usuario
│   │   └── AdminPanel.jsx       # Panel de administración
│   │
│   ├── components/
│   │   ├── Navbar.jsx           # Barra de navegación pública
│   │   ├── BadgeViewer.jsx      # Visor de insignias (galería interactiva)
│   │   └── OnThisDay.jsx        # Widget "En este día"
│   │
│   ├── utils/
│   │   └── badgeHelper.js       # Lógica central de cálculo de insignias
│   │
│   └── assets/                  # Logos y recursos estáticos
│
├── public/
│   └── insignias/               # Imágenes de todas las insignias (.png)
│
├── doc/                         # 📖 Esta carpeta — Documentación
├── dist/                        # Build de producción (generado por Vite)
├── .env                         # Variables de entorno (NO commitear)
├── .env.example                 # Plantilla de variables de entorno
├── .gitignore                   # Archivos ignorados por Git
├── index.html                   # HTML raíz (Vite entry point)
├── vite.config.js               # Configuración de Vite
├── package.json                 # Dependencias y scripts npm
└── alphadocere_Vit.sql          # Dump de la base de datos
```

## Flujo de Datos General

```
[Usuario] 
    │
    ├─── Página Pública (Home) ──► stats.php ──► MySQL (generación activa)
    │
    └─── Login ──► alphadocere_auth_system (BD externa)
                        │
                        └─── Token en localStorage
                                    │
                                    └─── Dashboard
                                              │
                                    ┌─────────┼─────────────┐
                                    ▼         ▼             ▼
                              fetchLogs   saveLog      send_alert
                              (GET)       (POST)       (POST)
                                    │         │             │
                                    └─────────┴─────────────┘
                                                    │
                                             MySQL: alphadocere_Vit
                                          (bitacoras, usuarios, insignias)
```

## Bases de Datos

El sistema consume **dos bases de datos MySQL** distintas:

| BD | Nombre | Uso |
|---|---|---|
| Auth System | `alphadocere_auth_system` | Autenticación de usuarios (JWT) |
| Kreative Vit | `alphadocere_Vit` | Bitácoras, insignias, compañeros |

## Autenticación

- La autenticación es **delegada** al sistema externo `alphadocere_auth_system`
- El token JWT se almacena en `localStorage` bajo la clave `practicante_token`
- El `DashboardLayout` verifica la presencia del token y redirige a `/login` si no existe
- El email del usuario se usa como identificador en las operaciones de la BD `alphadocere_Vit`

## Persistencia Local (localStorage)

| Clave | Descripción |
|---|---|
| `practicante_token` | JWT de sesión |
| `practicante_user` | Nombre del usuario |
| `practicante_email` | Email del usuario |
| `practicante_is_admin` | `"true"` si es administrador |
| `practicante_generation` | Número de generación Alpha |
| `practicante_status` | Frase de estado personal |
| `practicantes_bitacoras` | Cache local de todas las bitácoras |
| `practicantes_fellows` | Cache local de compañeros activos |
| `practicantes_badges_acknowledged` | IDs de insignias ya celebradas |
| `kreative_theme` | Preferencia de tema `"dark"` o `"light"` |

## Sincronización

Al montar el `DashboardLayout`, si el usuario tiene token:
1. Se hace `fetch` a `fetchLogs.php` para obtener datos frescos de MySQL
2. Los datos se guardan en `localStorage` (cache)
3. Se dispara un evento `storage` para que todos los componentes se re-lean
4. Si la red falla, se usa el cache local (funciona offline)
