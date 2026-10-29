# Tareas — Spec 002: Planilla de Producción, Métricas y Backup

- [x] **T1. Lógica pura de producción, métricas financieras y formateo CSV/JSON (`assets/js/production.js` y `tests/production.test.js`).** RF-01, RF-02, RF-03, RF-06, RF-08, RF-10
  - Hecho cuando: `tests/production.test.js` valide con `node --test` la consolidación de galletas, multiplicación en combos, conteo de kits, métricas financieras, generación de CSV con BOM y validación de backups pasando al 100% en verde.

- [x] **T2. Exportación de archivos e importación con fusión inteligente (`assets/js/storage.js`).** RF-07, RF-08, RF-09, RF-10
  - Hecho cuando: `storage.js` soporte exportar backups JSON, exportar CSV, e importar datos con validación y fusión inteligente sin duplicados.

- [x] **T3. Pestaña de Producción y Métricas en la interfaz (`index.html` y `assets/css/custom.css`).** RF-04, RF-05, RF-06, RNF-01, RNF-03
  - Hecho cuando: `index.html` incluya la pestaña `#tab-production` y vista `#view-production` con métricas, tabla de horneado con checkboxes, selector temporal y modal de importación, estilizado en `custom.css`.

- [x] **T4. Renderizado reactivo y controladores de eventos (`assets/js/ui.js` y `assets/js/main.js`).** RF-04, RF-05, RF-07, RF-08, RF-09
  - Hecho cuando: La planilla de producción recalcule en tiempo real según el filtro (*Hoy*, *Esta semana*, *Todos*), el checklist permita tachar lotes horneados, y los botones de exportar/importar descarguen y carguen archivos correctamente.

- [x] **T5. Validación integral, suite completa verde y cierre de spec.** RNF-01, RNF-02, RNF-03
  - Hecho cuando: Toda la suite de pruebas unitarias pase en verde, sintaxis validada con `node -c`, `spec.md` actualizado a `implementada` y `memory.md` registrado.
