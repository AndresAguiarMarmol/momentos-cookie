const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const Orders = require('../assets/js/orders.js');

test('T1.1: consolidarPedidosPorClienteYFecha une dos órdenes del mismo cliente y fecha', () => {
  const pedidos = [
    {
      id: 'MC-1',
      customer: { name: 'Constanza Blest Gana', phone: '982325250' },
      dates: { deliveryDate: '2026-10-29', deliveryTime: '15:00' },
      orderType: 'combo',
      items: [
        { id: 'item-1', type: 'combo', comboName: 'Caja Truco o Trato', quantity: 1, unitPrice: 18990, subtotal: 18990, cookiesCount: 25 }
      ],
      payment: { total: 18990, depositAmount: 18990, status: 'Pagado total' },
      status: 'Pendiente'
    },
    {
      id: 'MC-2',
      customer: { name: 'CONSTANZA BLEST GANA', phone: '982325250' },
      dates: { deliveryDate: '2026-10-29', deliveryTime: '15:00' },
      orderType: 'combo',
      items: [
        { id: 'item-1', type: 'combo', comboName: 'Bolsas Boo', quantity: 1, unitPrice: 3490, subtotal: 3490, cookiesCount: 4 }
      ],
      payment: { total: 3490, depositAmount: 0, status: 'Pendiente' },
      status: 'Pendiente'
    }
  ];

  const consolidados = Orders.consolidarPedidosPorClienteYFecha(pedidos);
  assert.equal(consolidados.length, 1);
  const orden = consolidados[0];
  assert.equal(orden.items.length, 2);
  assert.equal(orden.payment.total, 22480);
  assert.equal(orden.payment.depositAmount, 18990);
  assert.equal(orden.payment.status, 'Abono/Seña');
});

test('T1.2: consolidarPedidosPorClienteYFecha no altera pedidos que son únicos', () => {
  const pedidos = [
    {
      id: 'MC-UNICO-1',
      customer: { name: 'Sandra Vergara', phone: '+56998170998' },
      dates: { deliveryDate: '2026-10-30', deliveryTime: '15:00' },
      orderType: 'combo',
      items: [
        { id: 'item-1', type: 'combo', comboName: 'Box Caldero Magico', quantity: 1, unitPrice: 10990, subtotal: 10990 }
      ],
      payment: { total: 10990, depositAmount: 0, status: 'Pendiente' },
      status: 'En producción'
    }
  ];

  const consolidados = Orders.consolidarPedidosPorClienteYFecha(pedidos);
  assert.equal(consolidados.length, 1);
  assert.equal(consolidados[0].id, 'MC-UNICO-1');
  assert.equal(consolidados[0].payment.total, 10990);
});

test('T1.3: consolidar pedidos es idempotente y preserva el balance contable exacto', () => {
  let jsonPath = path.join(__dirname, '..', 'recuperado_pedidos.json');
  let raw = fs.readFileSync(jsonPath, 'utf8');
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  const pedidosConsolidados = JSON.parse(raw);

  assert.equal(pedidosConsolidados.length, 11, 'El archivo recuperado_pedidos.json debe contener exactamente 11 pedidos consolidados');

  const totalDinero = pedidosConsolidados.reduce((acc, p) => acc + (p.payment?.total || 0), 0);
  const totalAbonado = pedidosConsolidados.reduce((acc, p) => acc + (p.payment?.depositAmount || 0), 0);

  // Idempotencia: volver a consolidar no debe alterar montos ni cantidad
  const reconsolidados = Orders.consolidarPedidosPorClienteYFecha(pedidosConsolidados);
  assert.equal(reconsolidados.length, 11, 'Volver a consolidar debe mantener exactamente 11 pedidos');

  const totalDineroReconsolidado = reconsolidados.reduce((acc, p) => acc + (p.payment?.total || 0), 0);
  const totalAbonadoReconsolidado = reconsolidados.reduce((acc, p) => acc + (p.payment?.depositAmount || 0), 0);

  assert.equal(totalDineroReconsolidado, totalDinero, 'El total facturado debe ser idéntico al peso');
  assert.equal(totalAbonadoReconsolidado, totalAbonado, 'El total cobrado debe ser idéntico al peso');
});

test('T2.1: consolidateCurrentOrders en StorageService consolida pedidos duplicados', () => {
  const { createStorageService } = require('../assets/js/storage.js');
  let store = {};
  const mockStorage = {
    getItem(k) { return store[k] || null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; },
    clear() { store = {}; }
  };

  const service = createStorageService({ storage: mockStorage });
  // Simular dos pedidos duplicados del mismo cliente y fecha
  service.saveOrder({
    id: 'MC-DUP-1',
    customer: { name: 'Cliente Duplicado' },
    dates: { deliveryDate: '2026-10-31' },
    orderType: 'individual',
    details: { flavor: 'Limón', quantity: 10, unitPrice: 1000, subtotal: 10000 },
    payment: { total: 10000, depositAmount: 0 }
  });
  service.saveOrder({
    id: 'MC-DUP-2',
    customer: { name: 'Cliente Duplicado' },
    dates: { deliveryDate: '2026-10-31' },
    orderType: 'combo',
    details: { comboName: 'Kit Especial', quantity: 1, unitPrice: 15000, subtotal: 15000 },
    payment: { total: 15000, depositAmount: 5000 }
  });

  const antes = service.getOrders();
  assert.equal(antes.length, 6); // 4 seed orders iniciales + 2 guardados

  const consolidados = service.consolidateCurrentOrders();
  assert.equal(consolidados.length, 5); // 4 seed + 1 orden consolidada
  const dup = consolidados.find(o => o.customer.name === 'Cliente Duplicado');
  assert.ok(dup);
  assert.equal(dup.items.length, 2);
  assert.equal(dup.payment.total, 25000);
  assert.equal(dup.payment.depositAmount, 5000);
});

