# Plan Técnico — Spec 006 (Consolidación de Pedidos por Cliente y Fecha)

## 1. Archivos Involucrados
- `assets/js/orders.js`:
  - `consolidarPedidosPorClienteYFecha(pedidos)`: Función pura que agrupa órdenes por cliente y fecha de entrega, fusionando sus ítems, calculando el nuevo total y sumando abonos previos.
- `assets/js/storage.js`:
  - Actualizar el dataset `RECOVERED_ORDERS` con las órdenes consolidadas.
  - Exponer método `consolidateCurrentOrders()` en el servicio de almacenamiento para aplicar la consolidación sobre el almacenamiento activo.
- Archivos de Respaldo (`recuperado_pedidos.json`, `momentos-cookie-backup-recuperado.json`):
  - Actualizados con el dataset consolidado de 11 órdenes limpias.
- `tests/consolidate_orders.test.js`:
  - Pruebas unitarias de la función pura y verificación de balance contable exacto.

## 2. Reglas de Fusión y Agrupación
- **Criterio de agrupación:**
  - Clave: `normName(o.customer.name) + '_' + o.dates.deliveryDate`.
  - Normalización de nombres: elimina acentos, barras, espacios múltiples y normaliza alias conocidos (ej: `ALEJANDA OLEA` -> `ALEJANDRA OLEA`, `ANDRES/ TRABAJO` -> `ANDRES TRABAJO`).
- **Fusión de Ítems:**
  - Se extraen los `items` de cada pedido con `normalizeOrder(pedido)`.
  - Se reasignan IDs correlativos `item-1`, `item-2`, etc.
  - Se suman los montos `payment.total` y `payment.depositAmount`.
  - El estado del pedido se mantiene en el más avanzado (ej: si uno está `En producción` y otro `Pendiente`, queda `En producción`).
  - Las notas no vacías se concatenan.

## 3. Estrategia de Pruebas con `node --test`
- Comprobar que los 17 pedidos originales se transforman en 11 pedidos consolidados.
- Comprobar que el total facturado global ($226.700 aprox.) y el total cobrado sean exactamente idénticos antes y después.
- Comprobar que el total de galletas a hornear sea exactamente idéntico.

