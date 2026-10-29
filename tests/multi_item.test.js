const test = require('node:test');
const assert = require('node:assert/strict');
const Orders = require('../assets/js/orders.js');

test('T1.1: normalizeOrder convierte pedidos legacy en pedidos con colección de items', () => {
  const legacyIndividual = {
    id: 'MC-LEGACY-001',
    customer: { name: 'Juan Pérez' },
    orderType: 'individual',
    details: {
      flavor: 'Vainilla Real',
      quantity: 12,
      unitPrice: 1500,
      subtotal: 18000
    },
    payment: { total: 18000 }
  };

  const normalized = Orders.normalizeOrder(legacyIndividual);
  assert.ok(Array.isArray(normalized.items));
  assert.equal(normalized.items.length, 1);
  assert.equal(normalized.items[0].type, 'individual');
  assert.equal(normalized.items[0].flavor, 'Vainilla Real');
  assert.equal(normalized.items[0].quantity, 12);
  assert.equal(normalized.items[0].unitPrice, 1500);
  assert.equal(normalized.items[0].subtotal, 18000);
});

test('T1.2: normalizeOrder respeta y preserva pedidos que ya tienen colección de items', () => {
  const multiOrder = {
    id: 'MC-MULTI-001',
    items: [
      { id: 'item-1', type: 'individual', flavor: 'Limón', quantity: 6, unitPrice: 1500, subtotal: 9000 },
      { id: 'item-2', type: 'combo', comboName: 'Kit Dulce', cookiesCount: 6, hasPaintKit: true, quantity: 1, unitPrice: 12000, subtotal: 12000 }
    ],
    payment: { total: 21000 }
  };

  const normalized = Orders.normalizeOrder(multiOrder);
  assert.equal(normalized.items.length, 2);
  assert.equal(normalized.items[0].flavor, 'Limón');
  assert.equal(normalized.items[1].comboName, 'Kit Dulce');
});

test('T1.3: calcularTotalesPedido calcula subtotales, gran total y cantidad de galletas a hornear', () => {
  const items = [
    { type: 'individual', flavor: 'Vainilla', quantity: 10, unitPrice: 1500 }, // subtotal 15.000, 10 galletas
    { type: 'combo', comboName: 'Kit Fiesta', cookiesCount: 8, quantity: 2, unitPrice: 14000 } // subtotal 28.000, 16 galletas
  ];

  const resultado = Orders.calcularTotalesPedido(items, 15000, 'Abono/Seña');
  assert.equal(resultado.total, 43000);
  assert.equal(resultado.totalGalletas, 26);
  assert.equal(resultado.abono, 15000);
  assert.equal(resultado.saldo, 28000);
});

test('T1.4: formatearResumenItems produce una descripción legible para tarjetas', () => {
  const order = {
    items: [
      { type: 'individual', flavor: 'Chocolate Chispas', quantity: 6 },
      { type: 'combo', comboName: 'Kit Mini Chef', cookiesCount: 4, quantity: 2 }
    ]
  };

  const resumen = Orders.formatearResumenItems(order);
  assert.ok(resumen.includes('2 ítems'));
  assert.ok(resumen.includes('14 galletas'));
  assert.ok(resumen.includes('Chocolate Chispas'));
  assert.ok(resumen.includes('Kit Mini Chef'));
});

test('T2.1: Storage persiste y recupera pedidos multi-ítem', () => {
  const { createStorageService } = require('../assets/js/storage.js');
  let store = {};
  const mockStorage = {
    getItem(k) { return store[k] || null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; },
    clear() { store = {}; }
  };

  const service = createStorageService({ storage: mockStorage });
  const multiOrder = {
    id: 'MC-TEST-MULTI',
    customer: { name: 'Cliente Multi' },
    dates: { deliveryDate: '2026-10-31', deliveryTime: '18:00' },
    orderType: 'mixto',
    items: [
      { id: 'item-1', type: 'individual', flavor: 'Vainilla', quantity: 12, unitPrice: 1500, subtotal: 18000 },
      { id: 'item-2', type: 'combo', comboName: 'Kit Halloween', cookiesCount: 6, hasPaintKit: true, quantity: 2, unitPrice: 12000, subtotal: 24000 }
    ],
    details: { flavor: 'Vainilla', quantity: 12, unitPrice: 1500, subtotal: 18000 },
    payment: { total: 42000, status: 'Pagado total', depositAmount: 42000 }
  };

  service.saveOrder(multiOrder);
  const recuperado = service.getOrderById('MC-TEST-MULTI');
  assert.equal(recuperado.items.length, 2);
  assert.equal(recuperado.items[1].comboName, 'Kit Halloween');
  assert.equal(recuperado.payment.total, 42000);
});

test('T3.1: consolidarProduccion procesa pedidos multi-ítem sumando galletas individuales y combos', () => {
  const { consolidarProduccion } = require('../assets/js/production.js');
  const pedidos = [
    {
      id: 'MC-PROD-MULTI',
      status: 'En producción',
      dates: { deliveryDate: '2026-10-30' },
      items: [
        { type: 'individual', flavor: 'Vainilla Real', quantity: 12 },
        { type: 'combo', comboName: 'Kit Calaveritas', cookiesCount: 6, quantity: 2, hasPaintKit: true, packaging: 'Caja Regalo' },
        { type: 'individual', flavor: 'Vainilla Real', quantity: 8 }
      ]
    }
  ];

  const resultado = consolidarProduccion(pedidos);
  assert.equal(resultado.totalGalletas, 32); // 12 + (2*6) + 8 = 32
  assert.equal(resultado.sabores['Vainilla Real'], 20); // 12 + 8 = 20
  assert.equal(resultado.combos['Kit Calaveritas'], 2);
  assert.equal(resultado.totalKitsPintura, 2);
  assert.equal(resultado.empaques['Caja Regalo'], 2);
});

test('T3.2: generarTicketEntregaHtml desglosa todos los ítems en el comprobante', () => {
  const { generarTicketEntregaHtml } = require('../assets/js/receipt.js');
  const multiOrder = {
    id: 'MC-TICKET-MULTI',
    customer: { name: 'Camila Rojas', phone: '+56911223344' },
    dates: { deliveryDate: '2026-11-02' },
    items: [
      { type: 'individual', flavor: 'Canela Dulce', quantity: 6, unitPrice: 1500, subtotal: 9000 },
      { type: 'combo', comboName: 'Kit Galletas Princesa', cookiesCount: 6, quantity: 1, hasPaintKit: true, packaging: 'Caja Rosa', unitPrice: 15000, subtotal: 15000 }
    ],
    payment: { total: 24000, depositAmount: 10000, status: 'Abono/Seña' }
  };

  const html = generarTicketEntregaHtml(multiOrder);
  assert.match(html, /Canela Dulce/);
  assert.match(html, /Kit Galletas Princesa/);
  assert.match(html, /9\.000/);
  assert.match(html, /15\.000/);
});

test('T4.1: extractOrderFromInputs procesa múltiples ítems y calcula el gran total', () => {
  const { extractOrderFromInputs } = require('../assets/js/ui.js');
  const inputs = {
    orderId: 'MC-MULTI-FORM-1',
    customerName: 'Beatriz Silva',
    customerPhone: '+56 9 7777 8888',
    deliveryDate: '2026-11-04',
    deliveryTime: '17:00',
    items: [
      {
        id: 'item-1',
        type: 'individual',
        flavor: 'Vainilla Glaseada',
        quantity: 10,
        unitPrice: 1200
      },
      {
        id: 'item-2',
        type: 'combo',
        comboName: 'Kit Halloween Boo',
        cookiesCount: 6,
        packaging: 'Caja con cinta',
        hasPaintKit: true,
        quantity: 2,
        unitPrice: 15000
      }
    ],
    orderStatus: 'Pendiente',
    paymentStatus: 'Abono/Seña',
    depositAmount: 20000
  };

  const order = extractOrderFromInputs(inputs);
  assert.equal(order.id, 'MC-MULTI-FORM-1');
  assert.equal(order.orderType, 'mixto');
  assert.equal(order.items.length, 2);
  assert.equal(order.items[0].subtotal, 12000);
  assert.equal(order.items[1].subtotal, 30000);
  assert.equal(order.payment.total, 42000);
  assert.equal(order.payment.depositAmount, 20000);
});



