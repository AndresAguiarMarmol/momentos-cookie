# Tareas — Spec 008 (Botón y Filtro de Saldo Pendiente)

- [x] **T1. Funciones puras de cálculo y filtrado de saldo pendiente (TDD Red-Green).** RF-1
  - Escribir `tests/pending_balance_filter.test.js` con las pruebas unitarias para `tieneSaldoPendiente`, `filtrarPedidosConSaldoPendiente` y `obtenerMetricasSaldoPendiente`.
  - Implementar las funciones puras en `assets/js/orders.js` y exportarlas en `OrdersModule`.
  - Comprobar que los tests de T1 pasen al 100% en verde.

- [x] **T2. Interfaz y cableado de eventos (TDD Green).** RF-2, RF-3, RF-4, RF-5, RF-6
  - Agregar botón `#btn-nav-pending-balance` con badge `#pending-balance-badge` en el `<nav>` de `index.html`.
  - Agregar chip `data-status="saldo-pendiente"` en `#orders-status-filters` de `index.html`.
  - Conectar el soporte de `statusFilter === 'saldo-pendiente'` en `filterOrders` y actualizar el badge del header en `assets/js/ui.js`.
  - Cablear el evento click en `#btn-nav-pending-balance` en `assets/js/main.js` para alternar la vista y activar el filtro.
  - Comprobar que todos los tests de `tests/pending_balance_filter.test.js` pasen en verde.

- [x] **T3. Validación integral, actualización de `memory.md` y sincronización Git.** RF-1 a RF-6
  - Ejecutar la suite completa de pruebas unitarias (`node --test tests/*.test.js`).
  - Validar interactivamente en Chrome con DevTools MCP.
  - Actualizar `memory.md`, marcar la spec como `implementada`, comitear y pushear a GitHub.
