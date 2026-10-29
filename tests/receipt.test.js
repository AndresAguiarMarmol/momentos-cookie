const test = require('node:test');
const assert = require('node:assert/strict');
const {
  generarTicketEntregaHtml,
  formatearResumenPagoTicket
} = require('../assets/js/receipt.js');

test('Generación de ticket de entrega completo', () => {
  const order = {
    id: 'MC-20261028-001',
    customer: { name: 'Valentina Silva', phone: '+56 9 8888 7777' },
    dates: { deliveryDate: '2026-10-30', deliveryTime: '16:00' },
    orderType: 'combo',
    details: {
      comboName: 'Kit Dulce Halloween',
      quantity: 2,
      cookiesCount: 6,
      packaging: 'Caja decorativa con ventana',
      hasPaintKit: true
    },
    notes: 'Temática de calabazas. Sin nueces por alergia.',
    payment: { total: 24000, depositAmount: 10000, status: 'Abono/Seña' },
    status: 'Listo para entrega'
  };

  const settings = {
    businessName: 'Momentos Cookie Taller',
    phone: '+56 9 1234 5678',
    footerMessage: '¡Gracias por endulzar tu vida con nosotros!',
    currencySymbol: '$'
  };

  const html = generarTicketEntregaHtml(order, settings);

  assert.match(html, /Momentos Cookie Taller/, 'Debe incluir el nombre del negocio');
  assert.match(html, /\+56 9 1234 5678/, 'Debe incluir el teléfono del negocio');
  assert.match(html, /MC-20261028-001/, 'Debe incluir el código del pedido');
  assert.match(html, /Valentina Silva/, 'Debe incluir el nombre del cliente');
  assert.match(html, /Kit Dulce Halloween/, 'Debe incluir el nombre del combo');
  assert.match(html, /Kit de pintura comestible/i, 'Debe incluir el kit de pintura');
  assert.match(html, /Sin nueces por alergia/, 'Debe destacar las notas de alergia');
  assert.match(html, /SALDO POR COBRAR/, 'Debe indicar el saldo por cobrar');
  assert.match(html, /Gracias por endulzar tu vida/, 'Debe incluir el mensaje de agradecimiento');
});

test('Comprobante con pago 100% completado muestra distintivo especial', () => {
  const order = {
    id: 'MC-20261028-002',
    customer: { name: 'Carlos Díaz', phone: '911112222' },
    dates: { deliveryDate: '2026-10-29' },
    orderType: 'individual',
    details: { flavor: 'Vainilla Glaseada', quantity: 12 },
    payment: { total: 15000, depositAmount: 15000, status: 'Pagado total' }
  };

  const html = generarTicketEntregaHtml(order);

  assert.match(html, /PAGADO AL 100%/i, 'Debe indicar pago completado');
  assert.doesNotMatch(html, /SALDO POR COBRAR:/i, 'No debe exigir saldo por cobrar');
});

test('Comprobante omite sección de notas cuando están vacías', () => {
  const order = {
    id: 'MC-20261028-003',
    customer: { name: 'Luis Vera' },
    dates: { deliveryDate: '2026-10-29' },
    orderType: 'individual',
    details: { flavor: 'Chocolate', quantity: 6 },
    payment: { total: 8000, depositAmount: 0 },
    notes: ''
  };

  const html = generarTicketEntregaHtml(order);
  assert.doesNotMatch(html, /Notas de diseño:/i, 'No debe mostrar bloque de notas vacío');
});

