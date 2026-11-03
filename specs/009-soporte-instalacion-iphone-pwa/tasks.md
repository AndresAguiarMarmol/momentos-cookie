# Tareas — Spec 009 (Preparación para Instalación en iPhone / iOS PWA)

- [x] **T1. Suite de pruebas unitarias para iOS y PWA (TDD Red).** RF-1 a RF-6
  - Crear `tests/ios_pwa.test.js` con aserciones que validen metaetiquetas de iOS, apple-touch-icon, safe-areas en CSS, manifest.json, sw.js y guía de instalación.
  - Ejecutar `node --test tests/ios_pwa.test.js` y confirmar fallos esperados en fase Red.

- [x] **T2. Metaetiquetas de iOS, apple-touch-icon y Safe Areas en CSS (TDD Green).** RF-1, RF-2, RF-3
  - Actualizar `<head>` de `index.html` con `viewport-fit=cover`, metaetiquetas `apple-mobile-web-app-*` y `<link rel="apple-touch-icon">`.
  - Añadir soporte para `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)` en `assets/css/custom.css`.
  - Comprobar que pasen los tests correspondientes en `tests/ios_pwa.test.js`.

- [x] **T3. Actualización de PWA Manifest, Service Worker y Guía en iPhone (TDD Green).** RF-4, RF-5, RF-6
  - Actualizar `manifest.json` asegurando `display: "standalone"`, `scope: "./"`, y nombre corto.
  - Actualizar `sw.js` a versión `momentos-cookie-v2` e incluir `logo.jpg`, `production.js` y `receipt.js`.
  - Añadir guía visual accesible para iPhone en el modal de configuración de `index.html`.
  - Comprobar que el 100% de `tests/ios_pwa.test.js` pase en verde.

- [x] **T4. Validación integral, actualización de `memory.md` y sincronización Git.** RF-1 a RF-7
  - Ejecutar la suite completa (`node --test tests/*.test.js`).
  - Validar interactivamente en Chrome con DevTools MCP simulando viewport móvil de iPhone.
  - Actualizar `memory.md`, marcar la spec como `implementada`, comitear y pushear a GitHub.
