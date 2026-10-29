const test = require('node:test');
const assert = require('node:assert/strict');
const {
  extractOrderFromInputs,
  validateOrderInput
} = require('../assets/js/ui.js');

test('Validación de campos obligatorios en el formulario', () => {
  // Sin nombre
  const sinNombre = validateOrderInput({ customerName: '', phone: '12345678', deliveryDate: '2026-11-01' });
  assert.equal(sinNombre.valid, false);
  assert.ok(sinNombre.error.includes('nombre'));

  // Sin teléfono
  const sinTelefono = validateOrderInput({ customerName: 'María', phone: '', deliveryDate: '2026-11-01' });
  assert.equal(sinTelefono.valid, false);
  assert.ok(sinTelefono.error.includes('teléfono'));

  // Sin fecha
  const sinFecha = validateOrderInput({ customerName: 'María', phone: '12345678', deliveryDate: '' });
  assert.equal(sinFecha.valid, false);
  assert.ok(sinFecha.error.includes('fecha'));

  // Válido
  const valido = validateOrderInput({ customerName: 'María', phone: '12345678', deliveryDate: '2026-11-01' });
  assert.equal(valido.valid, true);
  assert.equal(valido.error, null);
});

test('Extracción y cálculo correcto para pedido tipo Galletas Individuales', () => {
  const inputs = {
    orderId: 'MC-TEST-IND',
    customerName: 'Andrés Pérez',
    customerPhone: '+56 9 1234 5678',
    customerEmail: 'andres@ejemplo.com',
    deliveryDate: '2026-10-30',
    deliveryTime: '16:00',
    orderType: 'individual',
    individualFlavor: 'Glaseado Vainilla Real',
    individualQuantity: 10,
    individualPrice: 1500,
    notes: 'Temática estrellas',
    orderStatus: 'Pendiente',
    paymentStatus: 'Abono/Seña',
    depositAmount: 5000
  };

  const order = extractOrderFromInputs(inputs);

  assert.equal(order.id, 'MC-TEST-IND');
  assert.equal(order.customer.name, 'Andrés Pérez');
  assert.equal(order.orderType, 'individual');
  assert.equal(order.details.flavor, 'Glaseado Vainilla Real');
  assert.equal(order.details.quantity, 10);
  assert.equal(order.details.unitPrice, 1500);
  assert.equal(order.details.subtotal, 15000);
  assert.equal(order.payment.total, 15000);
  assert.equal(order.payment.depositAmount, 5000);
  assert.equal(order.payment.status, 'Abono/Seña');
});

test('Extracción y cálculo correcto para pedido tipo Combo / Kit Especial', () => {
  const inputs = {
    orderId: 'MC-TEST-COMBO',
    customerName: 'Laura Silva',
    customerPhone: '987654321',
    customerEmail: '',
    deliveryDate: '2026-11-05',
    deliveryTime: '11:30',
    orderType: 'combo',
    comboName: 'Kit Pintura Dulce Fiesta',
    comboCookiesCount: 8,
    comboPackaging: 'Caja con ventana transparente',
    comboHasPaintKit: true,
    comboQuantity: 2,
    comboPrice: 16000,
    notes: 'Pinturas comestibles no tóxicas',
    orderStatus: 'En producción',
    paymentStatus: 'Pagado total',
    depositAmount: 0
  };

  const order = extractOrderFromInputs(inputs);

  assert.equal(order.id, 'MC-TEST-COMBO');
  assert.equal(order.orderType, 'combo');
  assert.equal(order.details.comboName, 'Kit Pintura Dulce Fiesta');
  assert.equal(order.details.cookiesCount, 8);
  assert.equal(order.details.packaging, 'Caja con ventana transparente');
  assert.equal(order.details.hasPaintKit, true);
  assert.equal(order.details.quantity, 2);
  assert.equal(order.details.unitPrice, 16000);
  assert.equal(order.details.subtotal, 32000);
  assert.equal(order.payment.total, 32000);
  assert.equal(order.payment.depositAmount, 32000);
  assert.equal(order.payment.status, 'Pagado total');
});

