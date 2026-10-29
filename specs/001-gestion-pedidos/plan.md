# Plan Técnico — Spec 001: Sistema de Gestión y Control de Pedidos

## 1. Archivos y responsabilidades

| Archivo | Responsabilidad principal | Requisitos cubiertos |
| :--- | :--- | :--- |
| `index.html` | Estructura semántica SPA, vistas (`#view-planning`, `#view-orders`, `#view-form`), diálogos nativos `<dialog>` para detalle y confirmación de borrado, controles accesibles. | RF-02, RF-03, RF-04, RF-13, RF-16, RNF-01, RNF-02, RNF-04 |
| `assets/css/custom.css` | Paleta cálida artesanal ("Momentos Cookie"), estilos ergonómicos de taller (áreas táctiles >= 44px), badges de semáforo de alta visibilidad, transiciones de campos condicionales. | RNF-02, RF-10, RF-11 |
| `assets/js/orders.js` | Funciones puras de lógica de negocio: cálculos monetarios, algoritmo de semáforo con parámetro `hoy`, ordenamiento cronológico, búsqueda insensible a tildes, generación de enlace de WhatsApp. | RF-01, RF-05, RF-06, RF-08, RF-09, RF-10, RF-11, RF-14, RF-19 |
| `assets/js/storage.js` | Capa aislada de persistencia con `localStorage`, parseo defensivo, fallback seguro en memoria, precarga de datos de muestra (seed data). | RF-07, RF-17, RF-18, CL-05 |
| `assets/js/ui.js` | Renderizado reactivo del DOM: tarjetas de pedidos con botones de acción rápida, bloques de entrega, formulario dinámico, resúmenes monetarios y modales nativos. | RF-03, RF-04, RF-09, RF-12, RF-13, RF-15, RF-16 |
| `assets/js/main.js` | Coordinador de inicialización, navegación entre vistas de la SPA, listeners de eventos globales y conexión entre UI, Storage y Orders. | RF-07, RF-12, RF-17, RNF-03 |
| `tests/orders.test.js` | Suite de pruebas unitarias nativas con `node --test` para validar cálculos, semáforo, ordenamiento y búsqueda pura. | RF-01, RF-05, RF-06, RF-08, RF-09, RF-10, RF-11, RF-14, RF-19, CL-01 a CL-04 |

---

## 2. Funciones puras (con "hoy" como parámetro)

Todas las funciones de lógica en `assets/js/orders.js` son puras, sin acceso a `window`, `document` ni estado global mutable:

```javascript
// Cálculo de subtotales
function calcularSubtotal(cantidad, precioUnitario)

// Cálculo de saldos y abonos
function calcularSaldoPendiente(total, montoAbono, estadoPago)

// Clasificación temporal del semáforo (determinista vía parámetro 'hoy')
function clasificarPedidoPorUrgencia(fechaEntrega, horaEntrega, estadoPedido, hoy)

// Ordenamiento cronológico de pedidos (más próximo arriba)
function ordenarPedidosPorFecha(pedidos)

// Agrupación en bloques de semáforo
function agruparPedidosPorSemaforo(pedidos, hoy)

// Búsqueda y filtrado compuesto
function filtrarPedidos(pedidos, { textoBusqueda = '', estadoFiltro = 'todos' })

// Generador de ID legible y unívoco
function generarIdPedido(secuencial, fecha = new Date())

// Constructor de enlace directo de WhatsApp con mensaje cordial
function construirEnlaceWhatsApp(telefono, cliente, codigoPedido, estadoPedido)

// Formateador numérico de moneda sin dependencias
function formatearMoneda(monto, simbolo = '$')
```

---

## 3. Algoritmos en pseudocódigo

### A. Algoritmo del Semáforo de Urgencia
```text
ALGORITMO clasificarPedidoPorUrgencia(fechaEntrega, horaEntrega, estadoPedido, hoy):
    SI estadoPedido == "Entregado" O estadoPedido == "Cancelado":
        RETORNAR "finalizado"
    
    fechaHoraLimite = ParsearFechaYHora(fechaEntrega, horaEntrega || "23:59:59")
    diferenciaMs = fechaHoraLimite - hoy
    
    SI diferenciaMs < 0:
        RETORNAR "atrasado"       // Badge Rojo: Requiere resolución urgente
    SINO SI diferenciaMs <= 24 * 60 * 60 * 1000:
        RETORNAR "urgente_hoy"    // Badge Ámbar/Naranja: Entrega en curso o próximas 24h
    SINO SI diferenciaMs <= 7 * 24 * 60 * 60 * 1000:
        RETORNAR "esta_semana"    // Badge Azul/Amarillo: Planificación semanal
    SINO:
        RETORNAR "proximas"       // Badge Gris/Verde: En cola futura
FIN ALGORITMO
```

### B. Algoritmo de Cálculo Financiero
```text
ALGORITMO calcularSaldoPendiente(total, montoAbono, estadoPago):
    totalLimpio = MAX(0, Redondear(total))
    SI estadoPago == "Pagado total":
        RETORNAR { total: totalLimpio, abono: totalLimpio, saldo: 0 }
    SINO SI estadoPago == "Abono/Seña":
        abonoLimpio = MIN(totalLimpio, MAX(0, Redondear(montoAbono)))
        saldo = totalLimpio - abonoLimpio
        RETORNAR { total: totalLimpio, abono: abonoLimpio, saldo: saldo }
    SINO: // "Pendiente"
        RETORNAR { total: totalLimpio, abono: 0, saldo: totalLimpio }
FIN ALGORITMO
```

---

## 4. Interfaz y Experiencia de Usuario (UI/UX de Taller)

- **Arquitectura de Vistas (Tabs SPA):**
  1. **Vista Planificación (`#view-planning`):** Cuatro acordeones/bloques temporales destacados:
     - 🚨 *Atrasados / Requieren atención*
     - ⏰ *Entregas de Hoy (< 24h)*
     - 📅 *Esta semana*
     - 📦 *Próximas semanas*
     Cada tarjeta incluye: código, cliente, teléfono con botón de WhatsApp, tipo de producto, badge de estado, fecha con hora, y botón rápido `[ Listo ]` o `[ Entregar ]`.
  2. **Vista General y Búsqueda (`#view-orders`):**
     - Barra de búsqueda reactiva con normalización de tildes.
     - Selector de filtros por estado (`Todos`, `Pendiente`, `En producción`, `Listo`, `Entregado`, `Cancelado`).
     - Lista compacta y completa con opciones de edición (`[ ✏️ Editar ]`) y eliminación (`[ 🗑️ Borrar ]`).
  3. **Vista de Registro / Edición (`#view-form`):**
     - Selector Segmentado visual: `[ 🍪 Galletas Individuales ]` / `[ 🎁 Combo o Kit ]`.
     - Animación suave de visibilidad en campos de combo (empaque, kit de pintura con pinceles, cantidad de galletas incluidas).
     - Recuadro en vivo con Total, Abono y Saldo restante destacado.
- **Componentes Nativos y Accesibilidad:**
  - `<dialog id="modal-delete">`: Confirmación de borrado accesible con foco retenido.
  - `<dialog id="modal-detail">`: Detalle completo de orden y notas de diseño especiales.

---

## 5. Decisiones justificadas y alternativas descartadas

1. **Vanilla JS Modular con soporte dual (Browser / Node.js test):**
   - *Decisión:* Exportación condicional al final del módulo (`if (typeof module !== 'undefined' && module.exports) { module.exports = ... }`).
   - *Razón:* Permite correr pruebas unitarias puras ultra-rápidas con `node --test` sin necesidad de empaquetadores como Vite o Webpack, preservando la compatibilidad nativa con doble clic en el navegador.
   - *Alternativa descartada:* ES Modules nativos con `<script type="module">` sin fallback; descartada porque `file://` en algunos navegadores bloquea peticiones CORS a módulos locales sin un servidor web.

2. **Cálculo de semáforo con `hoy` inyectado:**
   - *Decisión:* La función recibe explícitamente `hoy = new Date()`.
   - *Razón:* Permite testear con precisión milimétrica pedidos vencidos hace 5 minutos, pedidos de hoy a las 23:59 y pedidos a exactamente 24 horas.
   - *Alternativa descartada:* `new Date()` interno; descartada por ser impredecible en pruebas automatizadas.

3. **Almacenamiento en `localStorage` con interfaz genérica:**
   - *Decisión:* `storage.js` encapsula `getOrders()`, `saveOrder()`, `deleteOrder()`, `updateOrderStatus()`.
   - *Razón:* Si en el futuro el taller migra a Supabase, Firebase o Google Sheets, solo se reemplaza este archivo sin tocar la UI ni la lógica de negocio.

---

## 6. Estrategia de Pruebas (`node --test`)

Crearemos `tests/orders.test.js` con cobertura exhaustiva de:
- Cálculos de subtotales, totales y saldos de abono (RF-05, RF-06, CL-04).
- Clasificación de semáforo: atrasados, hoy, esta semana, próximas semanas y pedidos finalizados (RF-08, RF-09, RF-10, RF-11, CL-01, CL-02).
- Normalización de búsqueda por cliente, teléfono o código (RF-14, CL-03).
- Generación de links de WhatsApp preformateados (RF-19).
- Ordenamiento cronológico ascendente (RF-08).

