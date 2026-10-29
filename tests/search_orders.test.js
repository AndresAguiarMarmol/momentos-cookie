const test = require('node:test');
const assert = require('node:assert/strict');
const {
  filtrarPedidos
} = require('../assets/js/orders.js');
const {
  renderOrderCardHtml
} = require('../assets/js/ui.js');

test('Filtrado combinado de búsqueda por texto y estado de pedido', () => {
  const pedidos = [
    {
      id: 'MC-20261028-001',
      customer: { name: 'Valentina Soto', phone: '+56988887777' },
      status: 'Pendiente',
      dates: { deliveryDate: '2026-10-30' },
      orderType: 'individual',
      details: { flavor: 'Limón y Lavanda', quantity: 12 },
      payment: { total: 15000, status: 'Pendiente' }
    },
    {
      id: 'MC-20261028-002',
      customer: { name: 'Valentina Morales', phone: '+56911112222' },
      status: 'Listo para entrega',
      dates: { deliveryDate: '2026-10-29' },
      orderType: 'combo',
      details: { comboName: 'Kit Especial Cumpleaños', quantity: 1 },
      payment: { total: 20000, status: 'Pagado total' }
    },
    {
      id: 'MC-20261028-003',
      customer: { name: 'Gonzalo Araya', phone: '+56933334444' },
      status: 'Entregado',
      dates: { deliveryDate: '2026-10-27' },
      orderType: 'individual',
      details: { flavor: 'Chispas de Chocolate', quantity: 24 },
      payment: { total: 24000, status: 'Pagado total' }
    }
  ];

  // Búsqueda por texto solo
  const resultadoTexto = filtrarPedidos(pedidos, { textoBusqueda: 'valentina', estadoFiltro: 'todos' });
  assert.equal(resultadoTexto.length, 2);

  // Búsqueda por texto + filtro de estado coincidente
  const resultadoAmbos = filtrarPedidos(pedidos, { textoBusqueda: 'valentina', estadoFiltro: 'Listo para entrega' });
  assert.equal(resultadoAmbos.length, 1);
  assert.equal(resultadoAmbos[0].id, 'MC-20261028-002');

  // Búsqueda por teléfono
  const resultadoTel = filtrarPedidos(pedidos, { textoBusqueda: '33334444' });
  assert.equal(resultadoTel.length, 1);
  assert.equal(resultadoTel[0].customer.name, 'Gonzalo Araya');

  // Búsqueda por código de orden
  const resultadoCod = filtrarPedidos(pedidos, { textoBusqueda: '003' });
  assert.equal(resultadoCod.length, 1);
  assert.equal(resultadoCod[0].id, 'MC-20261028-003');
});

test('Detalle de pedido genera modal con información completa y enlace a WhatsApp', () => {
  const pedido = {
    id: 'MC-TEST-MODAL',
    customer: { name: 'Paula Medina', phone: '+56977778888', email: 'paula@test.com' },
    status: 'Listo para entrega',
    dates: { createdAt: '2026-10-28T10:00:00Z', deliveryDate: '2026-10-29', deliveryTime: '17:00' },
    orderType: 'combo',
    details: { comboName: 'Kit Dulce Fiesta', packaging: 'Lata metálica de lujo', hasPaintKit: true, quantity: 1, unitPrice: 18000, subtotal: 18000 },
    notes: 'Alergia al maní',
    payment: { total: 18000, status: 'Abono/Seña', depositAmount: 10000 }
  };

  const cardHtml = renderOrderCardHtml(pedido);
  assert.match(cardHtml, /wa\.me\/56977778888/);
  assert.match(cardHtml, /MC-TEST-MODAL/);
  assert.match(cardHtml, /data-action=["']edit["']/);
  assert.match(cardHtml, /data-action=["']delete["']/);
});

