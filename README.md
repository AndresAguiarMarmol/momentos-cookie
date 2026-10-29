# Momentos Cookie — Gestión y Control de Pedidos de Taller

Aplicación web moderna, ligera y responsiva (SPA / PWA) diseñada para el control integral de pedidos, planificación cronológica de entregas y cálculo financiero de un emprendimiento de galletas artesanales y personalizadas (**Momentos Cookie**).

---

## 🍪 Características Principales

1. **Registro y Edición Rápida de Pedidos:**
   - Selector dinámico de modalidad entre **Galletas Individuales** y **Combos / Kits Especiales**.
   - Despliegue condicional de campos de combo: tipo de empaque (cajas con lazo, latas de lujo, bolsas decorativas), selector para kit de pintura comestible con pinceles y cantidad de galletas incluidas.
   - Cálculo automático de subtotales, abonos/señas y saldos pendientes por cobrar en tiempo real.

2. **Panel de Planificación de Entregas (Semáforo de Taller):**
   - Agrupación y orden cronológico ascendente por fecha y hora comprometida (lo más próximo arriba).
   - Bloques con código de colores de alta visibilidad para cocina/taller:
     - 🚨 **Atrasados / Urgentes:** Órdenes vencidas que requieren atención inmediata (Rojo).
     - ⏰ **Hoy (< 24 horas):** Entregas del día en curso (Ámbar/Naranja).
     - 📅 **Esta Semana:** Planificación a corto plazo dentro de los próximos 7 días (Azul).
     - 📦 **Próximas Semanas:** Cola futura de producción (Verde).
   - Botones táctiles de acción rápida para avanzar el estado del pedido en un toque (`Iniciar Producción` → `Marcar Listo` → `Marcar Entregado`).

3. **Listado General, Búsqueda y Filtros:**
   - Buscador reactivo insensible a mayúsculas y acentos por nombre del cliente, teléfono o código de pedido.
   - Filtros inmediatos por estado (`Todos`, `Pendiente`, `En producción`, `Listo para entrega`, `Entregado`, `Cancelado`).
   - Modal nativo (`<dialog>`) con detalle completo del pedido y botón para abrir conversación de WhatsApp (`wa.me`) con mensaje prellenado de cortesía.
   - Confirmación segura antes de eliminar cualquier orden.

4. **Persistencia Local Resiliente (Offline-First):**
   - Almacenamiento modular en el navegador (`localStorage`) con tolerancia a modo incógnito y fallback en memoria.
   - Precarga automática de datos iniciales de demostración con fechas dinámicas relativas.
   - Botón directo para restaurar el set de datos de prueba en cualquier momento.
   - PWA instalable (`manifest.json` y `sw.js`) con soporte de caché sin conexión.

---

## 🚀 Cómo Ejecutar la Aplicación

No requiere herramientas de compilación, transpiladores (`npm build`, `vite`, `webpack`) ni configuración de backend.

### Opción 1: Directamente en el navegador
Haz doble clic sobre el archivo `index.html` o arrástralo a tu navegador (Chrome, Edge, Firefox, Safari).

### Opción 2: Con servidor estático local (Recomendado para PWA)
Desde la terminal en esta carpeta:

- **Con Node.js (npx):**
  ```powershell
  npx serve .
  ```
- **Con Python:**
  ```powershell
  python -m http.server 8000
  ```
Luego ingresa a `http://localhost:8000` en tu navegador móvil o de escritorio.

---

## 🧪 Pruebas Automatizadas

El proyecto cuenta con una suite completa de pruebas unitarias puras ejecutadas con el runner nativo de Node.js (`node --test`), sin dependencias pesadas:

```powershell
# Ejecutar todas las pruebas unitarias
node --test tests/*.test.js

# Validar sintaxis de todos los módulos JavaScript
node -c assets/js/*.js
```

### Cobertura de Pruebas:
- `tests/orders.test.js`: Cálculos monetarios, saldos de abono, semáforo determinista con inyección de fecha `hoy`, orden cronológico, búsqueda insensible a tildes y enlaces a WhatsApp.
- `tests/storage.test.js`: Operaciones CRUD, fallback en memoria, tolerancia a JSON corrupto e inicialización de seed data.
- `tests/dom_structure.test.js`: Estructura semántica de `index.html`, ergonomía táctil ( $\ge 44$ px) y clases de semáforo en `custom.css`.
- `tests/form_logic.test.js`: Validación de obligatoriedad, extracción tipada según modalidad y cálculos de abonos.
- `tests/planning_render.test.js`: Renderizado de tarjetas de pedido y distintivos visuales del semáforo.
- `tests/search_orders.test.js`: Búsqueda combinada y modal de detalle.

---

## 📁 Arquitectura del Proyecto

```text
├── index.html                   # Vista principal SPA semántica y accesible
├── manifest.json                # Manifiesto PWA para instalación en móviles/tablets
├── sw.js                        # Service Worker para caché offline
├── AGENTS.md                    # Guía operativa y reglas para agentes IA
├── memory.md                    # Memoria viva del proyecto, esquema y decisiones
├── momentos cookie.md           # Requisitos de negocio originales
├── assets/
│   ├── css/
│   │   └── custom.css           # Paleta de taller, ergonomía táctil y semáforo
│   └── js/
│       ├── orders.js            # Lógica de negocio pura (cálculos, semáforo, filtros)
│       ├── storage.js           # Capa de persistencia local y seed data
│       ├── ui.js                # Renderizado del DOM, modales y formularios
│       └── main.js              # Coordinador de eventos y navegación
├── docs/
│   └── constitution.md          # 6 principios innegociables de arquitectura
├── specs/
│   └── 001-gestion-pedidos/     # Especificación formal bajo metodología SDD
│       ├── spec.md              # Requisitos funcionales (EARS) y no funcionales
│       ├── plan.md              # Plan técnico y arquitectura de componentes
│       └── tasks.md             # Desglose de tareas completadas al 100%
└── tests/                       # Suite de pruebas unitarias (node --test)
```

---

## 🛠️ Tecnologías Empleadas

- **HTML5 Semántico:** `<dialog>`, `<form>`, `<section>`, `<header>`, `<nav>`.
- **Tailwind CSS (CDN):** Estilos modernos con paleta artesanal cálida (`cookie`, `cocoa`).
- **CSS3 Personalizado:** Variables CSS para semáforos, transiciones y directivas `@media print`.
- **Vanilla JavaScript Modular:** Código desacoplado compatible simultáneamente con el navegador y Node.js para testing.
- **Lucide Icons:** Iconografía vectorial accesible vía CDN.
