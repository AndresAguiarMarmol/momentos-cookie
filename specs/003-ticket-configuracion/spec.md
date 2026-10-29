# Spec 003 — Comprobante de Entrega Imprimible y Configuración del Taller

Estado: implementada

## Contexto y objetivo
Para completar el ciclo operativo de "Momentos Cookie", el taller necesita entregar cada pedido con un comprobante físico o remito (imprimible o en PDF) para grapar a la caja o bolsa decorativa, asegurando que el cliente verifique su pedido, dedicatorias, advertencias de alergias y el saldo final por pagar. Asimismo, se requiere un panel de configuración donde el emprendimiento pueda personalizar su nombre, teléfono de contacto, mensaje de pie de ticket y catálogo de sabores/empaques predeterminados.

## Usuarios
- **Artesano Repostero:** Imprime el ticket de entrega con un solo clic al empacar las galletas, facilitando la entrega y cobro final.
- **Cliente:** Recibe un comprobante claro con sus notas personalizadas y dedicatorias.
- **Administrador:** Configura los datos de contacto y catálogo del emprendimiento sin tocar código.

## Historias de usuario
- **HU-1:** Como repostero, quiero generar e imprimir un ticket limpio de entrega (remito de taller) para un pedido, con el detalle de productos, notas de diseño y saldo pendiente por cobrar.
- **HU-2:** Como repostero, quiero que el comprobante de entrega esté optimizado para papel o formato térmico/recibo (`@media print`), sin barras de navegación ni botones.
- **HU-3:** Como administrador, quiero configurar el nombre de mi taller, número de WhatsApp para el comprobante y mensaje de cortesía final, para que aparezcan en todos los tickets.
- **HU-4:** Como administrador, quiero guardar estos ajustes de forma persistente en mi navegador, para que se mantengan en futuras sesiones.

## Requisitos funcionales

### Comprobante / Ticket de Entrega
- **RF-01:** CUANDO el usuario presione "Imprimir Comprobante" en la ficha o detalle de un pedido, EL SISTEMA generará una vista modal de ticket formateada (`<dialog id="modal-receipt">`) lista para imprimir.
- **RF-02:** EL SISTEMA incluirá en el ticket:
  - Nombre del taller ("Momentos Cookie" o el configurado).
  - Teléfono / WhatsApp de contacto del negocio.
  - Código único del pedido y fecha/hora de entrega.
  - Nombre y teléfono del cliente.
  - Desglose del producto (galletas individuales o combo, empaque, kit de pintura).
  - Notas de diseño, temática y advertencia de alergias destacadas.
  - Resumen financiero: Total, Abono registrado y Saldo pendiente por cobrar.
  - Mensaje de pie de ticket (ej. "¡Gracias por endulzar tus momentos con nosotros!").
- **RF-03:** EL SISTEMA aplicará estilos de impresión dedicados que aíslen el ticket e impidan la impresión del resto de la interfaz.

### Configuración del Taller (Ajustes)
- **RF-04:** EL SISTEMA proveerá un modal o sección de Ajustes (`<dialog id="modal-settings">`) accesible desde el encabezado.
- **RF-05:** EL SISTEMA permitirá editar y persistir:
  - Nombre del emprendimiento.
  - Teléfono de contacto comercial.
  - Mensaje de cortesía para tickets.
  - Moneda / Símbolo monetario.
- **RF-06:** CUANDO el usuario guarde los ajustes, EL SISTEMA actualizará de inmediato la configuración en `localStorage` (`momentos_cookie_settings`) y reflejará los cambios en la cabecera y comprobantes.

## Requisitos no funcionales
- **RNF-01 (Compatibilidad de impresión):** El ticket debe tener un ancho máximo legible de 380px para impresoras térmicas (80mm) y papel carta/A4 estándar.
- **RNF-02 (Persistencia local):** Los ajustes del taller deben persistir sin backend y tolerar recargas.

## Casos límite
- **CL-01:** Pedido con saldo pendiente cero ($0): el ticket debe mostrar claramente el distintivo "PAGADO AL 100%".
- **CL-02:** Pedido con notas vacías: omitir la sección de notas para no desperdiciar papel.

## Criterios de finalización
- Modal de ticket de entrega con botón directo de impresión.
- Modal de ajustes del taller con persistencia en `localStorage`.
- Suite de pruebas unitarias pasando al 100% en verde.
