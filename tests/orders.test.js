const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calcularSubtotal,
  calcularSaldoPendiente,
  clasificarPedidoPorUrgencia,
  ordenarPedidosPorFecha,
  agruparPedidosPorSemaforo,
  filtrarPedidos,
  generarIdPedido,
  construirEnlaceWhatsApp,
  formatearMoneda
} = require('../assets/js/orders.js');

test('Cálculo de subtotales', () => {
  assert.equal(calcularSubtotal(5, 1200), 6000);
  assert.equal(calcularSubtotal(0, 1500), 0);
  assert.equal(calcularSubtotal(-3, 1000), 0, 'Cantidades negativas deben normalizarse a 0');
  assert.equal(calcularSubtotal(2, -500), 0, 'Precios negativos deben normalizarse a 0');
});

test('Cálculo de saldos y abonos', () => {
  // Pagado total
  const pagoCompleto = calcularSaldoPendiente(20000, 0, 'Pagado total');
  assert.deepEqual(pagoCompleto, { total: 20000, abono: 20000, saldo: 0 });

  // Abono parcial
  const conAbono = calcularSaldoPendiente(20000, 8000, 'Abono/Seña');
  assert.deepEqual(conAbono, { total: 20000, abono: 8000, saldo: 12000 });

  // Abono mayor al total (caso límite CL-04)
  const abonoExcesivo = calcularSaldoPendiente(20000, 25000, 'Abono/Seña');
  assert.deepEqual(abonoExcesivo, { total: 20000, abono: 20000, saldo: 0 });

  // Pendiente sin abono
  const pendiente = calcularSaldoPendiente(20000, 5000, 'Pendiente');
  assert.deepEqual(pendiente, { total: 20000, abono: 0, saldo: 20000 });
});

test('Clasificación por semáforo de urgencia con fecha inyectada', () => {
  const hoy = new Date(2026, 9, 28, 10, 0, 0); // 28 Oct 2026, 10:00:00 local

  // Pedidos finalizados no son urgentes
  assert.equal(
    clasificarPedidoPorUrgencia('2026-10-20', '12:00', 'Entregado', hoy),
    'finalizado'
  );
  assert.equal(
    clasificarPedidoPorUrgencia('2026-10-20', '12:00', 'Cancelado', hoy),
    'finalizado'
  );

  // Pedido con fecha pasada (atrasado)
  assert.equal(
    clasificarPedidoPorUrgencia('2026-10-27', '18:00', 'En producción', hoy),
    'atrasado'
  );

  // Pedido hoy a una hora pasada (atrasado CL-01)
  assert.equal(
    clasificarPedidoPorUrgencia('2026-10-28', '08:00', 'Pendiente', hoy),
    'atrasado'
  );

  // Pedido hoy dentro de las próximas horas (urgente_hoy)
  assert.equal(
    clasificarPedidoPorUrgencia('2026-10-28', '16:00', 'Pendiente', hoy),
    'urgente_hoy'
  );

  // Pedido dentro de las próximas 24 horas (urgente_hoy)
  assert.equal(
    clasificarPedidoPorUrgencia('2026-10-29', '09:00', 'En producción', hoy),
    'urgente_hoy'
  );

  // Pedido esta semana (más de 24h pero menos de 7 días)
  assert.equal(
    clasificarPedidoPorUrgencia('2026-11-01', '14:00', 'Pendiente', hoy),
    'esta_semana'
  );

  // Pedido próximas semanas (más de 7 días)
  assert.equal(
    clasificarPedidoPorUrgencia('2026-11-15', '12:00', 'Pendiente', hoy),
    'proximas'
  );
});

test('Ordenamiento cronológico ascendente de pedidos', () => {
  const pedidos = [
    { id: '1', dates: { deliveryDate: '2026-11-05', deliveryTime: '12:00' } },
    { id: '2', dates: { deliveryDate: '2026-10-29', deliveryTime: '15:00' } },
    { id: '3', dates: { deliveryDate: '2026-10-29', deliveryTime: '10:00' } },
    { id: '4', dates: { deliveryDate: '2026-10-28', deliveryTime: '18:00' } }
  ];

  const ordenados = ordenarPedidosPorFecha(pedidos);
  assert.deepEqual(ordenados.map(p => p.id), ['4', '3', '2', '1']);
});

test('Agrupación en bloques de semáforo', () => {
  const hoy = new Date(2026, 9, 28, 10, 0, 0);
  const pedidos = [
    { id: 'A', status: 'Pendiente', dates: { deliveryDate: '2026-10-25', deliveryTime: '12:00' } },
    { id: 'B', status: 'En producción', dates: { deliveryDate: '2026-10-28', deliveryTime: '15:00' } },
    { id: 'C', status: 'Listo para entrega', dates: { deliveryDate: '2026-10-31', deliveryTime: '10:00' } },
    { id: 'D', status: 'Pendiente', dates: { deliveryDate: '2026-11-20', deliveryTime: '18:00' } },
    { id: 'E', status: 'Entregado', dates: { deliveryDate: '2026-10-20', deliveryTime: '12:00' } }
  ];

  const grupos = agruparPedidosPorSemaforo(pedidos, hoy);
  assert.deepEqual(grupos.atrasados.map(p => p.id), ['A']);
  assert.deepEqual(grupos.urgenteHoy.map(p => p.id), ['B']);
  assert.deepEqual(grupos.estaSemana.map(p => p.id), ['C']);
  assert.deepEqual(grupos.proximas.map(p => p.id), ['D']);
});

test('Búsqueda reactiva normalizada (insensible a tildes y mayúsculas)', () => {
  const pedidos = [
    { id: 'MC-001', customer: { name: 'María González', phone: '+56 9 1234 5678' } },
    { id: 'MC-002', customer: { name: 'Carlos Pérez', phone: '987654321' } }
  ];

  assert.equal(filtrarPedidos(pedidos, { textoBusqueda: 'maria' }).length, 1);
  assert.equal(filtrarPedidos(pedidos, { textoBusqueda: 'MARIA' }).length, 1);
  assert.equal(filtrarPedidos(pedidos, { textoBusqueda: 'gonzalez' }).length, 1);
  assert.equal(filtrarPedidos(pedidos, { textoBusqueda: '1234' }).length, 1);
  assert.equal(filtrarPedidos(pedidos, { textoBusqueda: 'MC-002' }).length, 1);
  assert.equal(filtrarPedidos(pedidos, { textoBusqueda: 'inexistente' }).length, 0);
});

test('Generación de ID de pedido y construcción de enlace WhatsApp', () => {
  const fechaFija = new Date(2026, 9, 28, 12, 0, 0);
  const id = generarIdPedido(1, fechaFija);
  assert.equal(id, 'MC-20261028-001');

  const enlace = construirEnlaceWhatsApp('+56 9 1234 5678', 'María González', 'MC-20261028-001', 'Listo para entrega');
  assert.ok(enlace.startsWith('https://wa.me/56912345678'));
  assert.ok(enlace.includes('MC-20261028-001'));
  assert.ok(enlace.includes('Listo'));
});

test('Formateo de moneda', () => {
  assert.equal(formatearMoneda(15000), '$15.000');
  assert.equal(formatearMoneda(0), '$0');
});
