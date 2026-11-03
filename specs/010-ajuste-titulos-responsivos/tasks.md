# Tareas — Spec 010 (Ajuste de Títulos Responsivos para iPhone y PC)

- [x] **T1. Suite de pruebas unitarias para títulos responsivos (TDD Red).** RF-1 a RF-5
  - Crear `tests/responsive_titles.test.js` con las pruebas que verifiquen las variantes móviles y de PC en la navegación, bloques de semáforo y modales.
  - Ejecutar `node --test tests/responsive_titles.test.js` y confirmar fallos esperados en fase Red.

- [x] **T2. Títulos responsivos en barra de navegación y bloques de semáforo (TDD Green).** RF-1, RF-2, RF-3
  - Actualizar los botones de `<nav>` en `index.html` con las variantes `sm:hidden` y `hidden sm:inline`.
  - Actualizar los títulos de los grupos de semáforo en `#view-planning`.
  - Comprobar que pasen los tests correspondientes.

- [x] **T3. Títulos responsivos en producción, formulario y modales (TDD Green).** RF-4, RF-5, RF-6
  - Actualizar los encabezados en la vista de producción, pasos del formulario y modales en `index.html`.
  - Comprobar que el 100% de `tests/responsive_titles.test.js` pase en verde.

- [x] **T4. Validación integral, actualización de `memory.md` y sincronización Git.** RF-1 a RF-6
  - Ejecutar la suite completa (`node --test tests/*.test.js`).
  - Actualizar `memory.md`, marcar la spec como `implementada`, comitear y pushear a GitHub.
