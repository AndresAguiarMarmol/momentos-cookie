# AGENTS.md — Momentos Cookie (Gestión y Control de Pedidos)

Guía para agentes de IA que trabajen en este proyecto.

## Memoria del proyecto (`memory.md`) — OBLIGATORIO
`memory.md` guarda todo lo que debe preservarse entre sesiones: el modelo de datos de pedidos, el estado de persistencia, las decisiones de arquitectura vigentes y el historial de cambios.

1. **Al empezar cualquier tarea:** leer `memory.md` completo antes de tocar código.
2. **Durante la tarea:** respetar la estructura del modelo de datos de pedidos y las decisiones vigentes. Cualquier cambio en el esquema debe garantizar retrocompatibilidad y tolerancia ante datos existentes en el almacenamiento local.
3. **Al terminar cualquier tarea que cambie algo:** actualizar `memory.md`:
   - Sección 1 si cambia el esquema de pedidos o persistencia (`localStorage`/`IndexedDB`).
   - Sección 2 si se toma, cambia o elimina una decisión arquitectónica o de diseño.
   - Sección 3: añadir arriba una entrada con la fecha y un resumen breve del cambio.
4. Si `memory.md` y el código no coinciden, avisar al usuario antes de seguir.

---

## Descripción del proyecto
Aplicación web (Single Page Application / PWA) moderna, ligera y responsiva para la gestión integral y control de pedidos de un negocio de galletas artesanales y personalizadas (**Momentos Cookie**).

La aplicación permite:
- **Registrar y editar pedidos:** Formulario dinámico con soporte para galletas individuales o combos/kits (con empaques especiales y kits de pintura comestible opcionales) y cálculo automático de totales.
- **Planificar entregas (Vista de Planificación):** Agrupación y orden cronológico por fecha comprometida, con semáforo de urgencia (*Hoy*, *Esta semana*, *Próximas semanas*, *Atrasados / Urgentes*) y cambio rápido de estados.
- **Búsqueda y gestión global:** Filtrado instantáneo por cliente, teléfono o código de pedido, con opciones completas de edición y eliminación.
- **Persistencia local resiliente:** Almacenamiento modular en el navegador (`localStorage` / `IndexedDB`), preparado para futuras sincronizaciones con APIs en la nube.

---

## Stack y restricciones técnicas
- **HTML5 semántico:** Estructura limpia y accesible (`<main>`, `<header>`, `<section>`, `<dialog>`).
- **Tailwind CSS vía CDN:** Configurado en el `<head>` de `index.html` con paleta visual adaptada a repostería artesanal moderna, excelente legibilidad y modo oscuro/claro si aplica.
- **CSS personalizado:** `assets/css/custom.css` para estilos de taller (contrastes altos, insignias de semáforo de entrega, animaciones y modales).
- **JavaScript Vanilla Modular (sin bundler ni compilación):**
  - Módulos organizados por responsabilidad (ej: `storage.js`, `orders.js`, `ui.js`, `main.js`).
  - Compatible con ejecución directa vía `file://` o servidor estático ligero (`npx serve`, `python -m http.server`).
- **Iconografía:** Lucide Icons vía CDN (`lucide.createIcons()`).

---

## Estilo de código y buenas prácticas
- **Separación estricta de responsabilidades:**
  - Persistencia y acceso a datos aislado del renderizado del DOM.
  - Lógica de cálculo (subtotales, fechas, alertas de urgencia) en funciones puras testeables.
- **Diseño Mobile-First y Ergonomía de Taller:** Botones táctiles grandes, formularios ágiles con teclado adaptado en móvil (inputs de tipo `tel`, `date`, `number`), y alto contraste para visibilidad en cocina.
- **Componentes Nativos y Accesibilidad:** Modales con `<dialog>`, etiquetas `aria-*` y navegación por teclado.

---

## Cómo probar
1. **Registro de pedido:** Completar un pedido individual y un pedido tipo combo; comprobar cálculos de subtotal y total automático en tiempo real.
2. **Persistencia:** Recargar la página (`F5`) y verificar que los pedidos persistan sin alteraciones ni errores de parseo.
3. **Planificación y semáforo:** Crear pedidos con entrega hoy, en 24h, fecha pasada y semanas futuras. Verificar que se clasifiquen correctamente en los bloques y que las alertas visuales destaquen los urgentes/atrasados.
4. **Búsqueda y filtros:** Filtrar por texto (nombre, teléfono) y por estado (`Pendiente`, `En producción`, `Listo para entrega`, `Entregado`, `Cancelado`).
5. **Transición de estados:** Usar los botones de acción rápida para pasar a "Listo" o "Entregado" y comprobar actualización inmediata en pantalla y almacenamiento.
6. **Vista móvil:** Probar en DevTools con viewport móvil (375x667 o 390x844px).

---

## Formato de respuesta al terminar una tarea
- Resumen de 3-4 líneas de lo creado o cambiado.
- Pasos para probarlo.
- Decisiones tomadas por cuenta propia que el usuario deba revisar.
- Confirmar que `memory.md` se ha actualizado.
