# Spec 002 — Planilla de Producción en Taller, Métricas y Respaldo de Datos

Estado: implementada

## Contexto y objetivo
Con el registro y planificación cronológica de pedidos operativos (Spec 001), el taller de "Momentos Cookie" necesita optimizar la jornada de cocina diaria y semanal. En lugar de revisar pedido por pedido para calcular manualmente cuánta masa preparar o cuántos empaques alistar, se requiere:
1. Una **Planilla Consolidada de Producción (Batch de Horneado)** que sume automáticamente las galletas a hornear por sabor y los combos con kits de pintura requeridos para una fecha o rango temporal.
2. Un **Panel de Balance Financiero** con el total de ingresos proyectados, dinero efectivamente cobrado en señas y saldo pendiente por cobrar.
3. Un sistema de **Copia de Seguridad y Portabilidad (Backup JSON / CSV)** que permita descargar los pedidos en un archivo y restaurarlos o exportarlos a hojas de cálculo (Excel / Google Sheets).

## Usuarios
- **Artesano Repostero:** Consulta la hoja de producción del día para planificar masas, horneados y armado de kits sin errores de conteo.
- **Administrador:** Revisa el flujo de caja (cobrado vs por cobrar) y resguarda periódicamente los datos del negocio descargando una copia de seguridad.

## Historias de usuario
- **HU-1:** Como repostero, quiero ver el total acumulado de galletas que debo hornear agrupadas por sabor para el día de hoy o la semana actual, para preparar los lotes de masa con exactitud.
- **HU-2:** Como repostero, quiero ver la cantidad de empaques especiales y kits de pintura que debo armar para las órdenes activas, para verificar el inventario de materiales antes de comenzar.
- **HU-3:** Como administrador, quiero visualizar el total vendido, el total ingresado por abonos y el saldo pendiente de cobro, para mantener la salud financiera del taller.
- **HU-4:** Como administrador, quiero exportar todos mis pedidos a un archivo JSON o CSV con un solo clic, para tener un respaldo en mi computador o abrirlo en Excel/Google Sheets.
- **HU-5:** Como administrador, quiero poder importar un archivo de respaldo JSON previamente descargado, para recuperar mis datos en caso de cambio de dispositivo o limpieza del navegador.

## Definiciones
- **Batch de Horneado (Planilla de Producción):** Consolidación matemática de unidades requeridas a partir de pedidos en estado `Pendiente` o `En producción` para un rango de entrega seleccionado (*Hoy*, *Esta semana* o *Todos los activos*).
- **Copia de Seguridad (Backup JSON):** Archivo `.json` descargable con el contenido íntegro y fechado de la colección de pedidos (`momentos_cookie_orders`).
- **Exportación CSV:** Archivo estructurado con codificación UTF-8 y delimitador estándar para su apertura inmediata en Excel o importación en Google Sheets.

## Requisitos funcionales

### Planilla de Producción y Horneado
- **RF-01:** EL SISTEMA consolidará en una pestaña o sección dedicada ("Planilla de Producción") el total de galletas a hornear agrupadas por sabor para los pedidos en producción o pendientes.
- **RF-02:** EL SISTEMA calculará el número total de galletas requeridas para pedidos tipo combo (multiplicando la cantidad de combos por las galletas incluidas de cada uno).
- **RF-03:** EL SISTEMA totalizará la cantidad de kits de pintura comestible y el desglose de tipos de empaques (cajas, latas, bolsas) requeridos para el período filtrado.
- **RF-04:** CUANDO el usuario seleccione el filtro temporal de producción (*Hoy*, *Esta semana*, *Todos los activos*), EL SISTEMA recalculará instantáneamente las cantidades de producción.
- **RF-05:** CUANDO el usuario pulse "Imprimir Planilla", EL SISTEMA generará una vista limpia de impresión (`@media print`) en formato lista de trabajo para mesada.

### Métricas y Balance Financiero
- **RF-06:** EL SISTEMA presentará tarjetas de resumen con:
  - Total de ingresos brutos acumulados.
  - Total efectivamente cobrado (pagos totales + abonos registrados).
  - Cuentas por cobrar (saldo pendiente de pedidos no cancelados).
  - Tasa de efectividad de pedidos (entregados vs cancelados/activos).

### Respaldo e Importación (Backup & Export)
- **RF-07:** CUANDO el usuario presione "Descargar Copia de Seguridad", EL SISTEMA generará y descargará un archivo `momentos-cookie-backup-YYYY-MM-DD.json` con todos los pedidos.
- **RF-08:** CUANDO el usuario presione "Exportar a Excel / CSV", EL SISTEMA generará y descargará un archivo CSV formateado con cabeceras en español y codificación UTF-8 con BOM.
- **RF-09:** CUANDO el usuario suba un archivo JSON de respaldo válido mediante "Restaurar Copia de Seguridad", EL SISTEMA validará la estructura, solicitará confirmación explícita y fusionará o reemplazará los pedidos en el almacenamiento local.
- **RF-10:** SI el archivo subido no contiene un esquema de pedidos válido o está corrupto, ENTONCES EL SISTEMA rechazará la importación con una notificación de error sin alterar los datos actuales.

## Requisitos no funcionales
- **RNF-01 (Sin servidor externo):** Toda la consolidación de producción, cálculos métricos y generación de archivos JSON/CSV debe realizarse en el navegador mediante JavaScript Vanilla y APIs de Blob (`URL.createObjectURL`).
- **RNF-02 (Rendimiento):** El cálculo de producción de hasta 1000 pedidos debe tardar menos de 50 ms.
- **RNF-03 (Imprimibilidad limpia):** La hoja de producción debe caber en una página estándar A4/Carta al imprimirse.

## Casos límite
- **CL-01:** Pedidos tipo combo con sabor especificado en notas o sin sabor explícito: agruparlos bajo el nombre temático del combo correspondiente.
- **CL-02:** Importación de archivo JSON con pedidos duplicados por ID: el sistema debe actualizar el pedido existente con los datos del archivo importado.
- **CL-03:** Caracteres especiales y tildes en el archivo CSV: deben incluir el prefijo BOM (`\uFEFF`) para que Microsoft Excel en español lo abra correctamente sin corromper tildes.

## Criterios de finalización
- Pestaña "Producción" funcional con filtro temporal (*Hoy*, *Esta semana*, *Todos*), conteo exacto de galletas por sabor/combo y recuento de kits de pintura y empaques.
- Tarjetas de métricas financieras (total facturado, cobrado y saldo pendiente).
- Botones de exportación JSON y CSV operativos y probados.
- Modal de importación de respaldo JSON con validación defensiva.

## Dudas resueltas (Acuerdos de Aprobación)
- **1. Estrategia de importación de respaldo:** Fusión inteligente por defecto (actualiza pedidos existentes por ID y añade nuevos sin borrar órdenes locales), con confirmación visual.
- **2. Checklist táctil en planilla:** Incluidas casillas de verificación interactivas para marcar lotes horneados y kits empaquetados en tiempo real durante la jornada de taller.

