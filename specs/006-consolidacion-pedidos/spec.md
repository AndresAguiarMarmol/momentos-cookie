# Spec 006 — Consolidación de Pedidos por Cliente y Fecha de Entrega

Estado: implementada

## 1. Contexto y Objetivo
Antes de la implementación de la Spec 005 (Pedidos Multi-Ítem), cuando un cliente solicitaba varios productos para la misma fecha, el taller debía ingresar pedidos separados e independientes para ese mismo cliente. Con el soporte multi-ítem ya operativo, se requiere consolidar los pedidos existentes de acuerdo al cliente y la fecha comprometida de entrega en una sola orden con múltiples ítems, preservando todos los productos, montos, abonos y notas, sin alterar la operatividad de la aplicación.

## 2. Usuarios y Roles
- **Repostera / Administradora del taller:** Visualiza los pedidos del cliente unificados en una sola tarjeta de entrega en lugar de tarjetas fragmentadas repetidas.

## 3. Historias de Usuario
- **HU-1**: Como encargada del taller, quiero que los pedidos registrados para un mismo cliente en una misma fecha de entrega se consoliden en una única orden multi-ítem para coordinar la producción y entrega de forma limpia.

## 4. Definiciones
- **Consolidación:** Proceso que fusiona dos o más órdenes con el mismo cliente (normalizado) y la misma fecha de entrega en una sola orden con la suma de todos sus ítems, manteniendo un identificador principal y recalculando montos y pagos.

## 5. Requisitos Funcionales (EARS)
- **RF-1**: CUANDO se ejecuta la consolidación de pedidos, EL SISTEMA agrupa las órdenes por cliente (normalizando mayúsculas, espacios, barras y tildes) y fecha comprometida de entrega.
- **RF-2**: CUANDO dos o más órdenes corresponden al mismo cliente y a la misma fecha, EL SISTEMA las fusiona en un único pedido con la colección completa de todos sus ítems individuales y combos.
- **RF-3**: EL SISTEMA calcula el total financiero del pedido consolidado sumando los subtotales de todos sus ítems, suma los abonos monetarios previos y recalcula el saldo pendiente y el estado de pago (`Pagado total`, `Abono/Seña` o `Pendiente`).
- **RF-4**: CUANDO un pedido no tiene coincidencias de cliente y fecha con ninguna otra orden, EL SISTEMA lo mantiene exactamente intacto.
- **RF-5**: CUANDO se actualiza el almacenamiento local con los pedidos consolidados, EL SISTEMA conserva la información en `localStorage` y en los archivos de respaldo del taller (`recuperado_pedidos.json`, `storage.js`).

## 6. Requisitos No Funcionales
- **RNF-1**: Cero pérdida de información: la suma total de dinero y la cantidad de galletas a hornear debe ser idéntica antes y después de la consolidación.
- **RNF-2**: Idempotencia: ejecutar la consolidación múltiples veces debe producir exactamente el mismo resultado sin duplicar ítems.

## 7. Criterios de Finalización (DoD)
- [ ] Función pura `consolidarPedidosPorClienteYFecha(pedidos)` en `assets/js/orders.js`.
- [ ] Dataset `RECOVERED_ORDERS` en `assets/js/storage.js` y `recuperado_pedidos.json` consolidados a 11 pedidos únicos.
- [ ] Pruebas unitarias en `tests/consolidate_orders.test.js` verificando que el total de galletas y dinero sea exactamente igual.
- [ ] 100% de la suite de pruebas pasando en verde con `node --test`.

