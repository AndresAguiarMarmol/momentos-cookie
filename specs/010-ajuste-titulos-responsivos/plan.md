# Plan Técnico — Spec 010 (Ajuste de Títulos Responsivos para iPhone y PC)

## 1. Arquitectura de Cambios Tipográficos en `index.html`

### A. Barra de Navegación (`<nav>`)
- En cada botón de navegación, estructurar el texto con variantes responsivas de Tailwind:
  - `tab-planning`:
    ```html
    <span class="sm:hidden">Planificación</span>
    <span class="hidden sm:inline">Planificación de Entregas</span>
    ```
  - `tab-orders`:
    ```html
    <span class="sm:hidden">Pedidos</span>
    <span class="hidden sm:inline">Todos los Pedidos</span>
    ```
  - `tab-production`:
    ```html
    <span class="sm:hidden">Producción</span>
    <span class="hidden sm:inline">Producción & Métricas</span>
    ```
  - `tab-form`:
    ```html
    <span class="sm:hidden">Nuevo</span>
    <span class="hidden sm:inline">Nuevo Pedido</span>
    ```
  - `btn-nav-pending-balance`:
    ```html
    <span class="sm:hidden">Con Saldo</span>
    <span class="hidden sm:inline">Saldo Pendiente</span>
    ```

### B. Bloques de Semáforo de Entregas (`#view-planning`)
- Encabezado general de planificación:
  ```html
  <span class="sm:hidden">Planificación de Entregas</span>
  <span class="hidden sm:inline">Entregas Organizadas por Urgencia</span>
  ```
- Bloque 1 (Atrasados):
  ```html
  <span class="sm:hidden">Atrasados / Urgentes</span>
  <span class="hidden sm:inline">Atrasados / Requieren Atención Inmediata</span>
  ```
- Bloque 2 (Hoy):
  ```html
  <span class="sm:hidden">Entregas de Hoy</span>
  <span class="hidden sm:inline">Entregas de Hoy (o próximas 24 horas)</span>
  ```
- Bloque 3 (Esta Semana):
  ```html
  <span class="sm:hidden">Esta Semana</span>
  <span class="hidden sm:inline">Esta Semana (Próximos 7 días)</span>
  ```
- Bloque 4 (Próximas):
  `Próximas Semanas` (longitud óptima en ambos).

### C. Producción, Formulario y Modales
- Encabezado de Producción:
  ```html
  <span class="sm:hidden">Horneado & Balance de Taller</span>
  <span class="hidden sm:inline">Planilla de Horneado & Balance de Taller</span>
  ```
- Pasos del Formulario de Pedido:
  `1. Datos de Contacto del Cliente` -> `<span class="sm:hidden">1. Datos del Cliente</span><span class="hidden sm:inline">1. Datos de Contacto del Cliente</span>`
- Modales:
  - Modal Configuración: `<span class="sm:hidden">Configuración</span><span class="hidden sm:inline">Configuración del Emprendimiento</span>`
  - Modal Recuperar: `<span class="sm:hidden">Recuperar Datos</span><span class="hidden sm:inline">Recuperar Copia de Seguridad</span>`

## 2. Estrategia de Pruebas (TDD)
- Crear `tests/responsive_titles.test.js`:
  1. Verificar que los botones de `<nav>` contienen las variantes `sm:hidden` y `hidden sm:inline`.
  2. Verificar que los bloques de semáforo contienen las variantes compactas y extendidas.
  3. Verificar que los encabezados de modales contienen clases responsivas y variantes compactas.
  4. Ejecutar la suite completa para asegurar 0 regresiones funcionales.
