# Tareas — Spec 003: Comprobante de Entrega Imprimible y Configuración del Taller

- [x] **T1. Generador de ticket de entrega puro y pruebas unitarias (`assets/js/receipt.js` y `tests/receipt.test.js`).** RF-01, RF-02, CL-01, CL-02
  - Hecho cuando: `tests/receipt.test.js` valide la generación del ticket, inclusión de datos comerciales, formatos de saldo y notas pasando al 100% en verde con `node --test`.

- [x] **T2. Modales de Ticket y Ajustes en el DOM (`index.html` y `assets/css/custom.css`).** RF-01, RF-03, RF-04, RNF-01
  - Hecho cuando: `index.html` incluya los diálogos `<dialog id="modal-receipt">` y `<dialog id="modal-settings">`, botón de ajustes en la cabecera y reglas de impresión térmica en `custom.css`.

- [x] **T3. Integración en UI y persistencia de configuración (`assets/js/ui.js`, `assets/js/storage.js` y `assets/js/main.js`).** RF-04, RF-05, RF-06
  - Hecho cuando: Al pulsar "Comprobante" en cualquier pedido se abra el ticket formateado con opción de impresión, y al modificar los ajustes en el modal se guarden en `localStorage` y actualicen la cabecera en tiempo real.

- [x] **T4. Verificación integral, suite completa en verde y cierre de spec.** RNF-01, RNF-02
  - Hecho cuando: Toda la suite de pruebas unitarias pase en verde, sintaxis JS validada con `node -c`, `spec.md` actualizado a `implementada` y `memory.md` registrado.
