/**
 * assets/js/storage.js
 * Capa de persistencia local resiliente para Momentos Cookie.
 * Encapsula localStorage con tolerancia a errores, fallback en memoria y datos iniciales de demostraciÃ³n.
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
      name: 'SofÃ­a MartÃ­nez',
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
    notes: 'DiseÃ±o de flores en tonos pastel para baby shower. Sin nueces.',
    status: 'Pendiente',
    payment: {
      total: 28800,
      status: 'Abono/SeÃ±a',
      depositAmount: 15000
    }
  },
  {
    id: 'MC-20261028-002',
    customer: {
      name: 'MartÃ­n Valenzuela',
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
    notes: 'Incluye 3 kits de pintura comestible con pinceles. TemÃ¡tica Dinosaurios.',
    status: 'En producciÃ³n',
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
      packaging: 'Lata metÃ¡lica de lujo',
      hasPaintKit: false,
      quantity: 2,
      unitPrice: 18000,
      subtotal: 36000
    },
    notes: 'Logotipo de empresa grabado en fondant con detalles dorados.',
    status: 'Listo para entrega',
    payment: {
      total: 36000,
      status: 'Abono/SeÃ±a',
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
      ...obtenerFechaRelativa(12, '16:00') // PrÃ³ximas semanas
    },
    orderType: 'individual',
    details: {
      flavor: 'Galletas de Chocolate Amargo y Naranja',
      quantity: 30,
      unitPrice: 1500,
      subtotal: 45000
    },
    notes: 'CumpleaÃ±os temÃ¡tico Halloween.',
    status: 'Pendiente',
    payment: {
      total: 45000,
      status: 'Pendiente',
      depositAmount: 0
    }
  }
];

const RECOVERED_ORDERS = [
  {
    "id": "MC-20261029-827",
    "customer": {
      "name": "Sandra Vergara",
      "phone": "+56998170998",
      "email": ""
    },
    "dates": {
      "createdAt": "2026-10-29T11:23:43.827Z",
      "deliveryDate": "2026-10-30",
      "deliveryTime": "15:00"
    },
    "orderType": "combo",
    "details": {
      "flavor": "",
      "comboName": "Box Caldero Magico",
      "cookiesCount": 12,
      "packaging": "Caja decorativa con lazo",
      "hasPaintKit": true,
      "quantity": 1,
      "unitPrice": 10990,
      "subtotal": 10990
    },
    "notes": "N/A",
    "status": "En producción",
    "payment": {
      "total": 10990,
      "status": "Pendiente",
      "depositAmount": 0
    },
    "items": [
      {
        "id": "item-1",
        "type": "combo",
        "flavor": "",
        "comboName": "Box Caldero Magico",
        "cookiesCount": 12,
        "packaging": "Caja decorativa con lazo",
        "hasPaintKit": true,
        "quantity": 1,
        "unitPrice": 10990,
        "subtotal": 10990
      }
    ]
  },
  {
    "id": "MC-20261029-060",
    "customer": {
      "name": "isabel Aranda",
      "phone": "98298388",
      "email": ""
    },
    "dates": {
      "createdAt": "2026-10-29T11:31:33.059Z",
      "deliveryDate": "2026-10-29",
      "deliveryTime": "15:00"
    },
    "orderType": "combo",
    "details": {
      "flavor": "",
      "comboName": "KIT CREA TU MONSTRUO",
      "cookiesCount": 4,
      "packaging": "Caja con ventana transparente",
      "hasPaintKit": true,
      "quantity": 2,
      "unitPrice": 8990,
      "subtotal": 17980
    },
    "notes": "",
    "status": "Pendiente",
    "payment": {
      "total": 17980,
      "status": "Pagado total",
      "depositAmount": 17980
    },
    "items": [
      {
        "id": "item-1",
        "type": "combo",
        "flavor": "",
        "comboName": "KIT CREA TU MONSTRUO",
        "cookiesCount": 4,
        "packaging": "Caja con ventana transparente",
        "hasPaintKit": true,
        "quantity": 2,
        "unitPrice": 8990,
        "subtotal": 17980
      }
    ]
  },
  {
    "id": "MC-20261029-108",
    "customer": {
      "name": "CONSTANZA BLEST GANA",
      "phone": "982325250",
      "email": ""
    },
    "dates": {
      "createdAt": "2026-10-29T11:36:32.108Z",
      "deliveryDate": "2026-10-29",
      "deliveryTime": "15:00"
    },
    "orderType": "combo",
    "items": [
      {
        "id": "item-1",
        "type": "combo",
        "flavor": "",
        "comboName": "CAJA TRUCO O TRATO",
        "cookiesCount": 25,
        "packaging": "Caja con ventana transparente",
        "hasPaintKit": true,
        "quantity": 1,
        "unitPrice": 18990,
        "subtotal": 18990
      },
      {
        "id": "item-2",
        "type": "combo",
        "flavor": "",
        "comboName": "BOLSAS BOO",
        "cookiesCount": 4,
        "packaging": "Bolsa decorativa con cinta",
        "hasPaintKit": true,
        "quantity": 1,
        "unitPrice": 3490,
        "subtotal": 3490
      }
    ],
    "details": {
      "flavor": "",
      "comboName": "CAJA TRUCO O TRATO",
      "cookiesCount": 25,
      "packaging": "Caja con ventana transparente",
      "hasPaintKit": true,
      "quantity": 1,
      "unitPrice": 18990,
      "subtotal": 18990
    },
    "notes": "",
    "status": "Pendiente",
    "payment": {
      "total": 22480,
      "status": "Abono/Seña",
      "depositAmount": 18990
    }
  },
  {
    "id": "MC-20261029-758",
    "customer": {
      "name": "ALEJANDRA OLEA",
      "phone": "963462509",
      "email": ""
    },
    "dates": {
      "createdAt": "2026-10-29T11:38:53.758Z",
      "deliveryDate": "2026-10-29",
      "deliveryTime": "19:00"
    },
    "orderType": "combo",
    "items": [
      {
        "id": "item-1",
        "type": "combo",
        "flavor": "",
        "comboName": "KIT CREA TU MONSTRUO",
        "cookiesCount": 4,
        "packaging": "Caja con ventana transparente",
        "hasPaintKit": true,
        "quantity": 1,
        "unitPrice": 8990,
        "subtotal": 8990
      },
      {
        "id": "item-2",
        "type": "combo",
        "flavor": "",
        "comboName": "BOX CALDERO MAGICO",
        "cookiesCount": 12,
        "packaging": "Caja decorativa con lazo",
        "hasPaintKit": true,
        "quantity": 1,
        "unitPrice": 10990,
        "subtotal": 10990
      },
      {
        "id": "item-3",
        "type": "combo",
        "flavor": "",
        "comboName": "BOLSAS BOO",
        "cookiesCount": 4,
        "packaging": "Bolsa decorativa con cinta",
        "hasPaintKit": true,
        "quantity": 4,
        "unitPrice": 3490,
        "subtotal": 13960
      }
    ],
    "details": {
      "flavor": "",
      "comboName": "KIT CREA TU MONSTRUO",
      "cookiesCount": 4,
      "packaging": "Caja con ventana transparente",
      "hasPaintKit": true,
      "quantity": 1,
      "unitPrice": 8990,
      "subtotal": 8990
    },
    "notes": "",
    "status": "Pendiente",
    "payment": {
      "total": 33940,
      "status": "Pendiente",
      "depositAmount": 0
    }
  },
  {
    "id": "MC-20261029-543",
    "customer": {
      "name": "ENDRINA/ANDRES",
      "phone": "966694484",
      "email": ""
    },
    "dates": {
      "createdAt": "2026-10-29T11:45:12.543Z",
      "deliveryDate": "2026-10-29",
      "deliveryTime": "09:00"
    },
    "orderType": "combo",
    "details": {
      "flavor": "",
      "comboName": "BOLSAS BOO",
      "cookiesCount": 4,
      "packaging": "Bolsa decorativa con cinta",
      "hasPaintKit": true,
      "quantity": 2,
      "unitPrice": 3490,
      "subtotal": 6980
    },
    "notes": "",
    "status": "Pendiente",
    "payment": {
      "total": 6980,
      "status": "Pagado total",
      "depositAmount": 6980
    },
    "items": [
      {
        "id": "item-1",
        "type": "combo",
        "flavor": "",
        "comboName": "BOLSAS BOO",
        "cookiesCount": 4,
        "packaging": "Bolsa decorativa con cinta",
        "hasPaintKit": true,
        "quantity": 2,
        "unitPrice": 3490,
        "subtotal": 6980
      }
    ]
  },
  {
    "id": "MC-20261029-261",
    "customer": {
      "name": "CONI VECINA",
      "phone": "966694484",
      "email": ""
    },
    "dates": {
      "createdAt": "2026-10-29T11:46:40.261Z",
      "deliveryDate": "2026-10-30",
      "deliveryTime": "15:00"
    },
    "orderType": "combo",
    "details": {
      "flavor": "",
      "comboName": "BOX CALDERO MAGICO",
      "cookiesCount": 12,
      "packaging": "Caja decorativa con lazo",
      "hasPaintKit": true,
      "quantity": 1,
      "unitPrice": 10990,
      "subtotal": 10990
    },
    "notes": "",
    "status": "Pendiente",
    "payment": {
      "total": 10990,
      "status": "Pendiente",
      "depositAmount": 0
    },
    "items": [
      {
        "id": "item-1",
        "type": "combo",
        "flavor": "",
        "comboName": "BOX CALDERO MAGICO",
        "cookiesCount": 12,
        "packaging": "Caja decorativa con lazo",
        "hasPaintKit": true,
        "quantity": 1,
        "unitPrice": 10990,
        "subtotal": 10990
      }
    ]
  },
  {
    "id": "MC-20261029-935",
    "customer": {
      "name": "ANDREINA EX VECINA",
      "phone": "966694484",
      "email": ""
    },
    "dates": {
      "createdAt": "2026-10-29T11:48:02.935Z",
      "deliveryDate": "2026-10-30",
      "deliveryTime": "12:00"
    },
    "orderType": "combo",
    "details": {
      "flavor": "",
      "comboName": "KIT CREA TU MONSTRUO",
      "cookiesCount": 4,
      "packaging": "Caja con ventana transparente",
      "hasPaintKit": true,
      "quantity": 1,
      "unitPrice": 8990,
      "subtotal": 8990
    },
    "notes": "",
    "status": "Pendiente",
    "payment": {
      "total": 8990,
      "status": "Pendiente",
      "depositAmount": 0
    },
    "items": [
      {
        "id": "item-1",
        "type": "combo",
        "flavor": "",
        "comboName": "KIT CREA TU MONSTRUO",
        "cookiesCount": 4,
        "packaging": "Caja con ventana transparente",
        "hasPaintKit": true,
        "quantity": 1,
        "unitPrice": 8990,
        "subtotal": 8990
      }
    ]
  },
  {
    "id": "MC-20261029-775",
    "customer": {
      "name": "FIAMA",
      "phone": "966694484",
      "email": ""
    },
    "dates": {
      "createdAt": "2026-10-29T11:48:47.775Z",
      "deliveryDate": "2026-10-30",
      "deliveryTime": "15:00"
    },
    "orderType": "combo",
    "details": {
      "flavor": "",
      "comboName": "KIT CREA TU MONSTRUO",
      "cookiesCount": 4,
      "packaging": "Caja con ventana transparente",
      "hasPaintKit": true,
      "quantity": 1,
      "unitPrice": 8990,
      "subtotal": 8990
    },
    "notes": "",
    "status": "Pendiente",
    "payment": {
      "total": 8990,
      "status": "Pendiente",
      "depositAmount": 0
    },
    "items": [
      {
        "id": "item-1",
        "type": "combo",
        "flavor": "",
        "comboName": "KIT CREA TU MONSTRUO",
        "cookiesCount": 4,
        "packaging": "Caja con ventana transparente",
        "hasPaintKit": true,
        "quantity": 1,
        "unitPrice": 8990,
        "subtotal": 8990
      }
    ]
  },
  {
    "id": "MC-20261029-813",
    "customer": {
      "name": "ANDRES/ TRABAJO",
      "phone": "966694484",
      "email": ""
    },
    "dates": {
      "createdAt": "2026-10-29T11:49:41.813Z",
      "deliveryDate": "2026-10-30",
      "deliveryTime": "15:00"
    },
    "orderType": "mixto",
    "items": [
      {
        "id": "item-1",
        "type": "combo",
        "flavor": "",
        "comboName": "BOX CALDERO  MAGICO",
        "cookiesCount": 12,
        "packaging": "Caja decorativa con lazo",
        "hasPaintKit": true,
        "quantity": 1,
        "unitPrice": 10990,
        "subtotal": 10990
      },
      {
        "id": "item-2",
        "type": "combo",
        "flavor": "",
        "comboName": "BOLSAS BOO",
        "cookiesCount": 4,
        "packaging": "Bolsa decorativa con cinta",
        "hasPaintKit": true,
        "quantity": 4,
        "unitPrice": 3490,
        "subtotal": 13960
      },
      {
        "id": "item-3",
        "type": "individual",
        "flavor": "HALLOWEEN",
        "comboName": "",
        "cookiesCount": 15,
        "packaging": "Bolsa decorativa",
        "hasPaintKit": false,
        "quantity": 15,
        "unitPrice": 1000,
        "subtotal": 15000
      }
    ],
    "details": {
      "flavor": "",
      "comboName": "BOX CALDERO  MAGICO",
      "cookiesCount": 12,
      "packaging": "Caja decorativa con lazo",
      "hasPaintKit": true,
      "quantity": 1,
      "unitPrice": 10990,
      "subtotal": 10990
    },
    "notes": "",
    "status": "Pendiente",
    "payment": {
      "total": 39950,
      "status": "Pendiente",
      "depositAmount": 0
    }
  },
  {
    "id": "MC-20261029-001",
    "customer": {
      "name": "NATALIA CORTEZ VECINA",
      "phone": "966694484",
      "email": ""
    },
    "dates": {
      "createdAt": "2026-10-29T11:52:24.001Z",
      "deliveryDate": "2026-10-30",
      "deliveryTime": "15:00"
    },
    "orderType": "combo",
    "details": {
      "flavor": "",
      "comboName": "BOLSAS BOO",
      "cookiesCount": 4,
      "packaging": "Bolsa decorativa con cinta",
      "hasPaintKit": true,
      "quantity": 7,
      "unitPrice": 3490,
      "subtotal": 24430
    },
    "notes": "",
    "status": "Pendiente",
    "payment": {
      "total": 24430,
      "status": "Pagado total",
      "depositAmount": 24430
    },
    "items": [
      {
        "id": "item-1",
        "type": "combo",
        "flavor": "",
        "comboName": "BOLSAS BOO",
        "cookiesCount": 4,
        "packaging": "Bolsa decorativa con cinta",
        "hasPaintKit": true,
        "quantity": 7,
        "unitPrice": 3490,
        "subtotal": 24430
      }
    ]
  },
  {
    "id": "MC-20261029-156",
    "customer": {
      "name": "CECILIA TIRONI",
      "phone": "966694484",
      "email": ""
    },
    "dates": {
      "createdAt": "2026-10-29T11:53:40.156Z",
      "deliveryDate": "2026-10-30",
      "deliveryTime": "15:00"
    },
    "orderType": "combo",
    "items": [
      {
        "id": "item-1",
        "type": "combo",
        "flavor": "",
        "comboName": "KIT CREA TU MONSTRUO",
        "cookiesCount": 4,
        "packaging": "Caja con ventana transparente",
        "hasPaintKit": true,
        "quantity": 1,
        "unitPrice": 8990,
        "subtotal": 8990
      },
      {
        "id": "item-2",
        "type": "combo",
        "flavor": "",
        "comboName": "BOLSAS BOO",
        "cookiesCount": 4,
        "packaging": "Bolsa decorativa con cinta",
        "hasPaintKit": true,
        "quantity": 4,
        "unitPrice": 3490,
        "subtotal": 13960
      }
    ],
    "details": {
      "flavor": "",
      "comboName": "KIT CREA TU MONSTRUO",
      "cookiesCount": 4,
      "packaging": "Caja con ventana transparente",
      "hasPaintKit": true,
      "quantity": 1,
      "unitPrice": 8990,
      "subtotal": 8990
    },
    "notes": "",
    "status": "Pendiente",
    "payment": {
      "total": 22950,
      "status": "Pendiente",
      "depositAmount": 0
    }
  }
];

function createStorageService(options = {}) {
  // AlmacÃ©n en memoria por si storage nativo no estÃ¡ disponible o falla
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
      // Ignorar fallo de storage bloqueado (ej: modo incÃ³gnito estricto)
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
      // Precarga con seed data demostrativa si estÃ¡ vacÃ­o
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
      throw new Error('El pedido debe tener un ID vÃ¡lido.');
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

  function consolidateCurrentOrders() {
    const orders = getOrders();
    const helper = (typeof Orders !== 'undefined') ? Orders : (typeof require !== 'undefined' ? require('./orders.js') : null);
    if (helper && typeof helper.consolidarPedidosPorClienteYFecha === 'function') {
      const consolidated = helper.consolidarPedidosPorClienteYFecha(orders);
      safeSet(STORAGE_KEYS.ORDERS, consolidated);
      return consolidated;
    }
    return orders;
  }

  function restorePreviousData() {
    safeSet(STORAGE_KEYS.ORDERS, JSON.parse(JSON.stringify(RECOVERED_ORDERS)));
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
    const settings = getSettings();
    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      totalOrders: orders.length,
      settings,
      orders
    }, null, 2);
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
    const helper = (typeof Production !== 'undefined' ? Production : StorageProductionHelper);
    const validacion = helper && helper.validarEstructuraBackup ? helper.validarEstructuraBackup(rawJson) : null;

    let items = null;
    let newSettings = null;

    if (validacion) {
      if (!validacion.valid && !validacion.valido) {
        return { success: false, error: validacion.error };
      }
      items = validacion.items;
      newSettings = validacion.settings;
    } else {
      let parsed = rawJson;
      if (typeof rawJson === 'string') {
        try {
          parsed = JSON.parse(rawJson);
        } catch (err) {
          return { success: false, error: 'JSON corrupto o invÃ¡lido: ' + err.message };
        }
      }
      items = Array.isArray(parsed) ? parsed : (parsed && parsed.orders);
      newSettings = parsed && parsed.settings;
    }

    if (!Array.isArray(items)) {
      return { success: false, error: 'El contenido debe incluir un array de pedidos.' };
    }

    const current = getOrders();
    let finalOrders = [];

    if (mode === 'replace') {
      finalOrders = items;
    } else {
      if (helper && helper.fusionarPedidos) {
        finalOrders = helper.fusionarPedidos(current, items);
      } else {
        const mapa = new Map();
        for (const o of current) if (o && o.id) mapa.set(o.id, o);
        for (const o of items) if (o && o.id) mapa.set(o.id, { ...(mapa.get(o.id) || {}), ...o });
        finalOrders = Array.from(mapa.values());
      }
    }

    safeSet(STORAGE_KEYS.ORDERS, finalOrders);

    if (newSettings && typeof newSettings === 'object') {
      saveSettings(newSettings);
    }

    return { success: true, count: finalOrders.length };
  }

  return {
    getOrders,
    getOrderById,
    saveOrder,
    updateOrderStatus,
    deleteOrder,
    resetToSeedData,
    restorePreviousData,
    consolidateCurrentOrders,
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
  RECOVERED_ORDERS,
  createStorageService
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageModule;
}

if (typeof window !== 'undefined') {
  window.StorageService = createStorageService();
  window.StorageModule = StorageModule;
}


