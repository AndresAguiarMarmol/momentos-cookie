# Spec 010 — Ajuste de Títulos Responsivos para iPhone y PC

Estado: implementada

## 1. Contexto y Objetivo
En pantallas de teléfonos móviles como el iPhone (anchos de 375px a 430px), varios títulos y encabezados de la aplicación eran excesivamente largos, provocando saltos de línea forzados, desalineación con las insignias (badges) de conteo de pedidos o desplazamiento horizontal innecesario en la barra de navegación. Esta especificación define una adaptación tipográfica responsiva bidireccional: títulos concisos y de lectura rápida en iPhone/móvil (`sm:hidden`), y títulos expandidos descriptivos en pantallas de PC y tablets (`hidden sm:inline`), sin modificar ninguna lógica de negocio ni persistencia.

## 2. Usuarios y Roles
- **Repostera / Usuaria en iPhone:** Visualiza títulos limpios, compactos y perfectamente encajados en la pantalla de su teléfono sin desbordamientos ni texto partido.
- **Usuaria en PC / Pantalla Grande:** Mantiene los títulos completos y descriptivos tradicionales para máxima claridad en escritorio.

## 3. Historias de Usuario
- **HU-1**: Como usuaria de iPhone, quiero que los botones de la barra de navegación tengan títulos compactos (ej. "Planificación", "Pedidos", "Saldo Pendiente [8]", "Producción", "Nuevo Pedido") para moverme ágilmente sin exceso de scroll horizontal.
- **HU-2**: Como usuaria de iPhone, quiero que los encabezados de los bloques de semáforo de entrega (Atrasados, Hoy, Esta Semana) no se amontonen con las insignias de cantidad de pedidos.
- **HU-3**: Como usuaria en PC, quiero continuar viendo los títulos completos con su contexto amplio en pantallas grandes.

## 4. Definiciones
- **Adaptación Responsiva con Tailwind:** Uso de clases condicionales de punto de ruptura `sm:` (`sm:hidden` para la versión móvil compacta y `hidden sm:inline` o `hidden sm:block` para la versión de PC).
- **Tipografía Fluida:** Tamaños de texto adaptativos (`text-sm sm:text-base` o `text-base sm:text-lg`).

## 5. Requisitos Funcionales (EARS)
- **RF-1**: CUANDO la aplicación se visualiza en un viewport móvil (menor a 640px / iPhone), EL SISTEMA muestra títulos compactos en la barra de navegación superior ("Planificación", "Pedidos", "Saldo Pendiente", "Producción", "Nuevo").
- **RF-2**: CUANDO la aplicación se visualiza en pantallas medianas o grandes (PC / ancho >= 640px), EL SISTEMA muestra los títulos completos en la barra de navegación ("Planificación de Entregas", "Todos los Pedidos", "Saldo Pendiente", "Producción & Métricas", "Nuevo Pedido").
- **RF-3**: CUANDO se renderizan los bloques del semáforo cronológico de entregas, EL SISTEMA adapta los títulos de cada grupo para que en iPhone no compitan con las insignias de conteo (`Atrasados / Urgentes`, `Entregas de Hoy`, `Esta Semana`, `Próximas Semanas`), manteniendo las etiquetas extendidas en PC.
- **RF-4**: CUANDO se abren las secciones de Producción y el formulario de Nuevo Pedido, EL SISTEMA adapta los encabezados de sección y pasos numéricos con variantes compactas en móvil y extendidas en PC.
- **RF-5**: CUANDO se abren los modales (Ajustes, Recuperar copia, Detalle de pedido), EL SISTEMA ajusta el tamaño del título (`text-base sm:text-lg`) y compacta su longitud para evitar desbordes en pantallas de 375px.
- **RF-6**: EL SISTEMA mantiene estrictamente inalterada la lógica de cálculo, base de datos local, consolidación, filtros y flujo operativo.

## 6. Requisitos No Funcionales
- **RNF-1**: Cero regresión funcional: todos los selectores de eventos, IDs y atributos `data-*` se conservan exactamente iguales.
- **RNF-2**: Cumplimiento WCAG y contraste: contraste mínimo 4.5:1 en todos los encabezados y tamaños legibles (mínimo 14px en móvil).

## 7. Criterios de Finalización (DoD)
- [x] Títulos de la barra de navegación adaptados con variantes móvil/PC en `index.html`.
- [x] Encabezados de semáforo (Atrasados, Hoy, Esta Semana) adaptados en `index.html`.
- [x] Encabezados de formulario y producción adaptados en `index.html`.
- [x] Encabezados de modales con tipografía responsiva en `index.html`.
- [x] Pruebas unitarias en `tests/responsive_titles.test.js` verificando la presencia de las variantes responsivas.
- [x] 100% de la suite de pruebas pasando en verde con `node --test`.

