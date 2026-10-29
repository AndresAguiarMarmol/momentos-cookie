# Spec 001 — Sistema de Gestión y Control de Pedidos (Momentos Cookie)

Estado: implementada

## Contexto y objetivo
"Momentos Cookie" es un emprendimiento de repostería artesanal especializado en galletas personalizadas (individuales y combos/kits temáticos con pintura comestible). Actualmente se requiere una solución digital accesible, visualmente clara y autónoma para registrar pedidos, calcular totales, planificar entregas con alertas visuales de urgencia y gestionar el ciclo de vida de cada orden desde el taller o la cocina, sin perder datos entre sesiones.

## Usuarios
- **Artesano / Repostero pastelero:** Gestiona la producción diaria en taller, necesita identificar de inmediato qué pedidos urgen hoy o están próximos a vencer, y actualizar su estado sin fricción táctil.
- **Administrador del emprendimiento:** Registra clientes y pedidos, cotiza subtotales y kits, controla abonos y pagos, y busca órdenes históricas por cliente o teléfono.

## Historias de usuario
- **HU-1:** Como artesano repostero, quiero ver mis pedidos organizados cronológicamente por fecha de entrega con alertas para órdenes urgentes o atrasadas, para no retrasar ninguna entrega comprometida.
- **HU-2:** Como administrador, quiero registrar rápidamente un pedido con selector dinámico entre galleta individual y combo/kit, para que el sistema calcule los totales automáticamente sin errores manuales.
- **HU-3:** Como artesano repostero, quiero cambiar con un solo toque el estado de un pedido a "Listo para entrega" o "Entregado", para mantener el flujo de trabajo actualizado en plena jornada de cocina.
- **HU-4:** Como administrador, quiero buscar pedidos por nombre, teléfono o código identificador, para atender consultas de clientes en segundos.
- **HU-5:** Como artesano y administrador, quiero que todos los pedidos y sus estados se conserven de forma persistente en mi dispositivo, para no perder información al cerrar o recargar el navegador.

## Definiciones
- **Modalidad Individual:** Pedido enfocado en unidades de galletas de un sabor o tipo específico.
- **Modalidad Combo / Kit:** Pedido de presentación especial (cajas, latas o bolsas decorativas) que contiene múltiples galletas y puede incluir opcionalmente un kit de pintura comestible con pinceles.
- **Semáforo de Urgencia:** Categorización temporal automática de pedidos activos según la proximidad de su fecha comprometida:
  - *Atrasado:* Fecha comprometida anterior a la fecha actual y pedido no finalizado.
  - *Hoy / Urgente:* Fecha comprometida igual a hoy o en un plazo menor a 24 horas.
  - *Esta semana:* Fecha comprometida dentro de los próximos 7 días naturales.
  - *Próximas semanas:* Fecha comprometida a más de 7 días naturales.
- **Pedido Activo:** Orden cuyo estado es `Pendiente`, `En producción` o `Listo para entrega` (excluye `Entregado` y `Cancelado`).

## Requisitos funcionales

### Registro y Edición de Pedidos
- **RF-01:** EL SISTEMA asignará automáticamente a cada nuevo pedido un código identificador único y no modificable (ej. `MC-YYYYMMDD-XXX`) y la fecha de registro actual.
- **RF-02:** EL SISTEMA exigirá de forma obligatoria el nombre del cliente, un teléfono de contacto y la fecha comprometida de entrega antes de permitir guardar el pedido.
- **RF-03:** CUANDO el usuario seleccione la modalidad "Galletas Individuales", EL SISTEMA solicitará sabor/tipo de galleta, cantidad de unidades y precio unitario.
- **RF-04:** CUANDO el usuario seleccione la modalidad "Combo / Kit", EL SISTEMA desplegará los campos condicionales: nombre del combo, cantidad de galletas por combo, tipo de empaque, casilla para kit de pintura comestible, cantidad de combos y precio unitario.
- **RF-05:** EL SISTEMA calculará y actualizará en tiempo real el subtotal y el total a pagar al modificar cualquier cantidad, precio o extra.
- **RF-06:** CUANDO el usuario indique estado de pago "Abono/Seña", EL SISTEMA habilitará el campo para registrar el monto abonado y calculará automáticamente el saldo restante por cobrar.
- **RF-07:** CUANDO el usuario guarde un pedido (nuevo o editado), EL SISTEMA persistirá la información inmediatamente en el almacenamiento local y actualizará las vistas sin necesidad de recargar la página.

### Planificación y Semáforo de Entregas
- **RF-08:** EL SISTEMA presentará los pedidos ordenados cronológicamente de forma ascendente por su fecha y hora comprometida de entrega (lo más próximo primero).
- **RF-09:** EL SISTEMA agrupará o filtrará los pedidos activos en cuatro bloques temporales: *Atrasados / Urgentes*, *Hoy*, *Esta semana* y *Próximas semanas*.
- **RF-10:** SI un pedido activo tiene una fecha de entrega anterior a hoy, ENTONCES EL SISTEMA lo destacará visualmente en el bloque de *Atrasados* con distintivo visual de alta prioridad (color rojo).
- **RF-11:** SI un pedido activo tiene fecha de entrega para el día en curso o dentro de las próximas 24 horas, ENTONCES EL SISTEMA lo destacará con alerta de urgencia (color ámbar/naranja).
- **RF-12:** CUANDO el usuario pulse el botón de acción rápida "Listo" o "Entregado" en una tarjeta de pedido, EL SISTEMA transicionará su estado y actualizará de inmediato su ubicación en la planificación.
- **RF-13:** MIENTRAS el usuario aplique un filtro de estado (`Pendiente`, `En producción`, `Listo para entrega`, `Entregado`, `Cancelado`), EL SISTEMA mostrará únicamente las órdenes que coincidan con dicho estado.

### Búsqueda y Gestión Global
- **RF-14:** CUANDO el usuario ingrese texto en el buscador general, EL SISTEMA filtrará en tiempo real las coincidencias insensibles a mayúsculas y acentos sobre nombre del cliente, teléfono o código de pedido.
- **RF-15:** CUANDO el usuario solicite editar un pedido existente, EL SISTEMA cargará todos sus datos en el formulario permitiendo modificar campos de contacto, ítems, notas, estados y pagos.
- **RF-16:** CUANDO el usuario solicite eliminar un pedido, EL SISTEMA solicitará confirmación explícita antes de purgar el registro del almacenamiento local.
- **RF-19:** CUANDO el usuario pulse el botón de contacto por WhatsApp en la tarjeta o detalle de un pedido, EL SISTEMA abrirá un enlace web (`https://wa.me/...`) con el número normalizado del cliente y un mensaje preformateado con el código del pedido y su estado actual.

### Persistencia y Resiliencia
- **RF-17:** EL SISTEMA cargará automáticamente todos los pedidos almacenados al iniciar la aplicación.
- **RF-18:** SI no existen pedidos previos en el almacenamiento local al inicio, ENTONCES EL SISTEMA ofrecerá o precargará pedidos de ejemplo (seed data) para verificar el funcionamiento de las vistas y semáforos.

## Requisitos no funcionales
- **RNF-01 (Autonomía de ejecución):** La solución no debe requerir herramientas de compilación, transpiladores ni configuración de servidor backend; debe funcionar al abrir directamente en el navegador.
- **RNF-02 (Ergonomía de taller y Mobile-First):** Botones e interactivos con un área táctil mínima de 44x44 px, fuentes legibles a distancia de mesada de trabajo y contraste visual accesible según pautas WCAG AA.
- **RNF-03 (Rendimiento local):** La carga inicial, filtrado en tiempo real y transiciones de estado deben ejecutarse en menos de 100 ms sobre un conjunto de hasta 500 pedidos en almacenamiento del navegador.
- **RNF-04 (Compatibilidad semántica):** Uso de diálogos modales nativos (`<dialog>`), formularios accesibles con validación nativa HTML5 y atributos ARIA.

## Casos límite
- **CL-01:** Pedido con fecha de entrega hoy pero hora ya transcurrida: debe catalogarse de inmediato como urgente/atrasado.
- **CL-02:** Pedido con estado `Entregado` o `Cancelado` cuya fecha sea pasada: no debe aparecer en la sección de alertas de atrasados, ya que el ciclo operativo está cerrado.
- **CL-03:** Entrada de caracteres especiales, tildes o prefijos telefónicos internacionales en el buscador: la coincidencia debe normalizarse (ej. `+56 9` o `Maria` debe encontrar `María`).
- **CL-04:** Monto de abono ingresado superior al total calculado: el sistema debe advertir la inconsistencia e impedir un saldo pendiente negativo.
- **CL-05:** Cierre inesperado del navegador o recarga accidental en medio de la consulta de pedidos: el estado de almacenamiento debe permanecer intacto.

## Fuera de alcance
- Pasarela de pagos online con tarjeta bancaria (los cobros son gestionados externamente mediante efectivo/transferencia y registrados manualmente).
- Envío automatizado de mensajes vía API oficial de WhatsApp Business (se proveerá enlace directo `https://wa.me/...` para apertura manual opcional).
- Autenticación multiusuario con contraseñas o roles en la nube en esta primera especificación.

## Criterios de finalización
- Formulario operativo con cálculo automático y campos condicionales según modalidad.
- Panel de entregas cronológico con división de bloques temporales (*Atrasados*, *Hoy*, *Esta semana*, *Próximas*) y botones de acción rápida de cambio de estado.
- Buscador reactivo por cliente, teléfono o código con confirmación de eliminación.
- Persistencia completa en `localStorage` con tolerancia a recargas y datos de muestra iniciales.

## Dudas resueltas (Acuerdos de Aprobación)
- **1. Estructura del pedido:** Cada pedido se registra con una modalidad principal seleccionada (*Galletas Individuales* o *Combo / Kit*) con sus respectivas cantidades, especificaciones de empaque y kit de pintura, asegurando un flujo de captura veloz y ergonómico.
- **2. Acción rápida de WhatsApp:** Aprobado botón de contacto directo mediante enlace web normalizado `https://wa.me/...` con mensaje de cortesía prellenado.
- **3. Moneda:** Símbolo monetario estándar (`$`) con formateo numérico con separadores de miles y sin decimales superfluos.

