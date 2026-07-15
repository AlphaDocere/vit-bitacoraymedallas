@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
color 0A
title Kreative Vit — Setup Local

:: ============================================================
::  CONFIGURACION — edita estos valores si tu MySQL difiere
:: ============================================================
set MYSQL_HOST=localhost
set MYSQL_PORT=3306
set MYSQL_USER=root
set MYSQL_PASS=
set MYSQL_BIN=mysql

:: Nombres de bases de datos (no cambiar salvo que sepas lo que haces)
set DB_AUTH=alphadocere_auth_system
set DB_VIT=alphadocere_Vit

:: Variables de la app (se escribirán en .env)
set SITE_URL=http://localhost
set APP_NAME=Kreative Vit
set JWT_SECRET=local_dev_secret_123
set JWT_EXPIRY=86400

:: SMTP — déjalos vacíos para no enviar correos en local
set SMTP_HOST=
set SMTP_PORT=
set SMTP_USER=
set SMTP_PASS=
set MAIL_FROM=noreply@localhost
set MAIL_FROM_NAME=Kreative Vit Local

:: ============================================================
:MENU
cls
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║          KREATIVE VIT — SETUP LOCAL v1.0             ║
echo  ╠══════════════════════════════════════════════════════╣
echo  ║  [1] Instalacion completa (primera vez)              ║
echo  ║  [2] Importar solo las BDs                           ║
echo  ║  [3] Crear / regenerar archivo .env                  ║
echo  ║  [4] Instalar dependencias PHP (composer)            ║
echo  ║  [5] Instalar dependencias Node (npm)                ║
echo  ║  [6] Gestionar roles de usuario                      ║
echo  ║  [7] Agregar practicante de prueba                   ║
echo  ║  [8] Ver usuarios registrados                        ║
echo  ║  [9] Iniciar servidor de desarrollo (npm run dev)    ║
echo  ║  [0] Salir                                           ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
set /p OPCION="  Selecciona una opcion: "

if "%OPCION%"=="1" goto FULL_INSTALL
if "%OPCION%"=="2" goto IMPORT_DB
if "%OPCION%"=="3" goto CREATE_ENV
if "%OPCION%"=="4" goto INSTALL_PHP
if "%OPCION%"=="5" goto INSTALL_NODE
if "%OPCION%"=="6" goto MANAGE_ROLES
if "%OPCION%"=="7" goto ADD_USER
if "%OPCION%"=="8" goto LIST_USERS
if "%OPCION%"=="9" goto DEV_SERVER
if "%OPCION%"=="0" goto FIN
echo  Opcion invalida.
pause
goto MENU

:: ============================================================
:FULL_INSTALL
cls
echo.
echo  [*] INSTALACION COMPLETA
echo  ─────────────────────────────────────────────────────
call :CHECK_MYSQL
call :DO_IMPORT_DB
call :DO_CREATE_ENV
call :DO_INSTALL_PHP
call :DO_INSTALL_NODE
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║  Instalacion completa. Ejecuta [9] para dev server  ║
echo  ╚══════════════════════════════════════════════════════╝
pause
goto MENU

:: ============================================================
:IMPORT_DB
call :CHECK_MYSQL
call :DO_IMPORT_DB
pause
goto MENU

:DO_IMPORT_DB
echo.
echo  [*] Creando bases de datos...

:: --- BD Auth (simulada) ---
echo  → Importando %DB_AUTH%...
if defined MYSQL_PASS (
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASS% -e "DROP DATABASE IF EXISTS %DB_AUTH%; CREATE DATABASE %DB_AUTH% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASS% %DB_AUTH% < "%~dp0alphadocere_auth_system_LOCAL.sql" 2>nul
) else (
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -e "DROP DATABASE IF EXISTS %DB_AUTH%; CREATE DATABASE %DB_AUTH% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% %DB_AUTH% < "%~dp0alphadocere_auth_system_LOCAL.sql" 2>nul
)
if %errorlevel% neq 0 (
    echo  [!] Error al importar %DB_AUTH%. Verifica que MySQL este corriendo.
    goto :EOF
)
echo  [OK] %DB_AUTH% importada.

:: --- BD Vit ---
echo  → Importando %DB_VIT%...
if defined MYSQL_PASS (
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASS% -e "DROP DATABASE IF EXISTS %DB_VIT%; CREATE DATABASE %DB_VIT% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASS% %DB_VIT% < "%~dp0alphadocere_Vit.sql" 2>nul
) else (
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -e "DROP DATABASE IF EXISTS %DB_VIT%; CREATE DATABASE %DB_VIT% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% %DB_VIT% < "%~dp0alphadocere_Vit.sql" 2>nul
)
if %errorlevel% neq 0 (
    echo  [!] Error al importar %DB_VIT%.
    goto :EOF
)
echo  [OK] %DB_VIT% importada.
goto :EOF

:: ============================================================
:CREATE_ENV
call :DO_CREATE_ENV
pause
goto MENU

:DO_CREATE_ENV
echo.
echo  [*] Generando archivo .env...
(
    echo # ============================================================
    echo # Kreative Vit — Variables de Entorno LOCAL
    echo # Generado por setup.bat — NO subir a git
    echo # ============================================================
    echo.
    echo # BD del sistema auth (simulada local^)
    echo DB_HOST_AUTH=%MYSQL_HOST%
    echo DB_USER_AUTH=%MYSQL_USER%
    echo DB_PASS_AUTH=%MYSQL_PASS%
    echo DB_NAME_AUTH=%DB_AUTH%
    echo DB_PORT_AUTH=%MYSQL_PORT%
    echo.
    echo # BD de Kreative Vit
    echo DB_HOST_VIT=%MYSQL_HOST%
    echo DB_USER_VIT=%MYSQL_USER%
    echo DB_PASS_VIT=%MYSQL_PASS%
    echo DB_NAME_VIT=%DB_VIT%
    echo DB_PORT_VIT=%MYSQL_PORT%
    echo.
    echo # Aplicacion
    echo SITE_URL=%SITE_URL%
    echo APP_NAME=%APP_NAME%
    echo.
    echo # JWT
    echo JWT_SECRET=%JWT_SECRET%
    echo JWT_EXPIRY=%JWT_EXPIRY%
    echo.
    echo # SMTP (dejar vacio para no enviar correos en local^)
    echo SMTP_HOST=%SMTP_HOST%
    echo SMTP_PORT=%SMTP_PORT%
    echo SMTP_USER=%SMTP_USER%
    echo SMTP_PASS=%SMTP_PASS%
    echo MAIL_FROM=%MAIL_FROM%
    echo MAIL_FROM_NAME=%MAIL_FROM_NAME%
    echo.
    echo # Admin Vit Secret
    echo ADMIN_VIT_SECRET=Joseph_vit
) > "%~dp0.env"
echo  [OK] .env creado en la raiz del proyecto.
goto :EOF

:: ============================================================
:INSTALL_PHP
call :DO_INSTALL_PHP
pause
goto MENU

:DO_INSTALL_PHP
echo.
echo  [*] Instalando dependencias PHP con Composer...
where composer >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!] Composer no encontrado. Instala desde https://getcomposer.org
    goto :EOF
)
cd "%~dp0api"
composer install --no-interaction
cd "%~dp0"
echo  [OK] Dependencias PHP instaladas.
goto :EOF

:: ============================================================
:INSTALL_NODE
call :DO_INSTALL_NODE
pause
goto MENU

:DO_INSTALL_NODE
echo.
echo  [*] Instalando dependencias Node...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!] npm no encontrado. Instala Node.js desde https://nodejs.org
    goto :EOF
)
cd "%~dp0"
npm install
echo  [OK] Dependencias Node instaladas.
goto :EOF

:: ============================================================
:MANAGE_ROLES
cls
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║            GESTION DE ROLES                          ║
echo  ╠══════════════════════════════════════════════════════╣
echo  ║  Proyectos disponibles:                              ║
echo  ║    1 = Kreative                                      ║
echo  ║    2 = Match                                         ║
echo  ║    3 = Wiki                                          ║
echo  ║    4 = Kreative Vit                                  ║
echo  ╠══════════════════════════════════════════════════════╣
echo  ║  Roles disponibles:                                  ║
echo  ║    1=admin_k  2=lider_k  3=practicante_k  4=visitante║
echo  ║    5=admin_mc 6=lider_mc 7=usuario_mc     8=visitante║
echo  ║    9=admin_wiki 10=editor_wiki 11=lector_wiki        ║
echo  ║   12=admin_vit 13=lider_vit 14=practicante_vit       ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
call :CHECK_MYSQL
set /p ROL_EMAIL="  Email del usuario: "
set /p ROL_PROY="  ID del proyecto (1-4): "
set /p ROL_ID="  ID del nuevo rol: "

echo.
echo  [*] Actualizando rol...
if defined MYSQL_PASS (
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASS% -e ^
    "USE %DB_AUTH%; UPDATE usuarios_roles_proyectos urp JOIN clients c ON urp.usuario_id = c.id SET urp.rol_id = %ROL_ID% WHERE c.email = '%ROL_EMAIL%' AND urp.proyecto_id = %ROL_PROY%;"
) else (
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -e ^
    "USE %DB_AUTH%; UPDATE usuarios_roles_proyectos urp JOIN clients c ON urp.usuario_id = c.id SET urp.rol_id = %ROL_ID% WHERE c.email = '%ROL_EMAIL%' AND urp.proyecto_id = %ROL_PROY%;"
)
echo  [OK] Rol actualizado.
pause
goto MENU

:: ============================================================
:ADD_USER
cls
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║         AGREGAR PRACTICANTE DE PRUEBA                ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
call :CHECK_MYSQL
set /p USR_NOMBRE="  Nombre completo: "
set /p USR_EMAIL="  Email: "
set /p USR_GEN="  ID Generacion (default 1 = Gen17): "
if "%USR_GEN%"=="" set USR_GEN=1

echo  [*] Insertando usuario en ambas BDs...

:: 1. Insertar en auth
if defined MYSQL_PASS (
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASS% -e ^
    "USE %DB_AUTH%; INSERT IGNORE INTO clients (email, password, nombre, company, status) VALUES ('%USR_EMAIL%', 'LOCAL_NO_AUTH', '%USR_NOMBRE%', 'Alpha Docere', 'active');"
    
    for /f %%i in ('"%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASS% -se "USE %DB_AUTH%; SELECT id FROM clients WHERE email='%USR_EMAIL%';"') do set NEW_ID=%%i
) else (
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -e ^
    "USE %DB_AUTH%; INSERT IGNORE INTO clients (email, password, nombre, company, status) VALUES ('%USR_EMAIL%', 'LOCAL_NO_AUTH', '%USR_NOMBRE%', 'Alpha Docere', 'active');"

    for /f %%i in ('"%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -se "USE %DB_AUTH%; SELECT id FROM clients WHERE email='%USR_EMAIL%';"') do set NEW_ID=%%i
)

:: 2. Asignar roles por defecto (visitante en todos, practicante_vit en Vit)
if defined MYSQL_PASS (
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASS% -e ^
    "USE %DB_AUTH%; INSERT IGNORE INTO usuarios_roles_proyectos (usuario_id, proyecto_id, rol_id) VALUES (!NEW_ID!, 1, 4), (!NEW_ID!, 2, 8), (!NEW_ID!, 3, 11), (!NEW_ID!, 4, 14);"
) else (
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -e ^
    "USE %DB_AUTH%; INSERT IGNORE INTO usuarios_roles_proyectos (usuario_id, proyecto_id, rol_id) VALUES (!NEW_ID!, 1, 4), (!NEW_ID!, 2, 8), (!NEW_ID!, 3, 11), (!NEW_ID!, 4, 14);"
)

:: 3. Insertar en alphadocere_Vit
if defined MYSQL_PASS (
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASS% -e ^
    "USE %DB_VIT%; INSERT IGNORE INTO usuarios (client_id, nombre, email, generacion_id, rol) VALUES (!NEW_ID!, '%USR_NOMBRE%', '%USR_EMAIL%', %USR_GEN%, 'usuario');"
) else (
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -e ^
    "USE %DB_VIT%; INSERT IGNORE INTO usuarios (client_id, nombre, email, generacion_id, rol) VALUES (!NEW_ID!, '%USR_NOMBRE%', '%USR_EMAIL%', %USR_GEN%, 'usuario');"
)

echo.
echo  [OK] Usuario '%USR_NOMBRE%' registrado con client_id=!NEW_ID!
echo       Email: %USR_EMAIL% | Gen: %USR_GEN%
pause
goto MENU

:: ============================================================
:LIST_USERS
cls
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║         USUARIOS REGISTRADOS                         ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
call :CHECK_MYSQL
echo  --- alphadocere_Vit.usuarios ---
if defined MYSQL_PASS (
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASS% ^
    -e "USE %DB_VIT%; SELECT id, client_id, nombre, email, rol, generacion_id, activo FROM usuarios ORDER BY id;" --table
) else (
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% ^
    -e "USE %DB_VIT%; SELECT id, client_id, nombre, email, rol, generacion_id, activo FROM usuarios ORDER BY id;" --table
)
echo.
echo  --- %DB_AUTH%.clients + roles en Kreative Vit (proyecto 4) ---
if defined MYSQL_PASS (
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASS% ^
    -e "USE %DB_AUTH%; SELECT c.id, c.nombre, c.email, r.nombre_rol FROM clients c JOIN usuarios_roles_proyectos urp ON c.id=urp.usuario_id JOIN roles r ON urp.rol_id=r.id_rol WHERE urp.proyecto_id=4 ORDER BY c.id;" --table
) else (
    "%MYSQL_BIN%" -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% ^
    -e "USE %DB_AUTH%; SELECT c.id, c.nombre, c.email, r.nombre_rol FROM clients c JOIN usuarios_roles_proyectos urp ON c.id=urp.usuario_id JOIN roles r ON urp.rol_id=r.id_rol WHERE urp.proyecto_id=4 ORDER BY c.id;" --table
)
pause
goto MENU

:: ============================================================
:DEV_SERVER
cls
echo.
echo  [*] Iniciando servidor de desarrollo...
echo  [*] Presiona Ctrl+C para detener.
echo.
cd "%~dp0"
npm run dev
goto MENU

:: ============================================================
:CHECK_MYSQL
where "%MYSQL_BIN%" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  [!] MySQL no encontrado en PATH. Asegurate de tener XAMPP/WAMP corriendo.
    echo      Agrega la carpeta bin de MySQL al PATH o edita MYSQL_BIN en este bat.
    echo.
    pause
    goto MENU
)
goto :EOF

:: ============================================================
:FIN
echo.
echo  Hasta luego 👋
exit /b 0
