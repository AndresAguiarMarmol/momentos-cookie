# Spec 005 — Pedidos Multi-Ítem (Mezcla de Artículos Individuales y Combos)

Estado: implementada

## 1. Contexto y Objetivo
Actualmente, el sistema solo permite registrar un único artículo por pedido (o bien galletas individuales de un solo sabor, o bien un combo/kit específico). En la práctica del taller de Momentos Cookie, un mismo cliente suele solicitar pedidos mixtos (por ejemplo: 12 galletas individuales de limón, 1 combo kit infantil con acuarelas comestibles y 6 galletas individuales de chocolate).
El objetivo de esta especificación es permitir que cada pedido contenga múltiples ítems (mezclando artículos individuales y combos/kits), calculando automáticamente subtotales por renglón y el gran total del pedido, preservando la compatibilidad absoluta con los pedidos ya existentes.

## 2. Usuarios y Roles
- **Repostera / Administradora del taller:** Registra, edita y visualiza pedidos con uno o múltiples ítems de forma ágil desde el móvil o computador, sin fricción ni cálculos manuales.

## 3. Historias de Usuario
- **HU-1**: Como encargada del taller, quiero agregar múltiples ítems a un mismo pedido (pudiendo ser individuales o combos) para registrar pedidos completos en una sola orden sin tener que crear pedidos separados para un mismo cliente.
- **HU-2**: Como encargada del taller, quiero eliminar o editar ítems dentro del pedido antes de guardarlo, viendo el desglose y el total actualizado en tiempo real.
- **HU-3**: Como encargada del taller, quiero que los pedidos antiguos creados con un solo ítem sigan mostrándose, imprimiéndose y editándose correctamente sin perder datos.

## 4. Definiciones y Glosario
- **Ítem de Pedido:** Renglón individual dentro de un pedido que contiene: tipo (`individual` o `combo`), descripción/sabor/nombre del combo, cantidad de unidades, cantidad de galletas por unidad, empaque, extras (kit de pintura si aplica), precio unitario y subtotal.
- **Pedido Mixto:** Pedido que contiene más de un ítem, o ítems combinados de galletas individuales y combos.

## 5. Requisitos Funcionales (EARS)

### Gestión de Ítems en el Formulario
- **RF-1**: CUANDO la usuaria abre el formulario de nuevo pedido, EL SISTEMA presenta un primer ítem listo para configurar y un botón visible para "＋ Agregar otro ítem al pedido".
- **RF-2**: CUANDO la usuaria pulsa "＋ Agregar otro ítem", EL SISTEMA añade un nuevo bloque de ítem al formulario copiando por defecto el tipo (individual o combo) del ítem anterior para acelerar la carga repetitiva, con sus campos correspondientes (tipo, sabor/combo, empaque, kit de pintura, cantidad y precio).
- **RF-3**: CUANDO la usuaria cambia el tipo de un ítem específico entre "Galletas Individuales" y "Combo / Kit", EL SISTEMA alterna dinámicamente los campos exclusivos de dicho ítem (empaque, selector de kit de pintura) sin afectar a los demás ítems del formulario.
- **RF-4**: CUANDO la usuaria pulsa el botón de eliminar en un ítem de la lista, EL SISTEMA remueve dicho ítem y recalcula inmediatamente el total del pedido, impidiendo eliminar el último ítem restante si solo queda uno.
- **RF-5**: MIENTRAS la usuaria modifica cantidades, precios o extras en cualquiera de los ítems, EL SISTEMA recalcula de forma reactiva el subtotal de cada ítem, la sumatoria total de galletas a hornear y el total general a pagar del pedido.

### Persistencia y Retrocompatibilidad
- **RF-6**: CUANDO se guarda un pedido nuevo o editado, EL SISTEMA almacena la colección completa de ítems dentro del pedido y actualiza el balance de pagos conforme al nuevo total calculado.
- **RF-7**: SI el sistema carga un pedido creado con el esquema anterior (sin arreglo de ítems), ENTONCES EL SISTEMA lo transforma de manera transparente en un pedido con una colección de un solo ítem conservando todos sus valores originales (`flavor`, `packaging`, `quantity`, `subtotal`, etc.).

### Visualización y Operatividad
- **RF-8**: CUANDO se visualiza una tarjeta de pedido en la vista de Planificación o en la lista general, EL SISTEMA muestra un resumen claro de los ítems incluidos (ejemplo: "2 ítems: 12x Galleta Vainilla, 1x Kit Fiesta"), indicando la suma total de galletas comprometidas.
- **RF-9**: CUANDO se abre el modal de detalle de un pedido, EL SISTEMA desglosa cada ítem con su detalle completo (tipo, empaque, kit de pintura, cantidad, precio y subtotal).
- **RF-10**: CUANDO se genera el comprobante de entrega o remito de taller (`modal-receipt`), EL SISTEMA imprime una tabla detallada con cada uno de los ítems del pedido, sus subtotales correspondientes y el total general.
- **RF-11**: CUANDO se consulta la planilla de producción de horneado, EL SISTEMA consolida las galletas y extras de todos los ítems de todos los pedidos activos, agrupándolos adecuadamente por sabor y combo.

## 6. Requisitos No Funcionales
- **RNF-1**: Ergonomía táctil para taller: los botones para agregar y remover ítems deben tener un área táctil mínima de 44x44px.
- **RNF-2**: Cero pérdida de datos: el 100% de los 17 pedidos existentes en el sistema deben conservarse intactos sin alterar montos ni estados.
- **RNF-3**: Rendimiento reactivo: el recálculo y renderizado dinámico de la lista de ítems debe ejecutarse en menos de 50ms sin recargar la página.

## 7. Casos Límite y Manejo de Errores
- **CL-1**: Pedido con un solo ítem: El formulario debe permitir guardar pedidos de un solo ítem con la misma facilidad que antes.
- **CL-2**: Intento de dejar el pedido sin ítems: El sistema no debe permitir borrar el último ítem; si el usuario intenta borrarlo, se vacían sus campos pero se mantiene al menos un ítem activo.
- **CL-3**: Ítem con cantidad 0 o precio vacío: El sistema valida en tiempo real y no permite guardar el pedido si algún ítem tiene cantidad menor a 1 o precio inválido.
- **CL-4**: Pedido mixto con abono parcial: El cálculo del saldo pendiente debe basarse en la sumatoria de todos los ítems menos el monto abonado.

## 8. Fuera de Alcance
- Descuentos por volumen a nivel de ítem o cupones de promoción.
- Control de inventario de materias primas o stock de ingredientes.

## 9. Criterios de Finalización (DoD)
- [ ] Formulario permite agregar, configurar y eliminar N ítems mezclando galletas individuales y combos.
- [ ] Recálculo dinámico en tiempo real de subtotales por ítem y gran total.
- [ ] Visualización clara en tarjetas de planificación, lista general y modal de detalle.
- [ ] Comprobante térmico/remito imprime el desglose completo de ítems.
- [ ] Planilla de producción consolida adecuadamente todos los ítems de los pedidos.
- [ ] 100% de retrocompatibilidad con los 17 pedidos existentes.
- [ ] Suite completa de pruebas unitarias pasando al 100% en verde con `node --test`.

## 10. Dudas Abiertas
- Ninguna pendiente. (Aclarado: el nuevo ítem copia el tipo del ítem anterior para acelerar la carga).
