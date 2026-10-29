# Tareas — Spec 004: Mecanismos de Respaldo y Recuperación en el Menú Principal

- [x] **T1. Suite de pruebas unitarias para validación, previsualización y restauración (`tests/backup_restore.test.js`).** RF-03, RF-04, RNF-02
  - Hecho cuando: `tests/backup_restore.test.js` valide la estructura de backups, previsualización de pedidos y modos `merge`/`replace` con `node --test` pasando en verde.

- [x] **T2. Interfaz en Menú Principal y Modal de Recuperación (`index.html` y `assets/css/custom.css`).** RF-01, RF-02, RF-04, RNF-01
  - Hecho cuando: El `<header>` incluya los botones `#btn-header-backup` y `#btn-header-restore`, y exista el diálogo `<dialog id="modal-restore">` con selector de archivo, previsualización y selector de modo.

- [x] **T3. Integración en UI y Storage (`assets/js/storage.js`, `assets/js/ui.js` y `assets/js/main.js`).** RF-01, RF-02, RF-03, RF-04, RF-05, RF-06
  - Hecho cuando: Al presionar "Respaldar" en el menú principal se descargue inmediatamente el archivo `.json`; y al presionar "Recuperar", el modal permita seleccionar el archivo, previsualizar los pedidos, elegir fusión o reemplazo, y sincronizar al confirmar.

- [x] **T4. Verificación integral en navegador, suite completa verde y actualización de memoria.** RNF-01, RNF-02, RNF-03
  - Hecho cuando: Toda la suite de pruebas pase en verde con `node --test`, sintaxis JS verificada con `node -c`, ejecución interactiva en navegador con DevTools y registro en `memory.md`.
