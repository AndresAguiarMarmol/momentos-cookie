/**
 * assets/js/storage.js
 * Capa de persistencia local resiliente para Momentos Cookie.
 * Encapsula localStorage con tolerancia a errores, fallback en memoria y datos iniciales de demostración.
 */

const STORAGE_KEYS = {
  ORDERS: 'momentos_cookie_orders',
  SETTINGS: 'momentos_cookie_settings'
};

const StorageProductionHelper = (typeof Production !== 'undefined') ? Production : (typeof require !== 'undefined' ? require('./production.js') : null);

// Generador de fechas relativas para seed data demostrativa
function obtenerFechaRelativa(diasOffset = 0, hora = '15:00') {
  const hoy = new Date();
  const target = new Date(hoy.getTime() + diasOffset * 24 * 60 * 60 * 1000);
  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const d = String(target.getDate()).padStart(2, '0');
  return {
    deliveryDate: `${y}-${m}-${d}`,
    deliveryTime: hora
  };
}

const INITIAL_SEED_ORDERS = [
  {
    id: 'MC-20261028-001',
    customer: {
      name: 'Sofía Martínez',
      phone: '+56 9 8765 4321',
      email: 'sofia.martinez@ejemplo.cl'
    },
    dates: {
      createdAt: new Date().toISOString(),
      ...obtenerFechaRelativa(-1, '11:00') // Atrasado (ayer)
    },
    orderType: 'individual',
    details: {
      flavor: 'Galletas de Canela y Glaseado Royal',
      quantity: 24,
      unitPrice: 1200,
      subtotal: 28800
    },
    notes: 'Diseño de flores en tonos pastel para baby shower. Sin nueces.',
    status: 'Pendiente',
    payment: {
      total: 28800,
      status: 'Abono/Seña',
      depositAmount: 15000
    }
  },
  {
    id: 'MC-20261028-002',
    customer: {
      name: 'Martín Valenzuela',
      phone: '+56 9 9123 9988',
      email: 'm.valenzuela@gmail.com'
    },
    dates: {
      createdAt: new Date().toISOString(),
      ...obtenerFechaRelativa(0, '18:30') // Urgente Hoy (< 24h)
    },
    orderType: 'combo',
    details: {
      comboName: 'Kit Dulce Fiesta Infantil',
      cookiesCount: 8,
      packaging: 'Caja decorativa con ventana y lazo',
      hasPaintKit: true,
      quantity: 3,
      unitPrice: 14500,
      subtotal: 43500
    },
    notes: 'Incluye 3 kits de pintura comestible con pinceles. Temática Dinosaurios.',
    status: 'En producción',
    payment: {
      total: 43500,
      status: 'Pagado total',
      depositAmount: 43500
    }
  },
  {
    id: 'MC-20261028-003',
    customer: {
      name: 'Camila Rojas',
      phone: '+56 9 7788 1122',
      email: 'camilita.rojas@outlook.com'
    },
    dates: {
      createdAt: new Date().toISOString(),
      ...obtenerFechaRelativa(3, '14:00') // Esta semana
    },
    orderType: 'combo',
    details: {
      comboName: 'Set Corporativo Elegance',
      cookiesCount: 12,
      packaging: 'Lata metálica de lujo',
      hasPaintKit: false,
      quantity: 2,
      unitPrice: 18000,
      subtotal: 36000
    },
    notes: 'Logotipo de empresa grabado en fondant con detalles dorados.',
    status: 'Listo para entrega',
    payment: {
      total: 36000,
      status: 'Abono/Seña',
      depositAmount: 20000
    }
  },
  {
    id: 'MC-20261028-004',
    customer: {
      name: 'Rodrigo Araya',
      phone: '+56 9 6655 4433',
      email: 'rodrigo.araya@yahoo.com'
    },
    dates: {
      createdAt: new Date().toISOString(),
      ...obtenerFechaRelativa(12, '16:00') // Próximas semanas
    },
    orderType: 'individual',
    details: {
      flavor: 'Galletas de Chocolate Amargo y Naranja',
      quantity: 30,
      unitPrice: 1500,
      subtotal: 45000
    },
    notes: 'Cumpleaños temático Halloween.',
    status: 'Pendiente',
    payment: {
      total: 45000,
      status: 'Pendiente',
      depositAmount: 0
    }
  }
];

function createStorageService(options = {}) {
  // Almacén en memoria por si storage nativo no está disponible o falla
  let memoryFallback = {};

  const storage = options.storage || (function () {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Verificar operatividad de localStorage
        const testKey = '__mc_test__';
        window.localStorage.setItem(testKey, '1');
        window.localStorage.removeItem(testKey);
        return window.localStorage;
      }
    } catch {
      // Ignorar fallo de storage bloqueado (ej: modo incógnito estricto)
    }
    return {
      getItem(key) {
        return Object.prototype.hasOwnProperty.call(memoryFallback, key) ? memoryFallback[key] : null;
      },
      setItem(key, val) {
        memoryFallback[key] = String(val);
      },
      removeItem(key) {
        delete memoryFallback[key];
      },
      clear() {
        memoryFallback = {};
      }
    };
  })();

  function safeGet(key, defaultValue = null) {
    try {
      const raw = storage.getItem(key);
      if (raw === null || raw === undefined) {
        return defaultValue;
      }
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }

  function safeSet(key, value) {
    try {
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function getOrders() {
    let orders = safeGet(STORAGE_KEYS.ORDERS, null);
    if (!Array.isArray(orders) || orders.length === 0) {
      // Precarga con seed data demostrativa si está vacío
      orders = JSON.parse(JSON.stringify(INITIAL_SEED_ORDERS));
      safeSet(STORAGE_KEYS.ORDERS, orders);
    }
    return orders;
  }

  function getOrderById(id) {
    const orders = getOrders();
    return orders.find(o => o.id === id) || null;
  }

  function saveOrder(order) {
    if (!order || !order.id) {
      throw new Error('El pedido debe tener un ID válido.');
    }
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === order.id);

    if (index >= 0) {
      orders[index] = { ...orders[index], ...order };
    } else {
      orders.push(order);
    }

    safeSet(STORAGE_KEYS.ORDERS, orders);
    return order;
  }

  function updateOrderStatus(id, newStatus) {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index >= 0) {
      orders[index].status = newStatus;
      safeSet(STORAGE_KEYS.ORDERS, orders);
      return orders[index];
    }
    return null;
  }

  function deleteOrder(id) {
    const orders = getOrders();
    const filtered = orders.filter(o => o.id !== id);
    if (filtered.length !== orders.length) {
      safeSet(STORAGE_KEYS.ORDERS, filtered);
      return true;
    }
    return false;
  }

  function resetToSeedData() {
    safeSet(STORAGE_KEYS.ORDERS, JSON.parse(JSON.stringify(INITIAL_SEED_ORDERS)));
    return getOrders();
  }

  function getSettings() {
    return safeGet(STORAGE_KEYS.SETTINGS, {
      currencySymbol: '$',
      businessName: 'Momentos Cookie'
    });
  }

  function saveSettings(settings) {
    return safeSet(STORAGE_KEYS.SETTINGS, settings);
  }

  function exportBackupJson() {
    const orders = getOrders();
    return JSON.stringify(orders, null, 2);
  }

  function exportOrdersCsv() {
    const orders = getOrders();
    const helper = (typeof Production !== 'undefined' ? Production : StorageProductionHelper);
    if (helper && helper.generarCsvPedidos) {
      return helper.generarCsvPedidos(orders);
    }
    return '';
  }

  function importBackupJson(rawJson, { mode = 'merge' } = {}) {
    let items = rawJson;
    if (typeof rawJson === 'string') {
      try {
        items = JSON.parse(rawJson);
      } catch (err) {
        return { success: false, error: 'JSON corrupto o inválido: ' + err.message };
      }
    }

    if (!Array.isArray(items)) {
      return { success: false, error: 'El contenido debe ser un array de pedidos.' };
    }

    const current = getOrders();
    let finalOrders = [];

    if (mode === 'replace') {
      finalOrders = items;
    } else {
      const helper = (typeof Production !== 'undefined' ? Production : StorageProductionHelper);
      if (helper && helper.fusionarPedidos) {
        finalOrders = helper.fusionarPedidos(current, items);
      } else {
        finalOrders = [...current, ...items];
      }
    }

    safeSet(STORAGE_KEYS.ORDERS, finalOrders);
    return { success: true, count: finalOrders.length };
  }

  return {
    getOrders,
    getOrderById,
    saveOrder,
    updateOrderStatus,
    deleteOrder,
    resetToSeedData,
    getSettings,
    saveSettings,
    exportBackupJson,
    exportOrdersCsv,
    importBackupJson
  };
}

const StorageModule = {
  STORAGE_KEYS,
  INITIAL_SEED_ORDERS,
  createStorageService
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageModule;
}

if (typeof window !== 'undefined') {
  window.StorageService = createStorageService();
  window.StorageModule = StorageModule;
}

