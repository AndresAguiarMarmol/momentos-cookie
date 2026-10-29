# Plan Técnico — Spec 003: Comprobante de Entrega Imprimible y Configuración del Taller

## 1. Archivos y responsabilidades

| Archivo | Responsabilidad principal | Requisitos cubiertos |
| :--- | :--- | :--- |
| `assets/js/receipt.js` | Funciones puras para generar la estructura HTML del ticket de entrega y formatear datos del comprobante. | RF-01, RF-02, CL-01, CL-02 |
| `assets/js/storage.js` | Métodos `getSettings()` y `saveSettings()` para guardar y recuperar la configuración de negocio en `localStorage`. | RF-05, RF-06, RNF-02 |
| `index.html` | Diálogos nativos `<dialog id="modal-receipt">` y `<dialog id="modal-settings">`, botón de ajustes en el header. | RF-01, RF-04, RNF-01 |
| `assets/css/custom.css` | Reglas de impresión `@media print` para aislar exclusivamente `#printable-receipt` al imprimir. | RF-03, RNF-01 |
| `assets/js/ui.js` | Renderizado del ticket en el modal y sincronización de datos de configuración con la interfaz. | RF-01, RF-02, RF-06 |
| `assets/js/main.js` | Controladores de apertura/cierre de modal de ajustes y de ticket, disparador de `window.print()`. | RF-01, RF-04, RF-06 |
| `tests/receipt.test.js` | Suite de pruebas unitarias puras con `node --test` para validar el formateo y generación de tickets. | RF-01, RF-02, CL-01, CL-02 |

---

## 2. Funciones puras

```javascript
// Genera el HTML formateado del ticket de entrega
function generarTicketEntregaHtml(order, settings = {})

// Formatea el resumen de pago para el comprobante
function formatearResumenPagoTicket(payment, simboloMoneda = '$')
```

---

## 3. Estrategia de Pruebas

Pruebas en `tests/receipt.test.js`:
- Generación de ticket con todos los campos (cliente, código, fecha, teléfono, empaque, kits).
- Comprobante con saldo pendiente cero ("PAGADO AL 100%").
- Comprobante con saldo pendiente por cobrar destacado.
- Omitir sección de notas si están vacías.
- Uso de nombre y teléfono personalizado del negocio según settings.

