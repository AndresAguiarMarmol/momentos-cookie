/**
 * assets/js/production.js
 * Funciones puras para consolidación de horneado en cocina, métricas financieras y formateo CSV/JSON.
 */

function consolidarProduccion(pedidos = [], { rango = 'activos', hoy = new Date() } = {}) {
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  const finSemanaTime = hoy.getTime() + 7 * 24 * 60 * 60 * 1000;

  // Filtrar solo pedidos que requieran producción (no entregados ni cancelados)
  const pedidosProduccion = pedidos.filter(p => {
    if (p.status === 'Entregado' || p.status === 'Cancelado') {
      return false;
    }

    const fEntrega = p.dates && p.dates.deliveryDate;
    if (!fEntrega) return true;

    if (rango === 'hoy') {
      return fEntrega === hoyStr;
    }

    if (rango === 'semana') {
      const [y, m, d] = fEntrega.split('-').map(Number);
      const targetTime = new Date(y, (m || 1) - 1, d || 1).getTime();
      return targetTime <= finSemanaTime;
    }

    return true; // 'activos'
  });

  const sabores = {};
  const combos = {};
  const empaques = {};
  let totalGalletas = 0;
  let totalKitsPintura = 0;

  for (const orden of pedidosProduccion) {
    if (orden.orderType === 'combo') {
      const nombre = (orden.details && orden.details.comboName) || 'Combo Especial';
      const cantCombos = Math.max(1, Number(orden.details && orden.details.quantity) || 1);
      const galletasPorCombo = Math.max(1, Number(orden.details && orden.details.cookiesCount) || 6);
      const subtotalGalletas = cantCombos * galletasPorCombo;

      combos[nombre] = (combos[nombre] || 0) + cantCombos;
      totalGalletas += subtotalGalletas;

      if (orden.details && orden.details.hasPaintKit) {
        totalKitsPintura += cantCombos;
      }

      const empaque = (orden.details && orden.details.packaging) || 'Caja decorativa';
      empaques[empaque] = (empaques[empaque] || 0) + cantCombos;
    } else {
      const sabor = (orden.details && orden.details.flavor) || 'Galletas Artesanales';
      const cant = Math.max(0, Number(orden.details && orden.details.quantity) || 0);

      sabores[sabor] = (sabores[sabor] || 0) + cant;
      totalGalletas += cant;
    }
  }

  return {
    totalGalletas,
    sabores,
    combos,
    empaques,
    totalKitsPintura,
    ordenesContadas: pedidosProduccion.length
  };
}

function calcularMetricasFinancieras(pedidos = []) {
  let totalFacturado = 0;
  let totalCobrado = 0;
  let pedidosActivos = 0;
  let pedidosEntregados = 0;
  let pedidosCancelados = 0;

  for (const p of pedidos) {
    if (p.status === 'Cancelado') {
      pedidosCancelados++;
      continue;
    }

    if (p.status === 'Entregado') {
      pedidosEntregados++;
    } else {
      pedidosActivos++;
    }

    const total = Math.max(0, Number(p.payment && p.payment.total) || 0);
    let abono = Math.max(0, Number(p.payment && p.payment.depositAmount) || 0);

    if (p.payment && p.payment.status === 'Pagado total') {
      abono = total;
    } else if (p.payment && p.payment.status === 'Pendiente') {
      abono = 0;
    }

    totalFacturado += total;
    totalCobrado += abono;
  }

  const saldoPendiente = Math.max(0, totalFacturado - totalCobrado);
  const totalValidos = pedidosActivos + pedidosEntregados;
  const tasaEfectividad = totalValidos > 0 ? Math.round((pedidosEntregados / (totalValidos + pedidosCancelados)) * 100) : 100;

  return {
    totalFacturado,
    totalCobrado,
    saldoPendiente,
    pedidosActivos,
    pedidosEntregados,
    pedidosCancelados,
    tasaEfectividad
  };
}

function escaparCsv(texto) {
  const str = String(texto || '');
  if (str.includes(';') || str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generarCsvPedidos(pedidos = []) {
  const BOM = '\uFEFF';
  const cabeceras = [
    'ID',
    'Fecha Entrega',
    'Hora',
    'Cliente',
    'Teléfono',
    'Correo',
    'Modalidad',
    'Producto / Sabor',
    'Cantidad',
    'Total ($)',
    'Abonado ($)',
    'Saldo ($)',
    'Estado Pedido',
    'Estado Pago',
    'Notas'
  ];

  const filas = [cabeceras.join(';')];

  for (const p of pedidos) {
    const isCombo = p.orderType === 'combo';
    const prodDesc = isCombo ? (p.details && p.details.comboName) : (p.details && p.details.flavor);
    const total = Number(p.payment && p.payment.total) || 0;
    const abono = Number(p.payment && p.payment.depositAmount) || 0;
    const saldo = Math.max(0, total - abono);

    const fila = [
      escaparCsv(p.id),
      escaparCsv(p.dates && p.dates.deliveryDate),
      escaparCsv(p.dates && p.dates.deliveryTime),
      escaparCsv(p.customer && p.customer.name),
      escaparCsv(p.customer && p.customer.phone),
      escaparCsv(p.customer && p.customer.email),
      escaparCsv(p.orderType),
      escaparCsv(prodDesc),
      Number(p.details && p.details.quantity) || 1,
      total,
      abono,
      saldo,
      escaparCsv(p.status),
      escaparCsv(p.payment && p.payment.status),
      escaparCsv(p.notes)
    ];

    filas.push(fila.join(';'));
  }

  return BOM + filas.join('\r\n');
}

function validarEstructuraBackup(data) {
  if (!data) {
    return { valid: false, error: 'Datos no proporcionados.' };
  }

  let items = data;
  if (typeof data === 'string') {
    try {
      items = JSON.parse(data);
    } catch {
      return { valid: false, error: 'El archivo no contiene un JSON válido.' };
    }
  }

  if (!Array.isArray(items)) {
    return { valid: false, error: 'El archivo de respaldo debe contener una lista (array) de pedidos.' };
  }

  for (let i = 0; i < items.length; i++) {
    const p = items[i];
    if (!p || typeof p !== 'object' || !p.id || !p.customer || !p.status) {
      return { valid: false, error: `El pedido en posición ${i + 1} no cumple con el esquema requerido (ID, cliente y estado).` };
    }
  }

  return { valid: true, error: null, count: items.length };
}

function fusionarPedidos(pedidosLocales = [], pedidosImportados = []) {
  const mapa = new Map();

  for (const local of pedidosLocales) {
    if (local && local.id) {
      mapa.set(local.id, { ...local });
    }
  }

  for (const imp of pedidosImportados) {
    if (imp && imp.id) {
      mapa.set(imp.id, { ...mapa.get(imp.id), ...imp });
    }
  }

  return Array.from(mapa.values());
}

// Exportación dual
const ProductionModule = {
  consolidarProduccion,
  calcularMetricasFinancieras,
  generarCsvPedidos,
  validarEstructuraBackup,
  fusionarPedidos
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductionModule;
}

if (typeof window !== 'undefined') {
  window.Production = ProductionModule;
}
