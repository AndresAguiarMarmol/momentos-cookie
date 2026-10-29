const test = require('node:test');
const assert = require('node:assert/strict');
const {
  consolidarProduccion,
  calcularMetricasFinancieras,
  generarCsvPedidos,
  validarEstructuraBackup,
  fusionarPedidos
} = require('../assets/js/production.js');

test('Consolidación de lotes de galletas a hornear por sabor y combos', () => {
  const hoy = new Date('2026-10-28T10:00:00.000Z');
  const pedidos = [
    {
      id: '1',
      status: 'Pendiente',
      orderType: 'individual',
      dates: { deliveryDate: '2026-10-28' },
      details: { flavor: 'Vainilla Glaseada', quantity: 20 }
    },
    {
      id: '2',
      status: 'En producción',
      orderType: 'individual',
      dates: { deliveryDate: '2026-10-28' },
      details: { flavor: 'Vainilla Glaseada', quantity: 10 }
    },
    {
      id: '3',
      status: 'En producción',
      orderType: 'combo',
      dates: { deliveryDate: '2026-10-28' },
      details: { comboName: 'Kit Pintura Dulce', quantity: 2, cookiesCount: 6, hasPaintKit: true, packaging: 'Caja con lazo' }
    },
    {
      id: '4',
      status: 'Entregado', // Ya entregado: no debe contarse para hornear
      orderType: 'individual',
      dates: { deliveryDate: '2026-10-28' },
      details: { flavor: 'Chocolate', quantity: 30 }
    }
  ];

  const resultado = consolidarProduccion(pedidos, { rango: 'activos', hoy });

  // 20 + 10 de vainilla = 30
  assert.equal(resultado.sabores['Vainilla Glaseada'], 30);
  assert.equal(resultado.combos['Kit Pintura Dulce'], 2);
  // Total galletas: 30 individuales + (2 combos * 6 galletas = 12) = 42 galletas a hornear
  assert.equal(resultado.totalGalletas, 42);
  assert.equal(resultado.totalKitsPintura, 2);
  assert.equal(resultado.empaques['Caja con lazo'], 2);
  assert.equal(resultado.ordenesContadas, 3);
});

test('Cálculo de balance y métricas financieras', () => {
  const pedidos = [
    { status: 'Pendiente', payment: { total: 10000, depositAmount: 0, status: 'Pendiente' } },
    { status: 'En producción', payment: { total: 20000, depositAmount: 10000, status: 'Abono/Seña' } },
    { status: 'Listo para entrega', payment: { total: 30000, depositAmount: 30000, status: 'Pagado total' } },
    { status: 'Cancelado', payment: { total: 5000, depositAmount: 0, status: 'Pendiente' } }
  ];

  const metricas = calcularMetricasFinancieras(pedidos);

  // Total facturado (excluye cancelados): 10000 + 20000 + 30000 = 60000
  assert.equal(metricas.totalFacturado, 60000);
  // Total cobrado: 0 + 10000 + 30000 = 40000
  assert.equal(metricas.totalCobrado, 40000);
  // Saldo pendiente: 10000 + 10000 + 0 = 20000
  assert.equal(metricas.saldoPendiente, 20000);
  assert.equal(metricas.pedidosActivos, 3);
  assert.equal(metricas.pedidosCancelados, 1);
});

test('Generación de CSV estructurado con prefijo BOM para Excel', () => {
  const pedidos = [
    {
      id: 'MC-20261028-001',
      dates: { deliveryDate: '2026-10-30', deliveryTime: '15:00' },
      customer: { name: 'María José, González', phone: '912345678' },
      orderType: 'combo',
      details: { comboName: 'Kit Dulce Fiesta', quantity: 2 },
      payment: { total: 25000, depositAmount: 10000, status: 'Abono/Seña' },
      status: 'En producción',
      notes: 'Sin nueces; diseño flores'
    }
  ];

  const csv = generarCsvPedidos(pedidos);

  // Debe iniciar con BOM UTF-8 (\uFEFF)
  assert.ok(csv.startsWith('\uFEFF'), 'Debe incluir BOM UTF-8');
  assert.match(csv, /ID;Fecha Entrega;Hora;Cliente;Teléfono/);
  assert.match(csv, /MC-20261028-001/);
  assert.match(csv, /"María José, González"/, 'Debe escapar nombres con comas o caracteres especiales');
  assert.match(csv, /"Sin nueces; diseño flores"/, 'Debe escapar notas con punto y coma');
});

test('Validación defensiva de JSON de backup', () => {
  // Objeto inválido
  assert.equal(validarEstructuraBackup(null).valid, false);
  assert.equal(validarEstructuraBackup('no-json').valid, false);
  assert.equal(validarEstructuraBackup({}).valid, false);

  // Array vacío es válido
  assert.equal(validarEstructuraBackup([]).valid, true);

  // Array con pedidos con estructura requerida
  const valido = [
    { id: 'MC-1', customer: { name: 'Ana' }, dates: {}, details: {}, payment: {}, status: 'Pendiente' }
  ];
  assert.equal(validarEstructuraBackup(valido).valid, true);
});

test('Fusión inteligente de pedidos importados (sin duplicados)', () => {
  const locales = [
    { id: 'MC-1', customer: { name: 'Local Antiguo' }, status: 'Pendiente' },
    { id: 'MC-2', customer: { name: 'Solo Local' }, status: 'Pendiente' }
  ];

  const importados = [
    { id: 'MC-1', customer: { name: 'Local Actualizado' }, status: 'En producción' },
    { id: 'MC-3', customer: { name: 'Nuevo Importado' }, status: 'Listo para entrega' }
  ];

  const fusion = fusionarPedidos(locales, importados);

  assert.equal(fusion.length, 3);
  const mc1 = fusion.find(p => p.id === 'MC-1');
  assert.equal(mc1.customer.name, 'Local Actualizado', 'Debe actualizar el pedido existente');
  assert.equal(mc1.status, 'En producción');
  assert.ok(fusion.some(p => p.id === 'MC-2'));
  assert.ok(fusion.some(p => p.id === 'MC-3'));
});
