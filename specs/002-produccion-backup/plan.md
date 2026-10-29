# Plan Técnico — Spec 002: Planilla de Producción, Métricas y Backup

## 1. Archivos y responsabilidades

| Archivo | Responsabilidad principal | Requisitos cubiertos |
| :--- | :--- | :--- |
| `assets/js/production.js` | Funciones puras de agregación: consolidación de unidades de galletas por sabor/combo, conteo de kits de pintura y empaques, cálculo de métricas financieras, conversor a CSV con BOM y validador de backups JSON. | RF-01, RF-02, RF-03, RF-06, RF-08, RF-10 |
| `assets/js/storage.js` | Funciones de exportación de blob JSON/CSV, importación de archivo con fusión inteligente de pedidos y control de errores. | RF-07, RF-08, RF-09, RF-10 |
| `index.html` | Nueva pestaña SPA: 👩‍🍳 *Producción & Métricas* (`#view-production`), tarjetas de balance financiero, tabla de lotes de horneado con checkboxes táctiles, modal de importación y botones de exportación. | RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RNF-01, RNF-03 |
| `assets/css/custom.css` | Estilos para la planilla de producción, tachado visual de lotes completados (`line-through`), diseño de impresión en hoja A4 de taller. | RF-05, RNF-03 |
| `assets/js/ui.js` | Renderizado reactivo de la planilla de horneado, tarjetas financieras y disparadores de descargas de archivos. | RF-01, RF-03, RF-04, RF-06 |
| `assets/js/main.js` | Listeners de filtros de producción (*Hoy*, *Esta semana*, *Todos*), carga de archivo JSON (`input type="file"`) y botones de descarga CSV/JSON. | RF-04, RF-07, RF-08, RF-09 |
| `tests/production.test.js` | Suite unitaria pura con `node --test` para validar consolidación de galletas, métricas financieras, exportación CSV con BOM e importación defensiva. | RF-01 a RF-10 |

---

## 2. Funciones puras (con "hoy" como parámetro)

```javascript
// Agrupa y suma cantidades de galletas a hornear por sabor y combos
function consolidarProduccion(pedidos, { rango = 'activos', hoy = new Date() } = {})

// Calcula métricas de ingresos, cobros, saldos pendientes y efectividad
function calcularMetricasFinancieras(pedidos)

// Transforma la lista de pedidos en string CSV compatible con Excel (UTF-8 con BOM)
function generarCsvPedidos(pedidos)

// Valida si un objeto o string JSON cumple con el esquema Order
function validarEstructuraBackup(data)

// Fusión inteligente de pedidos importados con los locales
function fusionarPedidos(pedidosLocales, pedidosImportados)
```

---

## 3. Algoritmos en pseudocódigo

### A. Consolidación de Lotes de Horneado
```text
ALGORITMO consolidarProduccion(pedidos, rango, hoy):
    pedidosFiltrados = FiltrarPorRango(pedidos, rango, hoy) // solo Pendiente o En producción
    sabores = {}
    combos = {}
    empaques = {}
    totalGalletas = 0
    totalKitsPintura = 0

    PARA CADA orden EN pedidosFiltrados:
        SI orden.orderType == "individual":
            sabor = orden.details.flavor || "Galletas Artesanales"
            cant = orden.details.quantity || 0
            sabores[sabor] = (sabores[sabor] || 0) + cant
            totalGalletas += cant
        SINO SI orden.orderType == "combo":
            nombre = orden.details.comboName || "Combo Especial"
            cantCombos = orden.details.quantity || 1
            galletasPorCombo = orden.details.cookiesCount || 6
            subtotalGalletas = cantCombos * galletasPorCombo
            combos[nombre] = (combos[nombre] || 0) + cantCombos
            totalGalletas += subtotalGalletas

            SI orden.details.hasPaintKit:
                totalKitsPintura += cantCombos
            
            empaque = orden.details.packaging || "Caja decorativa"
            empaques[empaque] = (empaques[empaque] || 0) + cantCombos

    RETORNAR { totalGalletas, sabores, combos, empaques, totalKitsPintura, ordenesContadas: pedidosFiltrados.length }
FIN ALGORITMO
```

### B. Formateo CSV con BOM para Microsoft Excel
```text
ALGORITMO generarCsvPedidos(pedidos):
    BOM = "\uFEFF"
    cabeceras = ["ID", "Fecha Entrega", "Hora", "Cliente", "Teléfono", "Modalidad", "Descripción", "Cantidad", "Total ($)", "Abono ($)", "Saldo ($)", "Estado Pedido", "Estado Pago", "Notas"]
    filas = [cabeceras.join(";")]

    PARA CADA p EN pedidos:
        fila = [
            p.id,
            p.dates.deliveryDate,
            p.dates.deliveryTime || "",
            EscaparCsv(p.customer.name),
            p.customer.phone,
            p.orderType,
            EscaparCsv(p.orderType == "combo" ? p.details.comboName : p.details.flavor),
            p.details.quantity,
            p.payment.total,
            p.payment.depositAmount,
            p.payment.total - p.payment.depositAmount,
            p.status,
            p.payment.status,
            EscaparCsv(p.notes)
        ]
        filas.agregar(fila.join(";"))

    RETORNAR BOM + filas.join("\r\n")
FIN ALGORITMO
```

---

## 4. Decisiones justificadas y alternativas descartadas

1. **Uso de CSV con delimitador punto y coma (`;`) y BOM UTF-8:**
   - *Decisión:* El estándar hispanohablante de Excel en Windows requiere `;` (debido a que la coma `,` es el separador decimal) y el prefijo `\uFEFF`.
   - *Alternativa descartada:* Coma `,` sin BOM; descartada porque abre los archivos con caracteres corrompidos y todas las columnas pegadas en Excel en español.

2. **Cálculo de producción puro y desacoplado del DOM:**
   - *Decisión:* `production.js` procesa los datos puros sin tocar el DOM.
   - *Alternativa descartada:* Sumar valores leyendo strings de las tarjetas del DOM; descartada porque es frágil, lenta y no testeable en Node.js.

---

## 5. Estrategia de Pruebas

Pruebas en `tests/production.test.js`:
- Consolidación de sabores individuales y multiplicación de galletas en combos (RF-01, RF-02).
- Conteo de kits de pintura y tipos de empaque (RF-03).
- Cálculo exacto de métricas financieras (RF-06).
- Generación de CSV con BOM y escape de comillas (RF-08, CL-03).
- Validación estricta de JSON de backup y fusión inteligente (RF-09, RF-10, CL-02).
