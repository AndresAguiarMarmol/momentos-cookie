# Tareas — Spec 006 (Consolidación de Pedidos por Cliente y Fecha)

- [x] **T1. Función pura de consolidación y pruebas TDD.** RF-1, RF-2, RF-3, RF-4
  - Implementar `consolidarPedidosPorClienteYFecha(pedidos)` en `assets/js/orders.js`.
  - Crear `tests/consolidate_orders.test.js` para validar la fusión de ítems, sumatoria exacta de montos y preservación de pedidos únicos.
  - Hecho cuando: `node --test tests/consolidate_orders.test.js` pase al 100% en verde comprobando 11 pedidos consolidados con el balance financiero idéntico.

- [x] **T2. Consolidación de datos en almacenamiento y archivos de respaldo.** RF-5
  - Actualizar `RECOVERED_ORDERS` en `assets/js/storage.js`, `recuperado_pedidos.json` y `momentos-cookie-backup-recuperado.json`.
  - Añadir método `consolidateCurrentOrders()` en el servicio de almacenamiento.
  - Hecho cuando: Al reiniciar o cargar la app se muestren las 11 órdenes consolidadas con sus ítems completos.

- [x] **T3. Validación integral de la suite y cierre de la especificación.** RF-1 a RF-5
  - Ejecutar la suite completa de pruebas unitarias (`node --test`), verificar en Chrome DevTools y actualizar `memory.md`.
  - Hecho cuando: 100% de los tests en verde y sin errores en navegador.

