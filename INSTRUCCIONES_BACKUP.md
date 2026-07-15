# 🗄️ Instrucciones para el Backup Automático

He creado un script PHP (`api/backup.php`) que genera de forma automática una copia de seguridad (`.sql`) de la base de datos completa de **Kreative Vit** y la guarda directamente en la raíz de tu proyecto. 

### ✨ Características del script:
1. **Seguro:** Solo se puede ejecutar mediante consola (Cron) o llamando a la URL con el token secreto definido en tu `.env` (`ADMIN_VIT_SECRET=Joseph_vit`).
2. **Nombres dinámicos:** Los archivos se guardan como `backup_vit_2026-07-15_15-30-00_a1b2c3.sql` (agrega una clave aleatoria al final para que nadie pueda adivinar la URL y descargarlo).
3. **Auto-limpieza:** El script mantiene solo los **últimos 5 backups** generados. Borra los más antiguos automáticamente para que tu hosting no se quede sin espacio con el pasar de los meses.

---

### ⚙️ Cómo automatizarlo (Crear un Cron Job)

Para que se ejecute "cada ciertos días" en producción, debes ir al panel de tu hosting (por ejemplo, **cPanel**) y buscar la opción **Tareas Cron (Cron Jobs)**.

**1. Configurar la frecuencia:**
Puedes seleccionar que se ejecute **una vez por semana** o definir cada cuántos días quieres que suceda en los selectores de tiempo (ej. cada 3 días a medianoche).

**2. Comando a ejecutar:**
En la casilla de "Comando", puedes colocar alguna de las siguientes opciones (elige la que prefieras):

**Opción A (Recomendada - Vía consola de PHP):**
```bash
/usr/local/bin/php /home/tu_usuario_cpanel/public_html/api/backup.php
```
*(Nota: Ajusta `/home/tu_usuario_cpanel/public_html/` a la ruta real de tu proyecto en tu servidor).*

**Opción B (Vía web usando cURL):**
```bash
curl -s "https://kreative-vit.alphadocere.cl/api/backup.php?token=Joseph_vit" > /dev/null
```
*(Esta opción hace que el servidor visite la URL en secreto usando el token que tienes configurado en tu `.env`)*.

---
**Recuerda:** Sube la actualización de la carpeta `api/` a tu servidor en producción para que el archivo `api/backup.php` esté disponible.
