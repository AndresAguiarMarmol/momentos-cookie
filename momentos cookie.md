Actúa como un arquitecto de software y desarrollador frontend senior. Necesito que diseñes y construyas una aplicación web (Single Page Application / PWA) moderna, ligera y fácil de usar para la gestión y control de pedidos de un negocio de galletas artesanales y personalizadas.

---

### 1. REQUISITOS DE NEGOCIO Y MODELO DE DATOS

La app debe permitir registrar, listar, filtrar y cambiar el estado de los pedidos.

#### Datos del Pedido:
1. **Datos de Contacto:**
   - Nombre completo del cliente
   - Teléfono / WhatsApp
   - Correo electrónico
2. **Fechas clave:**
   - Fecha de recepción (por defecto hoy/fecha de registro)
   - Fecha comprometida de entrega (campo obligatorio con selector de fecha y hora opcional)
3. **Tipo de Pedido (Modalidad):**
   - **Individuales:**
     - Tipo/sabor de galleta
     - Cantidad de unidades
     - Precio unitario y subtotal
   - **Combos / Kits:**
     - Nombre o tipo de combo
     - Cantidad de galletas incluidas
     - Tipo de empaque / presentación (caja, bolsa decorativa, lata, etc.)
     - ¿Incluye kit de pintura? (Checkbox Sí/No: pinturas comestibles, pinceles, etc.)
     - Cantidad de combos solicitados
     - Precio unitario y subtotal
4. **Campos adicionales:**
   - Notas / especificaciones de diseño (temática, dedicatoria, alergias, etc.)
   - Estado del pedido: `Pendiente`, `En producción`, `Listo para entrega`, `Entregado`, `Cancelado`
   - Total monetario y estado de pago (`Pendiente`, `Abono/Seña`, `Pagado total`)

---

### 2. PANTALLAS Y MÓDULOS REQUERIDOS

1. **Formulario de Registro / Edición de Pedido:**
   - Selector dinámico entre "Galletas Individuales" y "Combo / Kit".
   - Al seleccionar "Combo", desplegar los campos condicionales (tipo de empaque, selector de kit de pintura).
   - Cálculo automático del total a pagar según cantidades y precios.

2. **Panel de Organización de Entregas (Vista de Planificación):**
   - **Agrupación cronológica:** Lista de pedidos ordenados automáticamente por `Fecha Comprometida de Entrega` (ascendente: lo más próximo o urgente arriba).
   - **Vistas rápidas:**
     - *Hoy*
     - *Esta semana*
     - *Próximas semanas*
     - *Atrasados / Urgentes* (destacados visualmente con alertas en rojo/amarillo si la fecha está vencida o es dentro de las próximas 24 horas).
   - Filtro por estado del pedido (`Pendiente`, `En producción`, etc.).
   - Botón directo para marcar pedido como "Listo" o "Entregado".

3. **Listado General / Búsqueda:**
   - Buscador por nombre de cliente, teléfono o número de pedido.
   - Posibilidad de editar o eliminar pedidos existentes.

---

### 3. ESPECIFICACIONES TÉCNICAS

- **Stack recomendado:** HTML5 semántico, CSS moderno (estilo limpio, responsive y con buen contraste) y JavaScript puro (vanilla) o React/Vue/Svelte.
- **Persistencia de datos:** Utiliza `localStorage` o `IndexedDB` para guardar los pedidos localmente de forma persistente sin necesidad inmediata de backend, pero manteniendo una estructura de datos modular (JSON) lista para conectarse a una API o base de datos externa (como Supabase, Firebase o Google Sheets).
- **Diseño UI/UX:** Interfaz limpia, optimizada para usar tanto en pantallas de escritorio como en móviles (ideal para revisar pedidos en el taller/cocina).

Por favor, genera primero la estructura de componentes y el código funcional completo (HTML, CSS y JS integrados o modulares).