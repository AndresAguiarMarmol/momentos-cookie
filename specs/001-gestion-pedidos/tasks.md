# Tareas — Spec 001: Sistema de Gestión y Control de Pedidos

- [x] **T1. Lógica de negocio pura y suite de pruebas unitarias (`tests/orders.test.js` y `assets/js/orders.js`).** RF-01, RF-05, RF-06, RF-08, RF-09, RF-10, RF-11, RF-14, RF-19
  - Hecho cuando: La suite `tests/orders.test.js` con pruebas exhaustivas para cálculos de subtotales, saldo de abonos, algoritmo del semáforo con fecha inyectada, orden cronológico, búsqueda normalizada y enlaces de WhatsApp se ejecute con `node --test` y pase al 100% en verde.

- [x] **T2. Capa de persistencia local resiliente (`assets/js/storage.js` y `tests/storage.test.js`).** RF-07, RF-17, RF-18
  - Hecho cuando: `assets/js/storage.js` gestione lectura, escritura, actualización, borrado e inyección inicial de datos de muestra (seed data) con tolerancia a entornos sin storage, verificado con tests en `tests/storage.test.js` pasando en verde.

- [x] **T3. Estructura semántica, paleta de taller y navegación SPA (`index.html` y `assets/css/custom.css`).** RF-02, RF-03, RF-04, RNF-01, RNF-02, RNF-04
  - Hecho cuando: `index.html` contenga el layout responsive de Momentos Cookie con navegación por 3 vistas (`#view-planning`, `#view-orders`, `#view-form`), diálogos nativos `<dialog>` para confirmaciones/detalles y estilos CSS con contraste accesible y áreas táctiles >= 44px.

- [x] **T4. Formulario interactivo con selector dinámico y cálculo en tiempo real (`assets/js/ui.js` y `assets/js/main.js`).** RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-15
  - Hecho cuando: El selector individual vs combo alterne de forma fluida los campos condicionales (empaques, kit de pintura con pinceles, galletas por combo), el total y saldo de abono se calculen automáticamente al escribir y se guarde el pedido en almacenamiento local.

- [x] **T5. Panel de planificación cronológica y semáforo de urgencia (`assets/js/ui.js`).** RF-08, RF-09, RF-10, RF-11, RF-12
  - Hecho cuando: Los pedidos activos se ordenen cronológicamente y se dividan en los 4 bloques temporales (*Atrasados*, *Hoy*, *Esta semana*, *Próximas semanas*) con sus badges de color y los botones rápidos "Listo" y "Entregado" actualicen el estado y reubiquen la tarjeta al instante.

- [x] **T6. Listado general, búsqueda en vivo, contacto de WhatsApp y confirmación de eliminación (`assets/js/ui.js` y `assets/js/main.js`).** RF-13, RF-14, RF-16, RF-19
  - Hecho cuando: El buscador filtre en tiempo real sin importar mayúsculas o tildes, el botón de WhatsApp abra el chat con mensaje prellenado del pedido y la eliminación se confirme de forma segura mediante `<dialog>`.

- [x] **T7. Validación integral del sistema, revisión en viewport móvil y actualización de memoria.** RNF-01, RNF-02, RNF-03, RNF-04
  - Hecho cuando: La suite completa de tests pase (`node --test`), sintaxis validada con `node -c`, verificación visual y responsive en pantalla de taller y `memory.md` registrado.
