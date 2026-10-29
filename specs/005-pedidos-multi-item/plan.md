# Plan Técnico — Spec 005 (Pedidos Multi-Ítem)

## 1. Archivos Involucrados y Responsabilidades
- `assets/js/orders.js`:
  - `normalizeOrder(order)`: Función pura que garantiza que cualquier pedido (nuevo o antiguo) exponga un arreglo `items: [...]`. Si tiene el formato legado (`order.details` y `order.orderType`), genera el ítem correspondiente de forma transparente.
  - `calculateItemSubtotal(item)`: Calcula `quantity * unitPrice + (item.hasPaintKit ? quantity * PAINT_KIT_EXTRA : 0)`.
  - `calculateOrderTotals(items, depositAmount)`: Suma subtotales de todos los ítems, calcula el total general, determina el saldo pendiente y el total de galletas a hornear.
  - `formatOrderItemsSummary(order)`: Devuelve una cadena descriptiva para las tarjetas (ej: "2 ítems (18 galletas): 12x Vainilla, 1x Kit Fiesta").
- `assets/js/storage.js`:
  - Integrar `normalizeOrder` en la lectura y guardado de `localStorage`, asegurando que los 17 pedidos existentes sigan funcionando sin alteraciones.
- `assets/js/production.js`:
  - Actualizar la consolidación de producción para recorrer `order.items` en lugar de únicamente `order.details`. Suma galletas por sabor, combos, kits de pintura y empaques en toda la orden.
- `assets/js/receipt.js`:
  - Renderizar tabla o lista de renglones con todos los ítems del pedido en el comprobante térmico/remito de taller.
- `assets/js/ui.js` e `index.html`:
  - Reemplazar la sección monoproducto del formulario con un contenedor dinámico `#order-items-list` que renderiza una o varias tarjetas de ítem.
  - Botón táctil `[＋ Agregar otro ítem al pedido]` que duplica el tipo del ítem precedente.
  - Cada ítem contiene selector de tipo (Individual / Combo), campos condicionales (empaque y kit de pintura para combos), cantidad, precio y subtotal individual en vivo.
  - Botón de eliminación en cada ítem (deshabilitado o protegido si solo queda 1 ítem).
  - Actualización del modal de detalle (`#modal-detail`) y tarjetas de planificación para listar los ítems.
- `tests/multi_item.test.js`:
  - Pruebas unitarias completas de cálculo, normalización legacy, consolidación en producción y generación de comprobante.

## 2. Modelo de Datos y Normalización Retrocompatible

```javascript
// Esquema de cada Ítem individual
{
  "id": "item-1", // generado o índice
  "type": "individual", // o "combo"
  "flavor": "Vainilla Tradicional",
  "comboName": "",
  "cookiesCount": 1, // o cantidad por combo
  "packaging": "Bolsa celofán con lazo",
  "hasPaintKit": false,
  "quantity": 12,
  "unitPrice": 1500,
  "subtotal": 18000
}

// Estructura del Pedido (Order)
{
  "id": "MC-20261029-001",
  "customer": { ... },
  "dates": { ... },
  "orderType": "mixto", // "individual" | "combo" | "mixto"
  "items": [
    // Arreglo de ítems
  ],
  // Mantenemos order.details sincronizado con el primer ítem para clientes antiguos si fuera necesario
  "details": { ... },
  "payment": {
    "total": 36000,
    "depositAmount": 18000,
    "status": "Abono/Seña"
  }
}
```

## 3. Decisiones Técnicas y Alternativas Descartadas

- **Decisión 1: Compatibilidad Transparente en Memoria (`normalizeOrder`)**
  - Al leer de `storage.js`, si `order.items` no existe o no es un array, se construye al vuelo a partir de `order.details` y `order.orderType`.
  - *Alternativa descartada:* Migrar y reescribir de golpe la base de datos de `localStorage`. Se descartó para evitar cualquier riesgo de corrupción sobre los 17 pedidos reales de la usuaria.
- **Decisión 2: Ítems en Bloques Editables en el Formulario**
  - Cada ítem se muestra como una tarjeta compacta y elegante con su propio botón de tipo (Individual vs Combo) y sus inputs numéricos con cálculo inmediato.
  - *Alternativa descartada:* Modal emergente separado para cada ítem. Se descartó porque añade pasos innecesarios en la agilidad de taller/cocina donde la repostera necesita ver toda la orden de un vistazo.

## 4. Estrategia de Pruebas con `node --test`
- Suite `tests/multi_item.test.js` cubriendo:
  1. `normalizeOrder` transforma pedidos antiguos preservando el 100% de sus datos.
  2. `calculateItemSubtotal` calcula correctamente para individuales y combos con extras.
  3. `calculateOrderTotals` suma correctamente pedidos con múltiples ítems heterogéneos.
  4. Consolidación de producción agrupa correctamente sabores individuales y combos de pedidos multi-ítem.
  5. Comprobante de entrega desglosa todos los ítems.

