# 📝 Cosas Pendientes - Kreative Vit

Este archivo contiene el listado de tareas pendientes o ajustes que se deben realizar después de la fase de pruebas o de cara al lanzamiento en producción.

---

## 📌 Pendientes Prioritarios

### 🛡️ Ajustes de Insignias y Seguridad
1. **[ ] Volver a ocultar las insignias de generación (Gen 18 a Gen 29)**
   - *Detalle*: Actualmente, para la fase de pruebas, todas las insignias de las Generaciones 18 a 29 se mantienen visibles/activas en el catálogo para que se puedan revisar sus diseños y respuestas. Una vez terminadas las pruebas, se deben ocultar de nuevo en el catálogo para los usuarios que no pertenezcan a dichas generaciones (mostrándoles un diseño con candado y descripción secreta).
2. **[ ] Calibración de palabras clave para desbloqueo automático**
   - *Detalle*: Revisar los logs reales de los usuarios para optimizar las palabras clave que desbloquean las insignias de **Git**, **cPanel**, **Wiki** y **Podcast**, reduciendo la posibilidad de falsos positivos.
3. **[ ] Sincronización final del Creador (Joseph Joestar)**
   - *Detalle*: Validar si se requiere registrar permanentemente a Joseph Joestar en el servidor de autenticación para que coincida exactamente con la base de datos central de Alpha Docere.

---

## ⚙️ Notas de Desarrollo (Test Mode)
- *Modo de Prueba Activo*: Las insignias de Generaciones 18 a 29, Git, cPanel, Wiki y Podcast se calculan de manera dinámica a partir del contenido de las bitácoras guardadas en `localStorage`.
- *Ubicación de Imágenes*: Todos los recursos gráficos se encuentran en `/public/insignias/`.
