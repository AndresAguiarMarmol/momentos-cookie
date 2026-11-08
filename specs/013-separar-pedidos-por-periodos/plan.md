# Plan de Implementación — Spec 013: Separación de Pedidos por Períodos en Todos los Pedidos

## 1. Arquitectura y Enfoque
Para cumplir con "No cambiar lo que funciona" y preservar la modularidad estricta de Vanilla JS:
- **Capa Lógica (`assets/js/orders.js`)**: Se agrega la función pura `agruparPedidosPorPeriodo(pedidos, fechaReferencia)` que toma la lista de pedidos (ya filtrada si aplica) y la divide en `{ periodoActual, proximos, anteriores, currentPeriodKey, periodoNombre }`. Cada subgrupo mantiene los pedidos ordenados cronológicamente por `ordenarPedidosPorFecha`.
- **Capa UI (`assets/js/ui.js`)**: Se actualiza `renderAllOrdersView(orders, options)` para que, en vez de inyectar una lista plana en `#all-orders-container`, genere las secciones estilizadas:
  1. Sección **Período Actual (`periodoNombre`)** con badge `Prioridad`.
  2. Sección **Próximos Períodos** (si contiene elementos).
  3. Sección **Períodos Anteriores / Histórico** (si contiene elementos).
  Cada sección contendrá su encabezado de taller y su contenedor grid con las tarjetas generadas mediante `renderOrderCardHtml`.
- **Capa Presentación (`index.html`)**: El contenedor `#all-orders-container` se ajusta para funcionar como contenedor vertical (`space-y-6`) que aloja los bloques de períodos.
- **Capa Pruebas (`tests/order_periods.test.js`)**: Se crea una suite de pruebas unitarias que verifique la correcta partición de pedidos, el manejo de fechas de entrega vs fechas de creación, casos con grupos vacíos, filtros y preservación del conteo global.

## 2. Fases de Ejecución

### Fase 1: Función Pura de Agrupación en `assets/js/orders.js`
- Implementar `agruparPedidosPorPeriodo(pedidos, fechaReferencia)`.
- Exportar en `OrdersModule` y exponer en `window.Orders`.

### Fase 2: Actualización de Renderizado en `assets/js/ui.js` e `index.html`
- Adaptar `#all-orders-container` en `index.html`.
- Modificar `renderAllOrdersView` en `assets/js/ui.js` para generar los bloques de período con sus encabezados y contadores.
- Re-ejecutar `lucide.createIcons()` tras la inserción dinámica.

### Fase 3: Pruebas Unitarias Automatizadas
- Crear `tests/order_periods.test.js`.
- Ejecutar la suite completa (`node --test tests/*.test.js`) y asegurar 0 fallos.

### Fase 4: Documentación y Memoria
- Actualizar `memory.md` (Sección 2 y Sección 3).
- Actualizar `specs/013-separar-pedidos-por-periodos/tasks.md` y `spec.md`.
- Sincronizar repositorio en GitHub (`main`).
