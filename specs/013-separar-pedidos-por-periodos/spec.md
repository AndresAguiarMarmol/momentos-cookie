# Spec 013 — Separación de Pedidos por Períodos en Todos los Pedidos con Prioridad al Período Actual

Estado: implementada

## 1. Contexto y Objetivo
En la aplicación de gestión de pedidos de repostería artesanal **Momentos Cookie**, la vista **"Todos los Pedidos"** (`#view-orders`) presenta actualmente todos los pedidos en una única grilla continua sin diferenciación temporal. Esto dificulta que la encargada del taller identifique de un vistazo qué pedidos corresponden a las entregas del **período en curso (mes actual)** en comparación con pedidos programados para meses futuros o pedidos históricos de meses pasados.
El objetivo es separar y agrupar visualmente la lista de pedidos en bloques por período temporal, dando prioridad al **Período Actual (Mes en curso)** al tope de la vista, seguido de los bloques de **Próximos Períodos** y **Períodos Anteriores / Histórico**, manteniendo intacto el funcionamiento existente de búsqueda, filtros y acciones de pedidos.

## 2. Usuarios y Roles
- **Repostera / Encargada del taller:** Necesita acceder rápidamente a los pedidos del período en curso sin perder de vista los compromisos futuros ni el archivo histórico.

## 3. Historias de Usuario
- **HU-1**: Como encargada del taller, al ingresar a "Todos los Pedidos", quiero ver en primer lugar y destacado el bloque de pedidos del **Período Actual**, para enfocarme de inmediato en la operación y entregas del mes en curso.
- **HU-2**: Como encargada del taller, quiero ver claramente separados los pedidos de **Próximos Períodos** y los pedidos de **Períodos Anteriores / Histórico**, cada uno con su encabezado y conteo de órdenes.
- **HU-3**: Como encargada del taller, quiero que los buscadores y filtros por estado (incluyendo el filtro de saldo pendiente) sigan funcionando de forma reactiva dentro de esta estructura por períodos.

## 4. Definiciones
- **Período Actual:** El mes y año en curso (determinado por la fecha actual del sistema, formato `YYYY-MM`, por ejemplo `2026-11` para Noviembre 2026).
- **Próximos Períodos:** Pedidos cuya fecha de entrega (`deliveryDate`) corresponde a un mes posterior al período actual (`> YYYY-MM`).
- **Períodos Anteriores / Histórico:** Pedidos cuya fecha de entrega (`deliveryDate`) corresponde a un mes anterior al período actual (`< YYYY-MM`).
- **Bloque de Período:** Contenedor visual que incluye:
  - Encabezado con título del período, insignia destacada (ej. `Período Actual - Prioridad`), icono alusivo y badge con la cantidad de pedidos en dicho bloque.
  - Grilla responsiva de tarjetas de pedidos (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`).

## 5. Requisitos Funcionales (EARS)
- **RF-1 (Ubicuidad)**: EL SISTEMA dispone en `assets/js/orders.js` de una función pura `agruparPedidosPorPeriodo(pedidos, fechaReferencia)` que clasifica los pedidos en 3 colecciones: `periodoActual`, `proximos` y `anteriores`, ordenando los pedidos internamente por fecha y hora de entrega.
- **RF-2 (Basado en Estado)**: MIENTRAS el usuario visualice la sección "Todos los Pedidos" (`renderAllOrdersView`), EL SISTEMA renderiza los pedidos agrupados por períodos, ubicando el bloque del **Período Actual** en la primera posición superior con estilo destacado de prioridad.
- **RF-3 (Opcional)**: SI existen pedidos correspondientes a **Próximos Períodos**, ENTONCES EL SISTEMA renderiza a continuación el bloque correspondiente con su encabezado, icono de calendario futuro y contador de pedidos.
- **RF-4 (Opcional)**: SI existen pedidos correspondientes a **Períodos Anteriores**, ENTONCES EL SISTEMA renderiza el bloque de archivo histórico con su encabezado, icono de historial y contador de pedidos.
- **RF-5 (Estado no deseado)**: SI en el Período Actual no se registran pedidos coincidentes con la búsqueda o filtro aplicado, pero sí existen pedidos en otros períodos, ENTONCES EL SISTEMA muestra un mensaje informativo amigable dentro del bloque del período actual indicando la ausencia de pedidos para el mes en curso.
- **RF-6 (Estado no deseado)**: SI ningún período contiene pedidos (tras aplicar búsqueda de texto o filtros sin coincidencia), ENTONCES EL SISTEMA oculta los bloques y despliega el contenedor `#orders-empty-state`.
- **RF-7 (Compatibilidad)**: CUANDO el usuario interactúe con el buscador `#search-input` o seleccione un chip de filtro de estado (`#orders-status-filters`), EL SISTEMA actualiza reactivamente la vista aplicando la separación por períodos sobre los pedidos filtrados sin recargar la página.

## 6. Requisitos No Funcionales
- **RNF-1 (No Regresión)**: No alterar la lógica de cálculo financiero, semáforo de urgencia, modal de detalle, comprobante de recibo ni persistencia local (`localStorage`).
- **RNF-2 (Diseño y Responsividad)**: Mantener la coherencia estética de repostería artesanal (tonos canela, chocolate, marfil y acentos cálidos) y legibilidad óptima tanto en móvil (iPhone) como en escritorio.

## 7. Criterios de Finalización (DoD)
- [x] Función pura `agruparPedidosPorPeriodo` documentada, testeada y exportada en `assets/js/orders.js`.
- [x] Función `renderAllOrdersView` en `assets/js/ui.js` actualizada para renderizar los bloques de períodos priorizados.
- [x] Estructura responsiva en `index.html` adaptada para contener los bloques con fluidez.
- [x] Pruebas unitarias completas en `tests/order_periods.test.js` verificando lógica de agrupación, priorización y casos de borde.
- [x] 100% de la suite de pruebas del proyecto pasando en verde con `node --test`.
- [x] `memory.md` actualizado y cambios versionados en Git.
