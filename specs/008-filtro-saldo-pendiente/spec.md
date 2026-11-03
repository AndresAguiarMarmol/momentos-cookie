# Spec 008 — Botón de Acceso Rápido y Filtro para Pedidos con Saldo Pendiente

Estado: implementada

## 1. Contexto y Objetivo
En el taller de repostería artesanal Momentos Cookie, los clientes suelen reservar sus pedidos dejando un abono o seña inicial, o acordando el pago contra entrega. Para una gestión de cobranza ágil e inmediata sin tener que buscar pedido por pedido, la encargada necesita un botón directo en la barra superior que filtre y muestre exclusivamente los pedidos que mantienen un saldo pendiente de cobro, indicando cuántos pedidos tienen deuda y facilitando su cobro antes o al momento de la entrega.

## 2. Usuarios y Roles
- **Repostera / Administradora del taller:** Necesita identificar al instante qué clientes deben saldo y cuánto dinero falta por recaudar antes de despachar las galletas.

## 3. Historias de Usuario
- **HU-1**: Como encargada del taller, quiero un botón visible en la barra principal con el indicador de pedidos con saldo pendiente, para acceder con un solo toque a las cuentas por cobrar.
- **HU-2**: Como encargada del taller, al pulsar dicho botón quiero que la aplicación filtre la lista mostrando únicamente los pedidos con saldo pendiente (`saldo > 0` o estado distinto a `Pagado total`).
- **HU-3**: Como encargada del taller, quiero ver el conteo en tiempo real de cuántos pedidos tienen saldo pendiente en dicho botón.

## 4. Definiciones
- **Pedido con Saldo Pendiente:** Cualquier orden no cancelada cuyo `payment.status` sea `Pendiente` o `Abono/Seña`, o donde `payment.total - payment.depositAmount > 0`.
- **Barra de Navegación / Barra de Filtros:** Barra superior de navegación por pestañas (`<nav>`) y/o barra de filtros rápidos de la aplicación.

## 5. Requisitos Funcionales (EARS)
- **RF-1**: EL SISTEMA calcula reactivamente la cantidad de pedidos activos que tienen saldo por cobrar (`saldo > 0` y estado distinto a `Cancelado`).
- **RF-2**: EL SISTEMA muestra en la barra de navegación principal un botón dedicado `Saldo Pendiente` con icono de cobro/monedas (`banknote` o `circle-dollar-sign`) y una insignia (badge) con el número de pedidos con saldo pendiente.
- **RF-3**: CUANDO el usuario hace clic en el botón `Saldo Pendiente` de la barra, EL SISTEMA activa la vista de pedidos aplicando automáticamente el filtro de saldo pendiente, mostrando únicamente las órdenes con cobro pendiente.
- **RF-4**: EL SISTEMA incluye además un chip de filtro `Saldo Pendiente` en la barra de filtros de la sección "Todos los Pedidos" para alternar fácilmente entre todos los pedidos y solo los pendientes de cobro.
- **RF-5**: MIENTRAS el filtro de saldo pendiente esté activo, EL SISTEMA muestra en el resumen de resultados el total acumulado de dinero por cobrar y la cantidad de pedidos filtrados.
- **RF-6**: SI un pedido es actualizado a `Pagado total` o se registra un abono que cubre el 100% de la orden, ENTONCES EL SISTEMA descuenta de inmediato dicho pedido del contador del botón `Saldo Pendiente` y refresca la lista.

## 6. Requisitos No Funcionales
- **RNF-1**: Ergonomía móvil: El botón en la barra debe ser táctil (mínimo 44px de alto), con scroll horizontal fluido en móviles sin provocar desbordamientos (`no-scrollbar`).
- **RNF-2**: Consistencia visual: Emplear la paleta de colores de taller (tonos canela, ámbar o terracota) con alto contraste WCAG AA.

## 7. Criterios de Finalización (DoD)
- [x] Función pura `filtrarPedidosConSaldoPendiente(pedidos)` y cálculo de métrica en `assets/js/orders.js`.
- [x] Botón interactivo con badge reactivo en la barra de navegación de `index.html`.
- [x] Chip de filtro rápido en la barra de filtros de `index.html`.
- [x] Controlador de clic y filtrado reactivo en `assets/js/main.js` y `assets/js/ui.js`.
- [x] Pruebas unitarias en `tests/pending_balance_filter.test.js` con cobertura del 100% de los casos.
- [x] 100% de la suite de pruebas pasando en verde con `node --test`.

