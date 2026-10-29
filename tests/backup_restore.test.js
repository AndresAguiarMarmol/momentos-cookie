/**
 * tests/backup_restore.test.js
 * Pruebas unitarias para mecanismos de respaldo y recuperación (Spec 004).
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createStorageService } = require('../assets/js/storage.js');
const { validarEstructuraBackup } = require('../assets/js/production.js');

function crearMockStorage(initialData = {}) {
  const store = { ...initialData };
  return {
    getItem(k) { return store[k] || null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; },
    clear() { Object.keys(store).forEach(k => delete store[k]); }
  };
}

test('T1.1: exportBackupJson genera estructura JSON válida con metadata, pedidos y ajustes', () => {
  const mock = crearMockStorage();
  const service = createStorageService({ storage: mock });

  const raw = service.exportBackupJson();
  assert.doesNotThrow(() => JSON.parse(raw));

  const parsed = JSON.parse(raw);
  assert.equal(parsed.version, '1.0');
  assert.ok(parsed.exportDate);
  assert.ok(Array.isArray(parsed.orders));
  assert.equal(parsed.totalOrders, parsed.orders.length);
  assert.ok(parsed.settings);
  assert.equal(parsed.settings.businessName, 'Momentos Cookie');
});

test('T1.2: validarEstructuraBackup rechaza JSON inválidos, nulos o sin pedidos', () => {
  assert.equal(validarEstructuraBackup(null).valido, false);
  assert.equal(validarEstructuraBackup('').valido, false);
  assert.equal(validarEstructuraBackup('{ corrupto }').valido, false);
  assert.equal(validarEstructuraBackup('{"otraCosa": 123}').valido, false);
  assert.equal(validarEstructuraBackup('{"orders": "no-es-array"}').valido, false);

  const validoConArrayDirecto = validarEstructuraBackup(JSON.stringify([{ id: 'MC-1', customer: { name: 'A' } }]));
  assert.equal(validoConArrayDirecto.valido, true);
  assert.equal(validoConArrayDirecto.items.length, 1);

  const validoConEstructuraCompleta = validarEstructuraBackup(JSON.stringify({
    version: '1.0',
    orders: [{ id: 'MC-1', customer: { name: 'A' } }],
    settings: { businessName: 'Taller Dulce' }
  }));
  assert.equal(validoConEstructuraCompleta.valido, true);
  assert.equal(validoConEstructuraCompleta.items.length, 1);
});

test('T1.3: importBackupJson en modo merge fusiona pedidos sin duplicar existentes', () => {
  const mock = crearMockStorage();
  const service = createStorageService({ storage: mock });

  const iniciales = service.getOrders();
  assert.equal(iniciales.length, 4);

  // Nuevo backup con un pedido existente modificado y uno totalmente nuevo
  const backup = JSON.stringify({
    version: '1.0',
    orders: [
      {
        id: 'MC-20261028-001',
        customer: { name: 'Sofía Martínez (Actualizada)' },
        status: 'En producción'
      },
      {
        id: 'MC-NUEVO-999',
        customer: { name: 'Cliente Nuevo', phone: '123' },
        status: 'Pendiente',
        payment: { total: 10000 }
      }
    ]
  });

  const res = service.importBackupJson(backup, { mode: 'merge' });
  assert.equal(res.success, true);
  assert.equal(res.count, 5); // 4 originales actualizados + 1 nuevo = 5

  const p1 = service.getOrderById('MC-20261028-001');
  assert.equal(p1.customer.name, 'Sofía Martínez (Actualizada)');

  const pNuevo = service.getOrderById('MC-NUEVO-999');
  assert.ok(pNuevo);
  assert.equal(pNuevo.customer.name, 'Cliente Nuevo');
});

test('T1.4: importBackupJson en modo replace sobrescribe totalmente los pedidos', () => {
  const mock = crearMockStorage();
  const service = createStorageService({ storage: mock });

  const backup = JSON.stringify({
    version: '1.0',
    orders: [
      { id: 'MC-REEMPLAZO-001', customer: { name: 'Único Pedido' }, status: 'Pendiente' }
    ]
  });

  const res = service.importBackupJson(backup, { mode: 'replace' });
  assert.equal(res.success, true);
  assert.equal(res.count, 1);

  const actualizados = service.getOrders();
  assert.equal(actualizados.length, 1);
  assert.equal(actualizados[0].id, 'MC-REEMPLAZO-001');
});

test('T1.5: importBackupJson restaura también los settings del taller si vienen en el archivo', () => {
  const mock = crearMockStorage();
  const service = createStorageService({ storage: mock });

  const backup = JSON.stringify({
    version: '1.0',
    settings: {
      businessName: 'Galletas de Ensueño',
      phone: '+56 9 9999 8888',
      currencySymbol: '€',
      footerMessage: 'Gracias por su compra europea'
    },
    orders: [
      { id: 'MC-001', customer: { name: 'Test' } }
    ]
  });

  service.importBackupJson(backup, { mode: 'merge' });
  const settings = service.getSettings();
  assert.equal(settings.businessName, 'Galletas de Ensueño');
  assert.equal(settings.phone, '+56 9 9999 8888');
  assert.equal(settings.currencySymbol, '€');
});

