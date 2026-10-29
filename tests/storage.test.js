const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createStorageService,
  INITIAL_SEED_ORDERS
} = require('../assets/js/storage.js');

// Mock simple de Storage para entorno Node.js
function createMockLocalStorage(initialStore = {}) {
  let store = { ...initialStore };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    }
  };
}

test('Inicialización con seed data cuando el almacenamiento está vacío', () => {
  const mockStorage = createMockLocalStorage();
  const service = createStorageService({ storage: mockStorage });

  const pedidos = service.getOrders();
  assert.ok(Array.isArray(pedidos), 'Debe retornar un array');
  assert.ok(pedidos.length >= 3, 'Debe precargar pedidos de muestra');
  assert.ok(pedidos.some(p => p.orderType === 'combo'), 'Debe incluir al menos un combo');
  assert.ok(pedidos.some(p => p.orderType === 'individual'), 'Debe incluir al menos un pedido individual');
});

test('Guardar un nuevo pedido y recuperarlo por ID', () => {
  const mockStorage = createMockLocalStorage();
  const service = createStorageService({ storage: mockStorage });

  const nuevoPedido = {
    id: 'MC-TEST-001',
    customer: { name: 'Lucía Torres', phone: '912345678' },
    dates: { deliveryDate: '2026-11-01', deliveryTime: '16:00' },
    orderType: 'individual',
    details: { flavor: 'Vainilla Glaseada', quantity: 12, unitPrice: 1500, subtotal: 18000 },
    status: 'Pendiente',
    payment: { total: 18000, status: 'Pendiente', depositAmount: 0 }
  };

  const guardado = service.saveOrder(nuevoPedido);
  assert.equal(guardado.id, 'MC-TEST-001');

  const recuperado = service.getOrderById('MC-TEST-001');
  assert.deepEqual(recuperado, nuevoPedido);
});

test('Actualizar un pedido existente', () => {
  const mockStorage = createMockLocalStorage();
  const service = createStorageService({ storage: mockStorage });

  const pedidoOriginal = {
    id: 'MC-TEST-002',
    customer: { name: 'Pedro Soto', phone: '99887766' },
    dates: { deliveryDate: '2026-10-30' },
    orderType: 'combo',
    status: 'Pendiente',
    payment: { total: 25000, status: 'Pendiente' }
  };
  service.saveOrder(pedidoOriginal);

  // Actualizar datos
  const modificado = {
    ...pedidoOriginal,
    status: 'En producción',
    notes: 'Agregar dedicatoria: Feliz Cumpleaños'
  };
  service.saveOrder(modificado);

  const actualizado = service.getOrderById('MC-TEST-002');
  assert.equal(actualizado.status, 'En producción');
  assert.equal(actualizado.notes, 'Agregar dedicatoria: Feliz Cumpleaños');
});

test('Actualizar estado rápido de pedido', () => {
  const mockStorage = createMockLocalStorage();
  const service = createStorageService({ storage: mockStorage });

  const pedido = {
    id: 'MC-TEST-003',
    customer: { name: 'Ana Gómez', phone: '944332211' },
    status: 'En producción'
  };
  service.saveOrder(pedido);

  service.updateOrderStatus('MC-TEST-003', 'Listo para entrega');
  assert.equal(service.getOrderById('MC-TEST-003').status, 'Listo para entrega');

  service.updateOrderStatus('MC-TEST-003', 'Entregado');
  assert.equal(service.getOrderById('MC-TEST-003').status, 'Entregado');
});

test('Eliminar un pedido por ID', () => {
  const mockStorage = createMockLocalStorage();
  const service = createStorageService({ storage: mockStorage });

  const pedido = { id: 'MC-TEST-BORRAR', customer: { name: 'Borrar' }, status: 'Cancelado' };
  service.saveOrder(pedido);
  assert.ok(service.getOrderById('MC-TEST-BORRAR'));

  const eliminado = service.deleteOrder('MC-TEST-BORRAR');
  assert.equal(eliminado, true);
  assert.equal(service.getOrderById('MC-TEST-BORRAR'), null);
});

test('Resiliencia ante JSON corrupto en localStorage', () => {
  const mockStorage = createMockLocalStorage({
    momentos_cookie_orders: 'JSON_CORRUPTO_{{{'
  });
  const service = createStorageService({ storage: mockStorage });

  // No debe lanzar excepción, debe regenerar o recuperar array limpio
  const pedidos = service.getOrders();
  assert.ok(Array.isArray(pedidos));
});


test('Exportación e Importación con fusión inteligente de backups', () => {
  const mockStorage = createMockLocalStorage();
  const service = createStorageService({ storage: mockStorage });

  const jsonBackup = service.exportBackupJson();
  assert.ok(typeof jsonBackup === 'string');
  assert.ok(jsonBackup.includes('MC-20261028-001'));

  const csv = service.exportOrdersCsv();
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('MC-20261028-001'));

  // Importar con datos nuevos y modificados
  const backupNuevo = [
    {
      id: 'MC-20261028-001',
      customer: { name: 'Sofía Modificada' },
      status: 'Entregado'
    },
    {
      id: 'MC-NUEVO-999',
      customer: { name: 'Cliente Nuevo' },
      status: 'Pendiente'
    }
  ];

  const resultado = service.importBackupJson(JSON.stringify(backupNuevo), { mode: 'merge' });
  assert.equal(resultado.success, true);

  const actualizado = service.getOrderById('MC-20261028-001');
  assert.equal(actualizado.customer.name, 'Sofía Modificada');
  assert.equal(actualizado.status, 'Entregado');

  const nuevo = service.getOrderById('MC-NUEVO-999');
  assert.equal(nuevo.customer.name, 'Cliente Nuevo');
});
