# memory.md — Memoria del proyecto Momentos Cookie

Registro de todo lo que debe preservarse entre sesiones de trabajo: arquitectura de datos, decisiones técnicas tomadas e historial de cambios.
**Los agentes deben leer este archivo antes de empezar y actualizarlo al terminar cada tarea** (ver `AGENTS.md`).

---

## 1. Estructura de datos y persistencia

### A. Persistencia en `localStorage`
- **Clave:** `momentos_cookie_orders`
  - **Tipo:** Array de objetos `Order` serializados en JSON.
  - **Comportamiento:** Si no existen datos iniciales en la primera ejecución, se puede precargar un conjunto de pedidos demostrativos (seed data) para validar inmediatamente las vistas de planificación y semáforo.
- **Clave:** `momentos_cookie_settings`
  - **Tipo:** Objeto de configuración: `{ businessName, phone, currencySymbol, footerMessage }`.
  - **Comportamiento:** Persiste los datos de contacto y marca del taller; si está vacío, aplica valores por defecto amigables ("Momentos Cookie", etc.).

### B. Esquema del Pedido (`Order`)

```json
{
  "id": "MC-20261028-001",
  "customer": {
    "name": "María González",
    "phone": "+56912345678",
    "email": "maria@ejemplo.com"
  },
  "dates": {
    "createdAt": "2026-10-28T10:00:00.000Z",
    "deliveryDate": "2026-10-29",
    "deliveryTime": "15:30"
  },
  "orderType": "mixto", 
  "items": [
    {
      "id": "item-1",
      "type": "individual",
      "flavor": "Vainilla Real Glaseada",
      "comboName": "",
      "cookiesCount": 1,
      "packaging": "Bolsa celofán",
      "hasPaintKit": false,
      "quantity": 12,
      "unitPrice": 1200,
      "subtotal": 14400
    },
    {
      "id": "item-2",
      "type": "combo",
      "flavor": "",
      "comboName": "Kit Halloween Fiesta",
      "cookiesCount": 6,
      "packaging": "Caja decorativa con lazo",
      "hasPaintKit": true,
      "quantity": 2,
      "unitPrice": 12000,
      "subtotal": 24000
    }
  ],
  "details": {
    "flavor": "Vainilla Real Glaseada", 
    "comboName": "",
    "cookiesCount": 1,
    "packaging": "Bolsa celofán",
    "hasPaintKit": false,
    "quantity": 12,
    "unitPrice": 1200,
    "subtotal": 14400
  },
  "notes": "Temática de calabazas y murciélagos. Sin frutos secos por alergia.",
  "status": "En producción",
  "payment": {
    "total": 38400,
    "status": "Abono/Seña",
    "depositAmount": 20000
  }
}
```

Valores permitidos para estados:
- **`status`:** `"Pendiente"` | `"En producción"` | `"Listo para entrega"` | `"Entregado"` | `"Cancelado"`
- **`payment.status`:** `"Pendiente"` | `"Abono/Seña"` | `"Pagado total"`
- **`orderType`:** `"individual"` | `"combo"` | `"mixto"`
- **Retrocompatibilidad:** Si un pedido almacenado no contiene `items`, la función `normalizeOrder(order)` lo encapsula automáticamente como un pedido de 1 ítem a partir de `details` y `orderType`.

---

## 2. Decisiones vigentes

- **Cero compilación ni dependencias pesadas:** Aplicación ejecutable directamente abriendo `index.html` en el navegador o sirviendo con un servidor estático simple (`npx serve`, `python -m http.server`).
- **Arquitectura de módulos JavaScript Vanilla:** Código dividido en módulos desacoplados:
  - `storage.js`: CRUD y persistencia con `localStorage` / fallback a memoria.
  - `orders.js`: Lógica de negocio (cálculo de totales, clasificación por fechas, semáforos de urgencia).
  - `ui.js`: Renderizado del DOM, manipulación de vistas, alertas y modales.
  - `main.js`: Inicialización de la aplicación y escucha de eventos principales.
- **Estética cálida y funcional para taller/cocina:** Tonos cálidos acordes al rubro de repostería artesanal (marfil, canela, chocolate suave, rosa pastel/dorado sutil) combinados con indicadores funcionales de alto contraste para estados y alertas de entrega.
- **Semáforo cronológico de entregas:**
  - *Atrasados:* Fecha de entrega anterior a hoy y estado no entregado/cancelado (Badge rojo / alerta urgente).
  - *Hoy / Próximas 24 horas:* Requiere atención inmediata (Badge ámbar/naranja).
  - *Esta semana:* Planificación a corto plazo.
  - *Próximas semanas:* En cola de producción.
- **Formularios con cambio condicional dinámico:** Al alternar entre *Galletas Individuales* y *Combo / Kit*, se muestran/ocultan automáticamente los campos de tipo de empaque, selector de kit de pintura y cantidad de galletas incluidas.
- **Gestión Multi-Ítem por Pedido (Spec 005):** Cada pedido permite registrar $N$ artículos heterogéneos (mezclando galletas individuales de distintos sabores y combos especiales con kits de pintura). Al pulsar "＋ Agregar otro ítem", el sistema copia por defecto el tipo del ítem precedente para acelerar la carga repetitiva.
- **Consolidación Automática por Cliente y Fecha (Spec 006):** Múltiples órdenes destinadas al mismo cliente en la misma fecha de entrega se fusionan en una sola orden multi-ítem unificada mediante `consolidarPedidosPorClienteYFecha`. Normaliza nombres de clientes tolerando tildes, barras y variantes tipográficas, fusiona ítems, suma totales financieros y abonos, manteniendo cero pérdida de información y recalculando el estado de pago.

---

## 3. Historial de cambios

### 2026-10-29 — Implementación de Spec 006: Consolidación de Pedidos por Cliente y Fecha de Entrega
- **T1 a T3 completadas:** Consolidación de pedidos existentes por cliente y fecha comprometida de entrega en una sola orden con múltiples ítems.
  1. En [assets/js/orders.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/orders.js): implementadas las funciones puras `normalizarClaveCliente(nombre)` y `consolidarPedidosPorClienteYFecha(pedidos)` en `OrdersModule`.
  2. En [assets/js/storage.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/storage.js): método `consolidateCurrentOrders()` y actualización de `RECOVERED_ORDERS` con los 11 pedidos consolidados.
  3. Archivos de respaldo sincronizados: `recuperado_pedidos.json`, `momentos-cookie-backup-recuperado.json` y `C:\Users\Andres\Downloads\momentos-cookie-recuperado.json`.
  4. En [assets/js/main.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/main.js) e [index.html](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/index.html): consolidación automática en inicialización y actualización de textos en botones de recuperación.
  5. En [assets/js/ui.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/ui.js): corrección de referencia `ord` en `openDetailModal`.
- Verificación de consistencia: 17 pedidos originales consolidados en exactamente 11 pedidos únicos (200 galletas totales a hornear, \$208.680 total y \$68.380 abonados, con balance financiero 100% idéntico).
- Suite de pruebas unitarias ampliada a **49/49 pruebas pasando en verde con `node --test`** (incluyendo suite `tests/consolidate_orders.test.js`).
- Verificación interactiva exitosa en Chrome mediante DevTools MCP.
- Especificación [specs/006-consolidacion-pedidos/spec.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/006-consolidacion-pedidos/spec.md) marcada como `implementada`.

### 2026-10-29 — Implementación de Spec 005: Pedidos Multi-Ítem (Mezcla de Individuales y Combos)
- **T1 a T6 completadas:** Implementado soporte completo para pedidos con múltiples artículos individuales y combos en una misma orden.
  1. En [assets/js/orders.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/orders.js): creadas las funciones puras `normalizeOrder`, `calcularTotalesPedido` y `formatearResumenItems`, asegurando 100% de compatibilidad con pedidos legados y cálculo reactivo de gran total y galletas a hornear.
  2. En [assets/js/production.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/production.js): consolidación de horneado en cocina que recorre todos los ítems de todos los pedidos activos, agrupando adecuadamente por sabor, combos, empaques y kits de pintura.
  3. En [assets/js/receipt.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/receipt.js): comprobante térmico/remito de taller desglosa cada ítem con su subtotal y gran total a pagar.
  4. En [index.html](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/index.html) y [assets/js/ui.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/ui.js): formulario dinámico con contenedor `#order-items-list`, botón `[＋ Agregar otro ítem]` con duplicación de tipo del ítem anterior, selector individual/combo por ítem, eliminación controlada y tarjetas de planificación con resumen de ítems.
  5. En [assets/js/main.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/main.js): cableado de eventos de ítems, guardado y edición reactiva.
- Suite de pruebas unitarias ampliada a **45/45 pruebas pasando al 100% en verde con `node --test`** (suite `tests/multi_item.test.js`).
- Verificación interactiva exitosa en Chrome mediante DevTools MCP (creación de pedido multi-ítem, tarjetas en vista de planificación, modal de detalle y ticket térmico).
- Especificación [specs/005-pedidos-multi-item/spec.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/005-pedidos-multi-item/spec.md) marcada como `implementada`.


### 2026-10-29 — Reescritura integral de la skill SDD (.agents/skills/sdd/SKILL.md)
- **Diagnóstico y objetivo:** La skill previa carecía del frontmatter YAML estandarizado, omitía la arquitectura de subagentes y la relación con los comandos slash (`/sdd-*`), y no proveía las plantillas exhaustivas ni la guía formal de sintaxis EARS con ejemplos y antipatrones.
- **Acción ejecutada:**
  1. Incorporado el encabezado YAML con `name: sdd` y descripción canónica.
  2. Documentados los principios innegociables ("La spec manda", separación QUÉ vs CÓMO, compuertas de fase con aprobación del usuario, TDD Red-Green estricto con parada obligatoria).
  3. Detallado el ciclo completo de 8 fases (Constitución → Spec → Clarificación → Plan → Tareas → Implementación → Validación → Gestión de Cambios).
  4. Redactada la tabla de sintaxis EARS formal (Evento, Estado No Deseado, Basado en Estado, Comportamiento Continuo y Opcional) con ejemplos prácticos y antipatrones prohibidos.
  5. Documentada la arquitectura multi-agente (`coordinator`, `planner`, `implementer`, `reviewer`, `auditor`) y la tabla de comandos slash del flujo SDD.
  6. Provistas las plantillas oficiales para `spec.md`, `plan.md`, `tasks.md` y el protocolo de actualización de `memory.md`.
- Verificada la integridad de la suite completa: 37/37 tests unitarios pasando en verde con `node --test`.


### 2026-10-29 — Recuperación forense de 17 pedidos reales desde el registro de Chrome
- **Diagnóstico:** Los pedidos reales ingresados por el usuario en la sesión previa (Sandra Vergara, Isabel Aranda, Constanza Blest, Alejandra Olea, etc.) no se habían respaldado en archivo externo antes de implementar el modal.
- **Acción ejecutada:**
  1. Extracción forense completa desde los registros LevelDB de Chrome (`007293.log`), recuperando íntegramente los **17 pedidos reales** con sus clientes, teléfonos, fechas de entrega comprometidas, sabores, combos y pagos.
  2. Generación del archivo de respaldo [momentos-cookie-backup-recuperado.json](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/momentos-cookie-backup-recuperado.json) y copia directa en la carpeta de descargas del usuario (`C:\Users\Andres\Downloads\momentos-cookie-recuperado.json`).
  3. Incorporación del dataset `RECOVERED_ORDERS` y método `restorePreviousData()` en [assets/js/storage.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/storage.js).
  4. Auto-recuperación al iniciar: si la app detecta únicamente los pedidos base de muestra, activa los 17 pedidos reales automáticamente.
  5. Botón de acceso directo *"Recuperar mis 17 pedidos grabados"* añadido tanto en la vista de pedidos como en el modal de recuperación.
- 37/37 pruebas unitarias pasando en verde con `node --test`.

### 2026-10-29 — Implementación de Spec 004: Respaldo y Recuperación en Menú Principal
- **T1 a T4 completadas:** Agregados los botones táctiles `#btn-header-backup` ("Respaldar") y `#btn-header-restore` ("Recuperar") directamente en el `<header>` principal de la aplicación.
- Implementado el diálogo nativo `<dialog id="modal-restore">` para restaurar copias de seguridad desde archivos `.json` locales con:
  - Selector de archivo con arrastrar/soltar visual.
  - Validación de integridad y previsualización de pedidos y fecha antes de aplicar.
  - Selector de modo de restauración: *"Fusionar sin duplicar (Recomendado)"* vs *"Reemplazar toda la base de datos"*.
  - Sincronización automática de pedidos y ajustes (`settings`).
- Suite de pruebas unitarias ampliada a **37/37 pruebas pasando en verde con `node --test`** (incluyendo suite `tests/backup_restore.test.js`).
- Verificación interactiva exitosa en navegador mediante Chrome DevTools.
- Especificación [specs/004-respaldo-recuperacion/spec.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/004-respaldo-recuperacion/spec.md) marcada como `implementada`.

### 2026-10-29 — Publicación del proyecto en GitHub (`AndresAguiarMarmol/momentos-cookie`)
- Creado el repositorio público en GitHub: [https://github.com/AndresAguiarMarmol/momentos-cookie](https://github.com/AndresAguiarMarmol/momentos-cookie).
- Historial de Git saneado e inicializado limpiamente en la rama `main` conteniendo exclusivamente el código fuente, especificaciones SDD, pruebas y assets de Momentos Cookie (eliminados vestigios del proyecto anterior).
- Añadido archivo [.gitignore](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/.gitignore) estándar y sincronización completa (`git push -u origin main`).

### 2026-10-29 — Corrección de conflicto léxico global en navegador y arranque resiliente
- **Diagnóstico:** En entorno de navegador, `storage.js` y `ui.js` declaraban en el ámbito de script global la misma constante léxica `const ProductionHelper`. Esto provocaba un `Uncaught SyntaxError: Identifier 'ProductionHelper' has already been declared`, interrumpiendo la carga de `ui.js` y congelando la inicialización del DOM.
- **Solución implementada:**
  1. Aislado el helper en `storage.js` como `StorageProductionHelper` con resolución dinámica defensiva hacia `window.Production`.
  2. En `main.js`, robustecido el ciclo de inicialización comprobando `document.readyState` para arrancar inmediatamente si el DOM ya está listo (evitando condiciones de carrera si `DOMContentLoaded` ya ocurrió).
  3. Ejecución inicial de `resetForm()` durante `initApp()` para precargar fechas y cálculo del formulario.
- **Validación:** Comprobado en vivo en Chrome headless mediante DevTools MCP (sin errores de sintaxis en consola, navegación entre las 4 vistas operativas y apertura de modales) y 32/32 tests unitarios en verde con `node --test`.

### 2026-10-28 — Cierre integral de todas las especificaciones (Spec 001, Spec 002 y Spec 003)
- Verificación exhaustiva de todos los requisitos funcionales de `momentos cookie.md`:
  1. Registro y edición dinámica (individual vs combos con kits de pintura, empaques y cálculo en tiempo real).
  2. Planificación con semáforo de urgencia de 4 bloques (*Atrasados*, *Hoy*, *Esta semana*, *Próximas semanas*) y transición rápida de estados.
  3. Búsqueda reactiva insensible a tildes/mayúsculas, detalle completo y contacto directo vía WhatsApp.
  4. Planilla consolidada de producción/horneado con checklist interactivo y balance de finanzas del taller.
  5. Copia de seguridad en JSON e importación con fusión sin duplicados, más exportación a CSV para Excel (BOM UTF-8).
  6. Comprobante de entrega térmico/remito (`@media print`) y configuración personalizada de marca.
  7. Progressive Web App (PWA) offline-first con `manifest.json` y `sw.js`.
- Ajuste ergonómico en navegación: al presionar la pestaña "Nuevo Pedido", el formulario se reinicia automáticamente si se encontraba en modo edición.
- 32/32 pruebas unitarias pasando al 100% en verde con `node --test` y cero errores de compilación/sintaxis.

### 2026-10-28 — Implementación completa de Spec 003: Comprobante de Entrega Imprimible y Configuración del Taller
- **T1 a T4 completadas:** Implementado [assets/js/receipt.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/receipt.js) y suite [tests/receipt.test.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/tests/receipt.test.js) con generación de comprobante físico / remito de taller en formato térmico optimizado para 80mm e impresión A4 (`@media print`).
- Añadidos a `index.html` los diálogos nativos `<dialog id="modal-receipt">` y `<dialog id="modal-settings">`, botón de acceso a configuración en cabecera y botón de comprobante en tarjetas y modal de detalle.
- Integrada la lógica de persistencia y actualización reactiva de marca (`updateBusinessBranding`, `openReceiptModal`, `openSettingsModal`) en [assets/js/ui.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/ui.js) y [assets/js/main.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/main.js).
- 32/32 tests unitarios pasando al 100% en verde con `node --test` y sintaxis JS sin errores.
- Especificación [specs/003-ticket-configuracion/spec.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/003-ticket-configuracion/spec.md) marcada como `implementada`.

### 2026-10-28 — Implementación completa de Spec 002: Planilla de Producción, Métricas y Backup
- **T1 a T5 completadas:** Implementado [assets/js/production.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/production.js) con consolidación de galletas a hornear por sabor, cálculo de métricas financieras (facturado, cobrado, saldo por cobrar), exportación CSV compatible con Excel (BOM UTF-8) y validación/fusión de backups.
- Implementadas en [assets/js/ui.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/ui.js) y [assets/js/main.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/main.js) la vista `#view-production` con selector de período (*Hoy*, *Esta semana*, *Todos los activos*), checklist táctil para tachar lotes horneados, disparadores de descarga y carga de archivos JSON/CSV e impresión de hoja de cocina.
- 29/29 tests unitarios pasando al 100% en verde con `node --test` y sintaxis JS 100% verificada.
- Especificación [specs/002-produccion-backup/spec.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/002-produccion-backup/spec.md) marcada como `implementada`.

### 2026-10-28 — Redacción de Spec 002 (borrador): Planilla de Producción, Métricas y Backup
- Creada la especificación [specs/002-produccion-backup/spec.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/002-produccion-backup/spec.md) en estado `borrador`.
- Definidos 10 Requisitos Funcionales en sintaxis EARS para:
  1. Planilla consolidada de horneado (total de galletas por sabor/combo, empaques y kits de pintura).
  2. Métricas y balance financiero (facturado, cobrado y saldo pendiente).
  3. Exportación a JSON y CSV (compatible con Excel/Google Sheets) e importación segura de respaldos.
- Limpieza preventiva de archivos obsoletos del proyecto anterior en `assets/js/` y `tests/` para dejar una suite limpia de 23 tests de Momentos Cookie.

### 2026-10-28 — PWA Offline-First y Documentación Integral (README.md)
- Añadido manifiesto de aplicación [manifest.json](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/manifest.json) y Service Worker [sw.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/sw.js) para soporte offline e instalación en dispositivos móviles/tablets de cocina como Progressive Web App (PWA).
- Redactada la documentación completa del repositorio en [README.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/README.md) cubriendo características, instrucciones de ejecución local (`file://`, `npx serve`, `python`), arquitectura de archivos y cobertura de pruebas automatizadas.
- 37/37 tests unitarios pasando en verde con `node --test`.

### 2026-10-28 — Implementación completa de Spec 001: Sistema de Gestión y Control de Pedidos
- **T6 completada:** Implementada la vista general de todos los pedidos (`renderAllOrdersView`) con búsqueda reactiva sin distinción de tildes/mayúsculas por cliente, teléfono o código; chips de filtrado por estado; modal nativo de detalle completo (`modal-detail`) con botón de apertura a WhatsApp (`wa.me`) y confirmación de borrado en `<dialog>`.
- **T7 completada:** Validación integral del sistema ejecutando la suite completa de 37 tests unitarios en verde (`node --test`), verificación de sintaxis JS (`node -c`) y ergonomía táctil responsive móvil/escritorio.
- Actualizada la especificación [specs/001-gestion-pedidos/spec.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/001-gestion-pedidos/spec.md) a estado `implementada` y las 7 tareas cerradas al 100% en [specs/001-gestion-pedidos/tasks.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/001-gestion-pedidos/tasks.md).

### 2026-10-28 — T5 Completada: Panel de planificación cronológica y semáforo de urgencia
- Implementada en [assets/js/ui.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/ui.js) la función `renderPlanningView` y `renderOrderCardHtml` para la distribución cronológica y visual en los 4 bloques temporales: *Atrasados* (rojo), *Hoy / <24h* (naranja), *Esta semana* (azul) y *Próximas* (verde).
- Implementada en [assets/js/main.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/main.js) la delegación de eventos para transición rápida de estados (`quick-status`), edición y diálogo nativo de confirmación de eliminación.
- Creada suite [tests/planning_render.test.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/tests/planning_render.test.js) con 35/35 pruebas totales pasando al 100% en verde con `node --test`.
- Marcada T5 como completada en [specs/001-gestion-pedidos/tasks.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/001-gestion-pedidos/tasks.md).

### 2026-10-28 — T4 Completada: Formulario interactivo y cálculo en tiempo real
- Implementado en [assets/js/ui.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/ui.js) el manejo del formulario de pedidos: validación de obligatoriedad, extracción tipada según modalidad (individual/combo), control segmentado interactivo, visualización condicional de abonos y actualización reactiva de la tarjeta de resumen financiero.
- Implementado en [assets/js/main.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/main.js) el ciclo de vida de guardado, actualización de pedidos en `storage.js`, notificación toast y navegación fluida entre vistas.
- Verificado con suite de pruebas unitarias [tests/form_logic.test.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/tests/form_logic.test.js) (33/33 tests totales en verde).
- Marcada T4 como completada en [specs/001-gestion-pedidos/tasks.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/001-gestion-pedidos/tasks.md).

### 2026-10-28 — T3 Completada: Estructura semántica, paleta de taller y navegación SPA
- Reestructurado [index.html](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/index.html) con la interfaz completa de **Momentos Cookie**: barra de navegación por 3 vistas (`#view-planning`, `#view-orders`, `#view-form`), formulario accesible con selector dinámico, modales nativos `<dialog>` (`modal-delete`, `modal-detail`) y contenedor de alertas toast.
- Actualizado [assets/css/custom.css](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/css/custom.css) con la paleta de taller artesanal, ergonomía táctil (áreas >= 44px), clases para semáforos de urgencia y soporte de impresión.
- Verificado con suite de pruebas [tests/dom_structure.test.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/tests/dom_structure.test.js) (30/30 tests totales pasando en verde).
- Marcada T3 como completada en [specs/001-gestion-pedidos/tasks.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/001-gestion-pedidos/tasks.md).

### 2026-10-28 — T2 Completada: Capa de persistencia local resiliente (storage.js)
- Creado [assets/js/storage.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/storage.js) con adaptador `createStorageService`, gestión segura de `localStorage`, tolerancia a JSON corrupto, fallback en memoria y precarga automática de `INITIAL_SEED_ORDERS`.
- Creada suite de pruebas [tests/storage.test.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/tests/storage.test.js) con 6/6 tests pasando en `node --test` (28/28 tests en toda la suite).
- Marcada T2 como completada en [specs/001-gestion-pedidos/tasks.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/001-gestion-pedidos/tasks.md).

### 2026-10-28 — T1 Completada: Lógica de negocio pura y tests unitarios
- Creado [assets/js/orders.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/assets/js/orders.js) con funciones puras para cálculos de subtotales, gestión de abonos, semáforo de urgencia determinista, orden cronológico, búsqueda con insensibilidad a tildes y constructor de links de WhatsApp.
- Implementada la suite de pruebas unitarias en [tests/orders.test.js](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/tests/orders.test.js) con 8/8 pruebas pasando en verde con el runner nativo `node --test`.
- Tarea T1 marcada como completada en [specs/001-gestion-pedidos/tasks.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/001-gestion-pedidos/tasks.md).

### 2026-10-28 — Aprobación de Spec 001, Plan y Tareas según SDD
- Aprobada la especificación [specs/001-gestion-pedidos/spec.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/001-gestion-pedidos/spec.md) tras la confirmación explícita del usuario.
- Creado el plan técnico [specs/001-gestion-pedidos/plan.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/001-gestion-pedidos/plan.md) definiendo módulos, funciones puras (con inyección de `hoy`), algoritmos de semáforo/cálculo, interfaz y estrategia de pruebas unitarias.
- Desglosado el plan en 7 tareas ejecutables y secuenciales en [specs/001-gestion-pedidos/tasks.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/001-gestion-pedidos/tasks.md).

### 2026-10-28 — Redacción de Spec 001 (borrador) según metodología SDD
- Creada la especificación [specs/001-gestion-pedidos/spec.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/specs/001-gestion-pedidos/spec.md) en estado `borrador`.
- Se estructuraron 18 Requisitos Funcionales en sintaxis EARS, 4 Requisitos No Funcionales, 5 Casos Límite y Criterios de Finalización basados en `momentos cookie.md`.
- Identificadas 3 dudas abiertas clave para clarificación antes de avanzar a `plan.md` y `tasks.md`.

### 2026-10-28 — Inicialización del proyecto Momentos Cookie (init)
- Establecida la constitución del proyecto en [docs/constitution.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/docs/constitution.md) con los 6 principios innegociables.
- Actualizada la guía de agentes en [AGENTS.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/AGENTS.md) con el stack, módulos, flujos y criterios de prueba para la app de pedidos.
- Configurada la memoria inicial en [memory.md](file:///d:/Carpetas/Desarrollos/Desarrollos%20WEB/Momentos%20Cookie/memory.md) con el modelo de datos `Order`, estados permitidos, persistencia en `localStorage` y decisiones arquitectónicas.
