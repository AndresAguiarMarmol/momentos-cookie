# Plan Técnico — Spec 008 (Botón y Filtro de Saldo Pendiente)

## 1. Arquitectura y Lógica de Negocio (`assets/js/orders.js`)
- **Funciones puras a implementar y exportar en `OrdersModule`:**
  1. `tieneSaldoPendiente(order)`:
     - Retorna `true` si la orden no está cancelada (`order.status !== 'Cancelado'`), y (`order.payment.status !== 'Pagado total'` o `calcularSaldo(order) > 0`).
  2. `filtrarPedidosConSaldoPendiente(pedidos)`:
     - Filtra una lista de pedidos retornando solo aquellos que cumplan `tieneSaldoPendiente(order)`.
  3. `obtenerMetricasSaldoPendiente(pedidos)`:
     - Retorna `{ cantidad: number, totalSaldo: number }` calculando la suma del saldo por cobrar y la cantidad de órdenes con saldo pendiente.

## 2. Modificaciones en Interfaz (`index.html`)
- **Barra de navegación principal (`<nav>`):**
  - Añadir botón interactivo después de `tab-orders` ("Todos los Pedidos"):
    ```html
    <button id="btn-nav-pending-balance" class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200" title="Ver pedidos con saldo pendiente de cobro">
      <i data-lucide="banknote" class="w-4 h-4 text-amber-600"></i>
      <span>Saldo Pendiente</span>
      <span id="pending-balance-badge" class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 ml-1">0</span>
    </button>
    ```
- **Barra de filtros de estado en "Todos los Pedidos" (`#orders-status-filters`):**
  - Añadir chip específico:
    ```html
    <button data-status="saldo-pendiente" class="filter-chip px-3 py-1.5 rounded-lg bg-[#F0EAE1] text-[#5A4A42] hover:bg-[#E5DDD2] transition-colors flex items-center gap-1">
      <i data-lucide="circle-dollar-sign" class="w-3.5 h-3.5 text-amber-700"></i>
      <span>Con Saldo Pendiente</span>
    </button>
    ```

## 3. Coordinación y Renderizado (`assets/js/ui.js` & `assets/js/main.js`)
- En `ui.js`:
  - En la función que actualiza contadores y métricas globales (`updateHeaderCounters` o similar), actualizar el texto del badge `#pending-balance-badge` con `metricas.cantidad`.
  - En la función `filterOrders(query, statusFilter)`:
    - Si `statusFilter === 'saldo-pendiente'`, aplicar la función pura `tieneSaldoPendiente(order)`.
    - Actualizar `#orders-count-badge` para mostrar también el total de dinero por cobrar cuando este filtro esté activo (ej. `"Mostrando 8 pedidos con saldo pendiente (Total por cobrar: $140.300)"`).
- En `main.js`:
  - Event listener en `#btn-nav-pending-balance`:
    - Cambia a la vista "Todos los Pedidos" (`switchView('view-orders')`).
    - Selecciona el chip `data-status="saldo-pendiente"` y desmarca los demás chips.
    - Ejecuta el filtrado reactivo de pedidos.
    - Asegura que `lucide.createIcons()` se ejecute si es necesario.

## 4. Estrategia de Pruebas (TDD)
- Crear `tests/pending_balance_filter.test.js`:
  - Caso 1: `tieneSaldoPendiente` identifica correctamente pedidos con saldo pendiente y pedidos 100% pagados o cancelados.
  - Caso 2: `filtrarPedidosConSaldoPendiente` filtra una lista mixta retornando únicamente las órdenes con deuda.
  - Caso 3: `obtenerMetricasSaldoPendiente` calcula la cantidad exacta y el saldo financiero pendiente total.
  - Caso 4: Verificación estructural en `index.html` (presencia de `#btn-nav-pending-balance`, `#pending-balance-badge` y el chip `saldo-pendiente`).
  - Caso 5: Verificación de filtro integrado en `ui.js`.
