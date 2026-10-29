# Tareas — Spec 005 (Pedidos Multi-Ítem)

- [x] **T1. Lógica pura multi-ítem y pruebas unitarias.** RF-5, RF-7
  - Funciones puras en `assets/js/orders.js`: `normalizeOrder`, `calculateItemSubtotal`, `calculateOrderTotals`, `formatOrderItemsSummary`.
  - Hecho cuando: Ejecutar `node --test tests/multi_item.test.js` valide la normalización de pedidos antiguos, cálculo de subtotales, totales combinados y resúmenes con 100% de éxito.

- [x] **T2. Integración en capa de persistencia y retrocompatibilidad.** RF-6, RF-7
  - Adaptar `assets/js/storage.js` para normalizar pedidos automáticamente al leer y guardar sin romper pedidos legacy.
  - Hecho cuando: Las pruebas existentes de almacenamiento y los 17 pedidos grabados se carguen con su colección de ítems sin alterar ningún valor existente.

- [x] **T3. Consolidación de producción y comprobante impreso.** RF-10, RF-11
  - Actualizar `assets/js/production.js` para consolidar galletas por sabor/combo a través de todos los ítems.
  - Actualizar `assets/js/receipt.js` para pintar la tabla con todos los ítems en el comprobante térmico.
  - Hecho cuando: Los tests de producción y recibo validen pedidos multi-ítem con múltiples sabores y combos en una misma orden.

- [x] **T4. Formulario dinámico con lista reactiva de ítems.** RF-1, RF-2, RF-3, RF-4, RF-5
  - Actualizar `index.html` y `assets/js/ui.js` para renderizar el contenedor `#order-items-container`, botón `＋ Agregar otro ítem`, conmutador Individual/Combo por ítem y botón de eliminar ítem.
  - Hecho cuando: En el navegador se puedan agregar N ítems, alternar su tipo, eliminar ítems y verificar el cálculo del gran total en tiempo real.

- [x] **T5. Integración en flujo de guardado, edición, tarjetas y detalle.** RF-6, RF-8, RF-9
  - En `assets/js/ui.js` y `main.js`, extraer los N ítems al guardar/editar, pintar el resumen de ítems en las tarjetas de planificación y listar el desglose completo en el modal de detalle.
  - Hecho cuando: Crear o editar un pedido multi-ítem persista correctamente, se muestre en las tarjetas de planificación y se visualice en el modal de detalle.

- [x] **T6. Validación integral y cierre de la especificación.** RF-1 a RF-11
  - Ejecución de la suite completa de tests (`node --test`), verificación en Chrome DevTools (escritorio y móvil 375px) y actualización de `memory.md`.
  - Hecho cuando: 100% de los tests en verde, funcionalidad probada en navegador y documentación actualizada.

