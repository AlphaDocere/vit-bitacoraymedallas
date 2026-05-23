# ⚛️ Componentes React — Kreative Vit

Documentación de todos los componentes, páginas y layouts de la aplicación.

---

## Contexto Global

### `ThemeContext.jsx`
**Ruta:** `src/context/ThemeContext.jsx`

Provee el estado del tema (dark/light) a toda la aplicación.

```jsx
// Uso
import { useTheme } from '../context/ThemeContext';
const { isDarkMode, toggleTheme } = useTheme();
```

| Valor | Tipo | Descripción |
|---|---|---|
| `isDarkMode` | `boolean` | `true` si el tema actual es oscuro |
| `toggleTheme` | `function` | Alterna entre dark y light mode |

**Comportamiento:**
- Lee la preferencia del sistema (`prefers-color-scheme`) en el primer render
- Persiste en `localStorage` bajo la clave `kreative_theme`
- Aplica/remueve la clase `.dark` en `document.documentElement`

---

## Layout

### `DashboardLayout.jsx`
**Ruta:** `src/layout/DashboardLayout.jsx`

Layout raíz de todo el área protegida del dashboard. Actúa como wrapper para todas las rutas bajo `/dashboard/*`.

**Responsabilidades:**
- ✅ Guard de autenticación (redirige a `/login` si no hay token)
- ✅ Sincronización de datos con MySQL en cada mount
- ✅ Navbar superior con navegación, usuario y toggle de tema
- ✅ Modal de bienvenida (primera vez — selección de generación)
- ✅ Sistema de celebración de insignias (overlay animado con confeti)
- ✅ Widget `OnThisDay` en el sidebar derecho

**Props:** Ninguno (Lee de `localStorage` directamente)

**Estado interno:**

| Estado | Tipo | Descripción |
|---|---|---|
| `currentUser` | `string` | Nombre del usuario logueado |
| `isAdmin` | `boolean` | Si el usuario tiene rol admin |
| `menuOpen` | `boolean` | Menú mobile abierto/cerrado |
| `userMenuOpen` | `boolean` | Dropdown de usuario abierto/cerrado |
| `showGenModal` | `boolean` | Muestra el modal de primera vez |
| `activeCelebrationBadge` | `object\|null` | Insignia siendo celebrada |

**Rutas hijas (Outlet):**
```
/dashboard           → DashboardHome
/dashboard/bitacora  → Bitacora
/dashboard/historial → Historial
/dashboard/insignias → Insignias
/dashboard/companeros → Companeros
/dashboard/perfil    → Profile
/dashboard/admin     → AdminPanel
```

---

## Páginas

### `Home.jsx`
**Ruta:** `src/pages/Home.jsx`

Landing page pública de la aplicación.

**Características:**
- Diseño tipo "cuaderno de notas" (fondo con cuadrícula y margen rojo)
- Texto 3D animado "VIT" con efecto neon verde al hover
- Tarjetas flotantes de estados emocionales (🤯 🚀 🐛 🧘)
- Insignias flotantes con aura de colores
- Contadores animados de usuarios activos (hook `useCountUp`)
- Efecto spotlight que sigue el cursor del ratón
- Sección post-it de características (amarillo, azul, rosa)
- Firma "Joseph Gen 17" con efecto 3D en la esquina inferior derecha

**Hook personalizado:**
```js
const useCountUp = (end, duration = 2000) => number
// Animación easing expo-out para contadores numéricos
```

---

### `Login.jsx`
**Ruta:** `src/pages/Login.jsx`

Formulario de autenticación que integra con el sistema `alphadocere_auth_system`.

**Flujo:**
1. Usuario ingresa email + contraseña
2. Se hace `POST` al sistema de auth externo
3. Si es exitoso: guarda token, nombre, email, rol en `localStorage`
4. Redirige a `/dashboard` o `/dashboard/admin`

---

### `DashboardHome.jsx`
**Ruta:** `src/pages/DashboardHome.jsx`

Panel principal del usuario logueado.

**Características:**
- Estadísticas personales (total bitácoras, racha actual, palabras escritas)
- Insignias recientes desbloqueadas
- Resumen de bitácoras recientes
- Widget de bienvenida con nombre y generación

---

### `Bitacora.jsx`
**Ruta:** `src/pages/Bitacora.jsx`

Formulario principal para registrar una bitácora diaria.

**Campos del formulario:**

| Campo | Tipo | Descripción |
|---|---|---|
| Fecha | `date` | Fecha de la bitácora (default: hoy) |
| ¿Qué hice hoy? | `textarea` | Actividades realizadas |
| ¿Qué haré mañana? | `textarea` | Planificación del día siguiente |
| Estado de ánimo | `radio/select` | `bien`, `cansado`, `frustrado`, `inspirado` |
| ¿Necesito ayuda? | `checkbox` | Si está bloqueado técnicamente |
| Descripción del bloqueo | `textarea` | Condicional si `ayuda = true` |

**Flujo de guardado:**
1. Guarda en `localStorage` (instantáneo, offline-first)
2. Hace `POST` a `saveLog.php` (persistencia en MySQL)
3. Si `mood` es crítico o `ayuda = true`, hace `POST` a `send_alert.php`

---

### `Historial.jsx`
**Ruta:** `src/pages/Historial.jsx`

Vista de todas las bitácoras pasadas del usuario.

**Características:**
- Filtro por fecha, estado de ánimo y búsqueda de texto
- Tarjetas de bitácora con expansión de contenido
- Indicador de racha de días consecutivos
- Vista de calendario opcional

---

### `Insignias.jsx`
**Ruta:** `src/pages/Insignias.jsx`

Galería completa de insignias del usuario con sistema de rareza.

**Categorías de insignias:**
- 📊 **Hitos de Bitácoras** — Por cantidad acumulada (1, 7, 15, 21, 30, 45, 60, 75, 90)
- 🔥 **Rachas** — Por días consecutivos (3, 7, 14, 30, 45, 60, 75, 90)
- ✍️ **Volumen de Escritura** — Por palabras acumuladas (5k, 10k, 25k)
- 🕐 **Rituales del Día** — Por horario de escritura (noche, madrugada, mañana)
- 💪 **Resiliencia** — Por volver después de pausas
- 🛠️ **Habilidades Técnicas** — Desbloqueadas por contenido (Git, cPanel, Wiki, Podcast, Eisenhower, Bug Hunter)
- ⭐ **Especiales** — El Creador, Líder Alpha Docere, Generaciones, Miembro

---

### `Companeros.jsx`
**Ruta:** `src/pages/Companeros.jsx`

Directorio de todos los compañeros activos con sus insignias y estadísticas.

**Características:**
- Lista de usuarios activos con avatar, generación y estado personal
- Insignias de cada compañero (calculadas dinámicamente con `badgeHelper`)
- Filtro por generación
- Estadísticas de la comunidad

---

### `Profile.jsx`
**Ruta:** `src/pages/Profile.jsx`

Perfil personal del usuario con estadísticas detalladas.

**Secciones:**
- Información del perfil (nombre, generación, estado)
- Estadísticas acumuladas (bitácoras, palabras, racha máxima)
- Insignias obtenidas
- Historial de actividad por mes

---

### `AdminPanel.jsx`
**Ruta:** `src/pages/AdminPanel.jsx`

Panel exclusivo para administradores.

**Acceso:** Solo disponible si `localStorage.getItem('practicante_is_admin') === 'true'`

**Características:**
- Vista de todos los practicantes y sus bitácoras
- Gestión de alertas emocionales pendientes
- Estadísticas globales del sistema
- Actividad reciente de todos los usuarios

---

## Componentes Reutilizables

### `Navbar.jsx`
**Ruta:** `src/components/Navbar.jsx`

Barra de navegación de la página pública (Home).

**Características:**
- Muestra el logo de Kreative Vit
- Botón CTA que adapta texto según el estado de sesión
- Responsive (hamburger menu en móvil)

---

### `BadgeViewer.jsx`
**Ruta:** `src/components/BadgeViewer.jsx`

Componente de galería interactiva de insignias.

**Props:**

| Prop | Tipo | Descripción |
|---|---|---|
| `earnedBadges` | `number[]` | Lista de IDs de insignias desbloqueadas |
| `allBadges` | `object` | Mapa completo de insignias (`INSIGNIAS_MAP`) |
| `compact` | `boolean` | Vista compacta (para `Companeros`) |

**Características:**
- Insignias obtenidas resaltadas con su color de rareza
- Insignias no obtenidas en gris/bloqueado
- Tooltip con nombre y descripción de cada insignia
- Animaciones de hover con aura de colores

---

### `OnThisDay.jsx`
**Ruta:** `src/components/OnThisDay.jsx`

Widget del sidebar que muestra bitácoras del mismo día de años anteriores.

**Características:**
- Detecta automáticamente la fecha de hoy
- Filtra el historial del usuario para mostrar entradas de la misma fecha
- Animación de entrada suave
- Si no hay entradas anteriores, muestra un mensaje motivacional

---

## Utilidades

### `badgeHelper.js`
**Ruta:** `src/utils/badgeHelper.js`

Módulo centralizado de lógica de insignias. Usado por `DashboardLayout`, `Profile`, `Companeros`, e `Insignias`.

#### `calculateUserBadges(username, generation, bitacoras)`

Calcula dinámicamente todas las insignias que ha ganado un usuario.

**Parámetros:**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `username` | `string` | Nombre del usuario |
| `generation` | `string\|number` | Número de generación Alpha |
| `bitacoras` | `array` | Array de todas las bitácoras del sistema |

**Retorna:** `number[]` — Array de IDs de insignias desbloqueadas (sin duplicados)

**Lógica interna:**
1. Filtra bitácoras del usuario (`b.user === username || b.practicante === username`)
2. Calcula hitos de cantidad acumulada de bitácoras
3. Calcula racha máxima de días consecutivos
4. Calcula volumen total de palabras escritas
5. Detecta horarios de escritura (noche, madrugada, mañana)
6. Detecta resiliencia (pausas y reanudaciones)
7. Otorga insignias especiales (creador, líder, generación)
8. Desbloquea insignias de habilidades técnicas por análisis de texto

#### `calculateStreak(username, bitacoras)`

Calcula la racha activa actual del usuario (días consecutivos hasta hoy o ayer).

**Retorna:** `number` — Días de racha activa (0 si está rota)
