# Tareas — Spec 007 (Logotipo Oficial e Identidad Visual)

- [x] **T1. Guardado de imagen y suite de pruebas inicial (TDD Red).** RF-1
  - Crear carpeta `assets/img/` y copiar la imagen a `assets/img/logo.jpg`.
  - Crear `tests/logo.test.js` con los 5 casos de prueba que validen el archivo, `index.html`, `manifest.json` y `receipt.js`.
  - Comprobar estado Red donde las aserciones de integración fallen hasta que se implementen.

- [x] **T2. Integración en `index.html` y `manifest.json` (TDD Green).** RF-2, RF-3, RF-5
  - Incorporar `<link rel="icon" type="image/jpeg" href="assets/img/logo.jpg">` en `<head>`.
  - Sustituir el ícono genérico del header por `<img src="assets/img/logo.jpg" ...>`.
  - Actualizar `manifest.json` con el icono del logotipo.
  - Ejecutar tests y validar que pasen las aserciones correspondientes.

- [x] **T3. Integración en comprobante/ticket de entrega (`assets/js/receipt.js`).** RF-4
  - Actualizar la función pura `generarTicketEntregaHtml` para incluir el logotipo en el encabezado.
  - Ejecutar tests hasta tener el 100% en verde.

- [x] **T4. Validación integral, actualización de `memory.md` y sincronización Git.** RF-1 a RF-5
  - Ejecutar la suite completa (`node --test tests/*.test.js`).
  - Actualizar `memory.md`, marcar la spec como `implementada`, comitear y pushear a GitHub.
