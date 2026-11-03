const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ordersModule = require('../assets/js/orders.js');

test('T1.1: tieneSaldoPendiente detecta correctamente si un pedido tiene saldo pendiente', () => {
  const { tieneSaldoPendiente } = ordersModule;
  assert.equal(typeof tieneSaldoPendiente, 'function', 'tieneSaldoPendiente debe ser una función');

  const orderPendiente = {
    id: 'MC-1',
    status: 'Pendiente',
    payment: { total: 10000, depositAmount: 0, status: 'Pendiente' }
  };
  const orderAbonado = {
    id: 'MC-2',
    status: 'En producción',
    payment: { total: 20000, depositAmount: 10000, status: 'Abono/Seña' }
  };
  const orderPagado = {
    id: 'MC-3',
    status: 'Listo para entrega',
    payment: { total: 15000, depositAmount: 15000, status: 'Pagado total' }
  };
  const orderCancelado = {
    id: 'MC-4',
    status: 'Cancelado',
    payment: { total: 10000, depositAmount: 0, status: 'Pendiente' }
  };

  assert.equal(tieneSaldoPendiente(orderPendiente), true, 'Pedido pendiente debe tener saldo pendiente');
  assert.equal(tieneSaldoPendiente(orderAbonado), true, 'Pedido abonado con saldo > 0 debe tener saldo pendiente');
  assert.equal(tieneSaldoPendiente(orderPagado), false, 'Pedido 100% pagado no debe tener saldo pendiente');
  assert.equal(tieneSaldoPendiente(orderCancelado), false, 'Pedido cancelado no debe tener saldo pendiente');
});

test('T1.2: filtrarPedidosConSaldoPendiente filtra sólo pedidos activos con deuda', () => {
  const { filtrarPedidosConSaldoPendiente } = ordersModule;
  assert.equal(typeof filtrarPedidosConSaldoPendiente, 'function', 'filtrarPedidosConSaldoPendiente debe ser función');

  const orders = [
    { id: '1', status: 'Pendiente', payment: { total: 10000, depositAmount: 0 } },
    { id: '2', status: 'Listo', payment: { total: 20000, depositAmount: 20000, status: 'Pagado total' } },
    { id: '3', status: 'En producción', payment: { total: 30000, depositAmount: 15000 } },
    { id: '4', status: 'Cancelado', payment: { total: 15000, depositAmount: 0 } }
  ];

  const filtrados = filtrarPedidosConSaldoPendiente(orders);
  assert.equal(filtrados.length, 2, 'Debe retornar exactamente 2 pedidos');
  assert.deepEqual(filtrados.map(o => o.id), ['1', '3']);
});

test('T1.3: obtenerMetricasSaldoPendiente calcula cantidad y monto total de saldo acumulado', () => {
  const { obtenerMetricasSaldoPendiente } = ordersModule;
  assert.equal(typeof obtenerMetricasSaldoPendiente, 'function', 'obtenerMetricasSaldoPendiente debe ser función');

  const orders = [
    { id: '1', status: 'Pendiente', payment: { total: 10000, depositAmount: 2000 } }, // saldo: 8000
    { id: '2', status: 'Listo', payment: { total: 20000, depositAmount: 20000, status: 'Pagado total' } }, // saldo: 0
    { id: '3', status: 'En producción', payment: { total: 30000, depositAmount: 10000 } } // saldo: 20000
  ];

  const metricas = obtenerMetricasSaldoPendiente(orders);
  assert.equal(metricas.cantidad, 2, 'Cantidad debe ser 2');
  assert.equal(metricas.totalSaldo, 28000, 'Saldo total debe ser 28000');
});

test('T2.1: index.html contiene el botón de Saldo Pendiente en la barra de navegación con su badge', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  assert.match(html, /<button[^>]*id=["']btn-nav-pending-balance["']/i, 'Debe existir #btn-nav-pending-balance');
  assert.match(html, /id=["']pending-balance-badge["']/i, 'Debe existir #pending-balance-badge');
});

test('T2.2: index.html contiene el chip de filtro de saldo pendiente en #orders-status-filters', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  assert.match(html, /<button[^>]*data-status=["']saldo-pendiente["']/i, 'Debe existir el chip con data-status="saldo-pendiente"');
});

test('T2.3: filtrarPedidos con estadoFiltro="saldo-pendiente" filtra correctamente', () => {
  const { filtrarPedidos } = ordersModule;
  const sample = [
    { id: '1', customer: { name: 'Ana' }, status: 'Pendiente', payment: { total: 10000, depositAmount: 0 } },
    { id: '2', customer: { name: 'Beto' }, status: 'Listo', payment: { total: 20000, depositAmount: 20000, status: 'Pagado total' } }
  ];
  const result = filtrarPedidos(sample, { estadoFiltro: 'saldo-pendiente' });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, '1');
});
