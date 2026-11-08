const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  agruparPedidosPorPeriodo,
  ordenarPedidosPorFecha
} = require('../assets/js/orders.js');

const {
  renderAllOrdersView
} = require('../assets/js/ui.js');

test('T1.1: agruparPedidosPorPeriodo clasifica pedidos en periodoActual, proximos y anteriores', () => {
  // Fecha de referencia fija: 08 de Noviembre de 2026
  const fechaRef = new Date(2026, 10, 8); // Mes 10 = Noviembre (0-indexed)

  const pedidos = [
    {
      id: 'PED-ANT-1',
      customer: { name: 'Sandra Vergara', phone: '+56911111111' },
      dates: { deliveryDate: '2026-10-29', deliveryTime: '15:00' },
      status: 'Entregado',
      payment: { total: 20000, status: 'Pagado total' }
    },
    {
      id: 'PED-ACT-1',
      customer: { name: 'Isabel Aranda', phone: '+56922222222' },
      dates: { deliveryDate: '2026-11-15', deliveryTime: '11:00' },
      status: 'Pendiente',
      payment: { total: 35000, status: 'Abono/Seña', depositAmount: 15000 }
    },
    {
      id: 'PED-ACT-2',
      customer: { name: 'Constanza Blest', phone: '+56933333333' },
      dates: { deliveryDate: '2026-11-03', deliveryTime: '18:00' },
      status: 'En producción',
      payment: { total: 18000, status: 'Pendiente' }
    },
    {
      id: 'PED-PROX-1',
      customer: { name: 'Alejandra Olea', phone: '+56944444444' },
      dates: { deliveryDate: '2026-12-24', deliveryTime: '10:00' },
      status: 'Pendiente',
      payment: { total: 50000, status: 'Pendiente' }
    }
  ];

  const resultado = agruparPedidosPorPeriodo(pedidos, fechaRef);

  assert.equal(resultado.currentPeriodKey, '2026-11');
  assert.equal(resultado.periodoNombre, 'Noviembre 2026');

  // Período Actual: 2 pedidos (ordenados por fecha ascendente: el del 03-11 antes que el del 15-11)
  assert.equal(resultado.periodoActual.length, 2);
  assert.equal(resultado.periodoActual[0].id, 'PED-ACT-2', 'El pedido del 03 de noviembre debe ir antes que el del 15');
  assert.equal(resultado.periodoActual[1].id, 'PED-ACT-1');

  // Próximos Períodos: 1 pedido (Diciembre 2026)
  assert.equal(resultado.proximos.length, 1);
  assert.equal(resultado.proximos[0].id, 'PED-PROX-1');

  // Períodos Anteriores: 1 pedido (Octubre 2026)
  assert.equal(resultado.anteriores.length, 1);
  assert.equal(resultado.anteriores[0].id, 'PED-ANT-1');
});

test('T1.2: agruparPedidosPorPeriodo gestiona pedidos sin fecha de entrega usando createdAt como fallback', () => {
  const fechaRef = new Date(2026, 10, 8); // Noviembre 2026

  const pedidos = [
    {
      id: 'PED-NO-DATE',
      customer: { name: 'Cliente Sin Fecha' },
      dates: { createdAt: '2026-11-01T12:00:00.000Z' },
      status: 'Pendiente',
      payment: { total: 10000 }
    },
    {
      id: 'PED-TOTAL-EMPTY',
      customer: { name: 'Cliente Vacío' },
      status: 'Pendiente',
      payment: { total: 5000 }
    }
  ];

  const resultado = agruparPedidosPorPeriodo(pedidos, fechaRef);
  assert.equal(resultado.periodoActual.length, 2, 'Los pedidos sin deliveryDate explícita deben agruparse en el período actual');
});

test('T1.3: agruparPedidosPorPeriodo es tolerante a entradas vacías o nulas', () => {
  const resultadoVacio = agruparPedidosPorPeriodo([]);
  assert.deepEqual(resultadoVacio.periodoActual, []);
  assert.deepEqual(resultadoVacio.proximos, []);
  assert.deepEqual(resultadoVacio.anteriores, []);
  assert.ok(resultadoVacio.periodoNombre.length > 0);

  const resultadoNulo = agruparPedidosPorPeriodo(null);
  assert.deepEqual(resultadoNulo.periodoActual, []);
  assert.deepEqual(resultadoNulo.proximos, []);
  assert.deepEqual(resultadoNulo.anteriores, []);
});

test('T2.1: renderAllOrdersView estructura los pedidos en bloques con prioridad en el período actual', () => {
  // Mock de DOM básico
  let containerHtml = '';
  let countBadgeText = '';
  let emptyStateHidden = false;

  const mockContainer = {
    set innerHTML(val) { containerHtml = val; },
    get innerHTML() { return containerHtml; }
  };

  const mockCountBadge = {
    set textContent(val) { countBadgeText = val; },
    get textContent() { return countBadgeText; }
  };

  const mockEmptyState = {
    classList: {
      add(cls) { if (cls === 'hidden') emptyStateHidden = true; },
      remove(cls) { if (cls === 'hidden') emptyStateHidden = false; }
    }
  };

  const originalDocument = global.document;
  global.document = {
    getElementById(id) {
      if (id === 'all-orders-container') return mockContainer;
      if (id === 'orders-empty-state') return mockEmptyState;
      if (id === 'orders-count-badge') return mockCountBadge;
      if (id === 'search-input') return { value: '' };
      return null;
    },
    querySelector() { return null; }
  };

  const pedidos = [
    {
      id: 'MC-202611-001',
      customer: { name: 'Cliente Noviembre', phone: '+56911112222' },
      dates: { deliveryDate: '2026-11-10', deliveryTime: '12:00' },
      status: 'Pendiente',
      payment: { total: 25000, status: 'Pendiente' },
      items: [{ type: 'individual', flavor: 'Vainilla', quantity: 12, subtotal: 25000 }]
    },
    {
      id: 'MC-202610-001',
      customer: { name: 'Cliente Octubre', phone: '+56933334444' },
      dates: { deliveryDate: '2026-10-30', deliveryTime: '16:00' },
      status: 'Entregado',
      payment: { total: 18000, status: 'Pagado total' },
      items: [{ type: 'combo', comboName: 'Kit Especial', quantity: 1, subtotal: 18000 }]
    }
  ];

  const fechaRef = new Date(2026, 10, 5); // Noviembre 2026
  renderAllOrdersView(pedidos, { hoy: fechaRef });

  // Verificaciones del renderizado por bloques
  assert.equal(emptyStateHidden, true, 'El estado vacío debe ocultarse');
  assert.match(containerHtml, /period-current/, 'Debe contener el bloque del período actual');
  assert.match(containerHtml, /Prioridad Actual/, 'El bloque actual debe exhibir la insignia Prioridad Actual');
  assert.match(containerHtml, /Noviembre 2026/, 'Debe mostrar el nombre del período actual');
  assert.match(containerHtml, /MC-202611-001/, 'La orden de noviembre debe estar en el HTML');

  assert.match(containerHtml, /period-history/, 'Debe contener el bloque de períodos anteriores');
  assert.match(containerHtml, /Períodos Anteriores/, 'Debe titular la sección histórica');
  assert.match(containerHtml, /MC-202610-001/, 'La orden de octubre debe estar en el bloque histórico');

  // Restaurar document global
  global.document = originalDocument;
});

test('T2.2: renderAllOrdersView muestra el estado vacío si la lista de pedidos está vacía', () => {
  let emptyStateHidden = true;

  const mockContainer = { innerHTML: '' };
  const mockCountBadge = { textContent: '' };
  const mockEmptyState = {
    classList: {
      add(cls) { if (cls === 'hidden') emptyStateHidden = true; },
      remove(cls) { if (cls === 'hidden') emptyStateHidden = false; }
    }
  };

  const originalDocument = global.document;
  global.document = {
    getElementById(id) {
      if (id === 'all-orders-container') return mockContainer;
      if (id === 'orders-empty-state') return mockEmptyState;
      if (id === 'orders-count-badge') return mockCountBadge;
      if (id === 'search-input') return { value: '' };
      return null;
    },
    querySelector() { return null; }
  };

  renderAllOrdersView([], {});

  assert.equal(emptyStateHidden, false, 'El estado vacío debe removerse de hidden');
  assert.equal(mockContainer.innerHTML, '');

  global.document = originalDocument;
});

