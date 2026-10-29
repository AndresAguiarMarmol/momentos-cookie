/**
 * assets/js/ui.js
 * Capa de interfaz de usuario y renderizado para Momentos Cookie.
 * Controla el formulario reactivo, cálculo en vivo, vistas, modales y notificaciones toast.
 */

// Dependencias de lógica
const OrdersHelper = (typeof Orders !== 'undefined') ? Orders : (typeof require !== 'undefined' ? require('./orders.js') : null);
const ProductionHelper = (typeof Production !== 'undefined') ? Production : (typeof require !== 'undefined' ? require('./production.js') : null);
const ReceiptHelper = (typeof Receipt !== 'undefined') ? Receipt : (typeof require !== 'undefined' ? require('./receipt.js') : null);

/**
 * Validación de campos obligatorios
 */
function validateOrderInput({ customerName, phone, deliveryDate }) {
  if (!customerName || !customerName.trim()) {
    return { valid: false, error: 'Por favor, ingresa el nombre del cliente.' };
  }
  if (!phone || !phone.trim()) {
    return { valid: false, error: 'Por favor, ingresa el teléfono o WhatsApp de contacto.' };
  }
  if (!deliveryDate || !deliveryDate.trim()) {
    return { valid: false, error: 'Por favor, selecciona la fecha comprometida de entrega.' };
  }
  return { valid: true, error: null };
}

/**
 * Extrae y formatea un objeto de Pedido a partir de datos del formulario
 */
function extractOrderFromInputs(inputs) {
  const calcSubtotal = OrdersHelper ? OrdersHelper.calcularSubtotal : (q, p) => q * p;
  const calcSaldo = OrdersHelper ? OrdersHelper.calcularSaldoPendiente : (t, a, st) => {
    const tot = Math.max(0, Number(t) || 0);
    if (st === 'Pagado total') return { total: tot, abono: tot, saldo: 0 };
    if (st === 'Abono/Seña') {
      const ab = Math.min(tot, Math.max(0, Number(a) || 0));
      return { total: tot, abono: ab, saldo: tot - ab };
    }
    return { total: tot, abono: 0, saldo: tot };
  };

  let items = [];
  let details = {};
  let subtotal = 0;
  let orderType = inputs.orderType || 'individual';

  if (Array.isArray(inputs.items) && inputs.items.length > 0) {
    items = inputs.items.map((it, idx) => {
      const type = it.type || (it.comboName ? 'combo' : 'individual');
      const cant = Math.max(1, Number(it.quantity) || 1);
      const precio = Math.max(0, Number(it.unitPrice) || 0);
      const sub = it.subtotal !== undefined ? Number(it.subtotal) : calcSubtotal(cant, precio);
      subtotal += sub;

      return {
        id: it.id || `item-${idx + 1}`,
        type,
        flavor: it.flavor || '',
        comboName: it.comboName || '',
        cookiesCount: Number(it.cookiesCount) || (type === 'combo' ? 6 : 1),
        packaging: it.packaging || '',
        hasPaintKit: Boolean(it.hasPaintKit),
        quantity: cant,
        unitPrice: precio,
        subtotal: sub
      };
    });

    const hasIndividual = items.some(it => it.type === 'individual');
    const hasCombo = items.some(it => it.type === 'combo');
    if (hasIndividual && hasCombo) {
      orderType = 'mixto';
    } else if (hasCombo) {
      orderType = 'combo';
    } else {
      orderType = 'individual';
    }

    const primer = items[0] || {};
    details = {
      flavor: primer.flavor || '',
      comboName: primer.comboName || '',
      cookiesCount: primer.cookiesCount || 1,
      packaging: primer.packaging || '',
      hasPaintKit: primer.hasPaintKit || false,
      quantity: primer.quantity || 1,
      unitPrice: primer.unitPrice || 0,
      subtotal: primer.subtotal || 0
    };
  } else {
    const isCombo = inputs.orderType === 'combo';
    let quantity = 0;
    let unitPrice = 0;

    if (isCombo) {
      quantity = Math.max(1, Number(inputs.comboQuantity) || 1);
      unitPrice = Math.max(0, Number(inputs.comboPrice) || 0);
      subtotal = calcSubtotal(quantity, unitPrice);

      details = {
        flavor: '',
        comboName: inputs.comboName || 'Combo Especial',
        cookiesCount: Math.max(1, Number(inputs.comboCookiesCount) || 6),
        packaging: inputs.comboPackaging || 'Caja decorativa con lazo',
        hasPaintKit: Boolean(inputs.comboHasPaintKit),
        quantity,
        unitPrice,
        subtotal
      };
      items = [{
        id: 'item-1',
        type: 'combo',
        ...details
      }];
    } else {
      quantity = Math.max(1, Number(inputs.individualQuantity) || 1);
      unitPrice = Math.max(0, Number(inputs.individualPrice) || 0);
      subtotal = calcSubtotal(quantity, unitPrice);

      details = {
        flavor: inputs.individualFlavor || 'Galletas Artesanales',
        comboName: '',
        cookiesCount: quantity,
        packaging: 'Bolsa decorativa',
        hasPaintKit: false,
        quantity,
        unitPrice,
        subtotal
      };
      items = [{
        id: 'item-1',
        type: 'individual',
        ...details
      }];
    }
  }

  const pagoInfo = calcSaldo(subtotal, inputs.depositAmount, inputs.paymentStatus);

  return {
    id: inputs.orderId || (OrdersHelper ? OrdersHelper.generarIdPedido(Date.now() % 1000) : `MC-${Date.now()}`),
    customer: {
      name: (inputs.customerName || '').trim(),
      phone: (inputs.customerPhone || '').trim(),
      email: (inputs.customerEmail || '').trim()
    },
    dates: {
      createdAt: inputs.createdAt || new Date().toISOString(),
      deliveryDate: inputs.deliveryDate || '',
      deliveryTime: inputs.deliveryTime || ''
    },
    orderType,
    items,
    details,
    notes: (inputs.notes || '').trim(),
    status: inputs.orderStatus || 'Pendiente',
    payment: {
      total: pagoInfo.total,
      status: inputs.paymentStatus || 'Pendiente',
      depositAmount: pagoInfo.abono
    }
  };
}

/**
 * Renderiza la tarjeta HTML de un pedido
 */
function renderOrderCardHtml(order, options = {}) {
  const format = OrdersHelper ? OrdersHelper.formatearMoneda : m => `$${m}`;
  const hoy = options.hoy || new Date();
  const categoria = options.categoriaSemaforo || (OrdersHelper ? OrdersHelper.clasificarPedidoPorUrgencia(order.dates?.deliveryDate, order.dates?.deliveryTime, order.status, hoy) : 'proximas');

  let cardClass = 'order-card-normal';
  let badgeSemaforo = `<span class="badge-proximas text-[11px] font-bold px-2 py-0.5 rounded-full">📦 Próximas</span>`;

  if (categoria === 'atrasado') {
    cardClass = 'order-card-urgent';
    badgeSemaforo = `<span class="badge-atrasado text-[11px] font-bold px-2 py-0.5 rounded-full">🚨 Atrasado</span>`;
  } else if (categoria === 'urgente_hoy') {
    cardClass = 'order-card-warning';
    badgeSemaforo = `<span class="badge-urgente text-[11px] font-bold px-2 py-0.5 rounded-full">⏰ Entrega Hoy (< 24h)</span>`;
  } else if (categoria === 'esta_semana') {
    cardClass = 'order-card-info';
    badgeSemaforo = `<span class="badge-semana text-[11px] font-bold px-2 py-0.5 rounded-full">📅 Esta semana</span>`;
  } else if (categoria === 'finalizado') {
    cardClass = 'border-gray-200 opacity-80';
    badgeSemaforo = `<span class="bg-gray-100 text-gray-700 text-[11px] font-bold px-2 py-0.5 rounded-full">${order.status}</span>`;
  }

  const statusColors = {
    'Pendiente': 'bg-amber-100 text-amber-900 border-amber-300',
    'En producción': 'bg-orange-100 text-orange-900 border-orange-300',
    'Listo para entrega': 'bg-emerald-100 text-emerald-900 border-emerald-300',
    'Entregado': 'bg-blue-100 text-blue-900 border-blue-300',
    'Cancelado': 'bg-gray-100 text-gray-600 border-gray-300'
  };

  const statusBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColors[order.status] || 'bg-gray-100'}">${order.status}</span>`;

  let paymentBadge = `<span class="bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-md">Saldo Pendiente</span>`;
  if (order.payment?.status === 'Pagado total') {
    paymentBadge = `<span class="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md">Pagado 100%</span>`;
  } else if (order.payment?.status === 'Abono/Seña') {
    paymentBadge = `<span class="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md">Abonado (${format(order.payment?.depositAmount)})</span>`;
  }

  const waUrl = OrdersHelper ? OrdersHelper.construirEnlaceWhatsApp(order.customer?.phone, order.customer?.name, order.id, order.status) : '#';

  let nextActionBtn = '';
  if (order.status === 'Pendiente') {
    nextActionBtn = `
      <button data-action="quick-status" data-id="${order.id}" data-next="En producción"
        class="flex-1 py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5">
        <i data-lucide="play" class="w-3.5 h-3.5"></i>
        <span>Iniciar Producción</span>
      </button>
    `;
  } else if (order.status === 'En producción') {
    nextActionBtn = `
      <button data-action="quick-status" data-id="${order.id}" data-next="Listo para entrega"
        class="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5">
        <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
        <span>Marcar Listo</span>
      </button>
    `;
  } else if (order.status === 'Listo para entrega') {
    nextActionBtn = `
      <button data-action="quick-status" data-id="${order.id}" data-next="Entregado"
        class="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5">
        <i data-lucide="truck" class="w-3.5 h-3.5"></i>
        <span>Marcar Entregado</span>
      </button>
    `;
  }

  let productoHtml = '';
  const ord = (OrdersHelper && typeof OrdersHelper.normalizeOrder === 'function') ? OrdersHelper.normalizeOrder(order) : order;
  const items = ord.items || [];

  if (items.length > 1) {
    const listado = items.map(it => {
      const cant = Number(it.quantity) || 1;
      const nombre = it.type === 'combo' ? (it.comboName || 'Combo Especial') : (it.flavor || 'Galletas Artesanales');
      return `<li class="truncate">• <strong>${cant}x</strong> ${nombre}</li>`;
    }).join('');

    const totalGalletas = items.reduce((acc, it) => {
      const q = Number(it.quantity) || 1;
      const c = it.type === 'combo' ? (Number(it.cookiesCount) || 6) : 1;
      return acc + (q * c);
    }, 0);

    productoHtml = `
      <div class="text-xs text-cocoa-900">
        <div class="flex items-center justify-between mb-1">
          <span class="font-bold text-cookie-700 text-sm">${items.length} ítems en el pedido</span>
          <span class="text-[11px] font-semibold bg-cookie-100 text-cookie-800 px-2 py-0.5 rounded-full">${totalGalletas} galletas</span>
        </div>
        <ul class="text-[11px] text-[#5A4A42] space-y-0.5 bg-[#FAF7F2] p-2 rounded-lg border border-[#E8E1D7]">
          ${listado}
        </ul>
      </div>
    `;
  } else if (items.length === 1 && items[0].type === 'combo') {
    const it = items[0];
    productoHtml = `
      <div class="text-xs text-cocoa-900">
        <span class="font-bold text-cookie-700 block text-sm">${it.comboName || 'Combo Especial'}</span>
        <span class="text-[#7A6A60]">${it.quantity || 1} combo(s) · ${it.cookiesCount || 6} galletas c/u</span>
        <div class="text-[11px] text-[#7A6A60] mt-0.5">Empaque: ${it.packaging || 'Caja decorativa'}</div>
        ${it.hasPaintKit ? '<span class="inline-block mt-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">🎨 Kit de pintura comestible incluido</span>' : ''}
      </div>
    `;
  } else if (items.length === 1) {
    const it = items[0];
    productoHtml = `
      <div class="text-xs text-cocoa-900">
        <span class="font-bold text-cookie-700 block text-sm">${it.flavor || 'Galletas Artesanales'}</span>
        <span class="text-[#7A6A60]">${it.quantity || 12} unidades individuales</span>
      </div>
    `;
  } else if (order.orderType === 'combo') {
    productoHtml = `
      <div class="text-xs text-cocoa-900">
        <span class="font-bold text-cookie-700 block text-sm">${order.details?.comboName || 'Combo Especial'}</span>
        <span class="text-[#7A6A60]">${order.details?.quantity || 1} combo(s) · ${order.details?.cookiesCount || 6} galletas c/u</span>
        <div class="text-[11px] text-[#7A6A60] mt-0.5">Empaque: ${order.details?.packaging || 'Caja decorativa'}</div>
        ${order.details?.hasPaintKit ? '<span class="inline-block mt-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">🎨 Kit de pintura comestible incluido</span>' : ''}
      </div>
    `;
  } else {
    productoHtml = `
      <div class="text-xs text-cocoa-900">
        <span class="font-bold text-cookie-700 block text-sm">${order.details?.flavor || 'Galletas Artesanales'}</span>
        <span class="text-[#7A6A60]">${order.details?.quantity || 12} unidades individuales</span>
      </div>
    `;
  }

  return `
    <div class="order-card ${cardClass} rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs" data-order-id="${order.id}">
      <div class="space-y-3">
        
        <!-- Header de la Tarjeta con clic para ver detalle -->
        <div class="flex items-start justify-between gap-2 border-b border-[#F0EAE1] pb-2.5 cursor-pointer" data-action="view-detail" data-id="${order.id}">
          <div>
            <span class="font-mono text-[11px] font-bold text-cookie-700 block">${order.id}</span>
            <h4 class="font-bold text-sm sm:text-base text-cocoa-900 leading-tight hover:text-cookie-600 transition-colors">${order.customer?.name || 'Cliente'}</h4>
            <span class="text-xs text-[#7A6A60]">${order.customer?.phone || ''}</span>
          </div>
          <div class="flex flex-col items-end gap-1">
            ${badgeSemaforo}
            ${statusBadge}
          </div>
        </div>

        <!-- Fecha Comprometida -->
        <div class="flex items-center gap-1.5 text-xs text-cocoa-900 bg-[#FAF7F2] p-2 rounded-lg border border-[#EDE5DA]">
          <i data-lucide="clock" class="w-3.5 h-3.5 text-cookie-600"></i>
          <span class="font-semibold">Entrega:</span>
          <span>${order.dates?.deliveryDate || 'Sin fecha'}</span>
          ${order.dates?.deliveryTime ? `<span class="font-bold text-cookie-700">(${order.dates.deliveryTime})</span>` : ''}
        </div>

        <!-- Detalle de Producto -->
        ${productoHtml}

        <!-- Notas breves si existen -->
        ${order.notes ? `
          <p class="text-[11px] text-[#7A6A60] bg-gray-50 p-2 rounded-lg italic border border-gray-100">
            "${order.notes}"
          </p>
        ` : ''}

        <!-- Resumen de Pago -->
        <div class="flex items-center justify-between pt-2 border-t border-[#F0EAE1] text-xs">
          <span class="font-bold text-cocoa-900">Total: ${format(order.payment?.total || 0)}</span>
          ${paymentBadge}
        </div>
      </div>

      <!-- Barra de Acciones -->
      <div class="flex items-center gap-2 pt-4 border-t border-[#F0EAE1] mt-3">
        ${nextActionBtn}

        <button data-action="print-ticket" data-id="${order.id}"
          class="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
          title="Ver e imprimir comprobante de entrega">
          <i data-lucide="receipt" class="w-4 h-4"></i>
        </button>

        <a href="${waUrl}" target="_blank" rel="noopener noreferrer"
          class="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
          title="Contactar al cliente por WhatsApp">
          <i data-lucide="message-circle" class="w-4 h-4"></i>
        </a>

        <button data-action="edit" data-id="${order.id}"
          class="p-2.5 rounded-xl bg-[#F0EAE1] hover:bg-[#E5DDD2] text-[#5A4A42] transition-colors"
          title="Editar pedido">
          <i data-lucide="edit-3" class="w-4 h-4"></i>
        </button>

        <button data-action="delete" data-id="${order.id}"
          class="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 transition-colors"
          title="Eliminar pedido">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `;
}

/**
 * Renderiza la Vista de Planificación (Semáforo cronológico)
 */
function renderPlanningView(orders = [], options = {}) {
  if (typeof document === 'undefined') return;

  const filterSelect = document.getElementById('planning-status-filter');
  const filterVal = options.filterStatus || (filterSelect ? filterSelect.value : 'activos');
  const hoy = options.hoy || new Date();

  let filtered = orders;
  if (filterVal === 'activos') {
    filtered = orders.filter(o => o.status !== 'Entregado' && o.status !== 'Cancelado');
  } else if (filterVal !== 'todos') {
    filtered = orders.filter(o => o.status === filterVal);
  }

  const grupos = OrdersHelper ? OrdersHelper.agruparPedidosPorSemaforo(filtered, hoy) : { atrasados: [], urgenteHoy: [], estaSemana: [], proximas: [] };

  renderBlock('container-atrasados', 'count-atrasados', grupos.atrasados, 'atrasado', 'Sin pedidos atrasados. ¡Excelente trabajo en cocina!');
  renderBlock('container-hoy', 'count-hoy', grupos.urgenteHoy, 'urgente_hoy', 'No hay entregas pendientes para hoy.');
  renderBlock('container-esta-semana', 'count-esta-semana', grupos.estaSemana, 'esta_semana', 'Sin pedidos para el resto de esta semana.');
  renderBlock('container-proximas', 'count-proximas', grupos.proximas, 'proximas', 'Sin entregas registradas para próximas semanas.');
}

function renderBlock(containerId, countId, items, categoria, emptyMsg) {
  const container = document.getElementById(containerId);
  const countEl = document.getElementById(countId);

  if (countEl) countEl.textContent = items.length;
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-6 px-4 text-center bg-white rounded-xl border border-dashed border-[#E0D7CC] text-xs text-[#8C7B72]">
        ${emptyMsg}
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(order => renderOrderCardHtml(order, { categoriaSemaforo: categoria })).join('');
}

/**
 * Renderiza la Vista General de Todos los Pedidos (con buscador reactivo)
 */
function renderAllOrdersView(orders = [], options = {}) {
  if (typeof document === 'undefined') return;

  const searchInput = document.getElementById('search-input');
  const searchText = options.searchText !== undefined ? options.searchText : (searchInput ? searchInput.value : '');

  const activeChip = document.querySelector('#orders-status-filters .filter-chip.bg-cookie-500');
  const statusFilter = options.filterStatus || (activeChip ? activeChip.getAttribute('data-status') : 'todos');

  const filtered = OrdersHelper ? OrdersHelper.filtrarPedidos(orders, { textoBusqueda: searchText, estadoFiltro: statusFilter }) : orders;
  const sorted = OrdersHelper ? OrdersHelper.ordenarPedidosPorFecha(filtered) : filtered;

  const container = document.getElementById('all-orders-container');
  const emptyState = document.getElementById('orders-empty-state');
  const countBadge = document.getElementById('orders-count-badge');

  if (countBadge) {
    countBadge.textContent = `Mostrando ${sorted.length} pedido${sorted.length === 1 ? '' : 's'} (de ${orders.length} en total)`;
  }

  if (!container) return;

  if (sorted.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
  } else {
    if (emptyState) emptyState.classList.add('hidden');
    container.innerHTML = sorted.map(order => renderOrderCardHtml(order)).join('');
  }
}

/**
 * Abre el modal de detalle completo de una orden
 */
function openDetailModal(order) {
  if (typeof document === 'undefined' || !order) return;
  const modal = document.getElementById('modal-detail');
  if (!modal) return;

  const ord = (OrdersHelper && typeof OrdersHelper.normalizeOrder === 'function') ? OrdersHelper.normalizeOrder(order) : order;
  const format = OrdersHelper ? OrdersHelper.formatearMoneda : m => `$${m}`;

  document.getElementById('detail-order-id').textContent = order.id;
  document.getElementById('detail-customer-name').textContent = order.customer?.name || 'Cliente';

  const isCombo = order.orderType === 'combo';
  const waUrl = OrdersHelper ? OrdersHelper.construirEnlaceWhatsApp(order.customer?.phone, order.customer?.name, order.id, order.status) : '#';
  const waBtn = document.getElementById('detail-whatsapp-btn');
  if (waBtn) waBtn.href = waUrl;

  const editBtn = document.getElementById('btn-edit-from-detail');
  if (editBtn) {
    editBtn.onclick = () => {
      modal.close();
      populateForm(order);
    };
  }

  const closeBtn = document.getElementById('btn-close-detail');
  if (closeBtn) {
    closeBtn.onclick = () => modal.close();
  }

  const saldoPendiente = Math.max(0, (order.payment?.total || 0) - (order.payment?.depositAmount || 0));

  const contentBody = document.getElementById('detail-content-body');
  if (contentBody) {
    contentBody.innerHTML = `
      <div class="grid grid-cols-2 gap-3 bg-[#FAF7F2] p-3 rounded-xl border border-[#EDE5DA]">
        <div>
          <span class="text-[11px] font-semibold text-[#7A6A60] block">Teléfono / WhatsApp:</span>
          <span class="font-bold text-cocoa-900">${order.customer?.phone || 'No registrado'}</span>
        </div>
        <div>
          <span class="text-[11px] font-semibold text-[#7A6A60] block">Correo:</span>
          <span class="text-cocoa-900">${order.customer?.email || 'No registrado'}</span>
        </div>
        <div>
          <span class="text-[11px] font-semibold text-[#7A6A60] block">Fecha de entrega:</span>
          <span class="font-bold text-cookie-700">${order.dates?.deliveryDate || 'Sin fecha'} ${order.dates?.deliveryTime ? `a las ${order.dates.deliveryTime}` : ''}</span>
        </div>
        <div>
          <span class="text-[11px] font-semibold text-[#7A6A60] block">Estado actual:</span>
          <span class="font-bold text-cocoa-900">${order.status}</span>
        </div>
      </div>

      <div class="space-y-3 border-t border-[#F0EAE1] pt-3">
        <h4 class="font-bold text-xs uppercase text-cookie-700 tracking-wider">Artículos del Pedido (${(ord.items || []).length})</h4>
        ${(ord.items || []).map((it, idx) => {
          const isComboItem = it.type === 'combo';
          const subtotalFormatted = format(it.subtotal !== undefined ? it.subtotal : (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0));
          const borderStyle = idx > 0 ? 'border-t border-[#EDE5DA] pt-2.5 mt-2.5' : '';

          if (isComboItem) {
            return `
              <div class="space-y-1 ${borderStyle}">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm text-cocoa-900">${it.comboName || 'Combo Especial'}</span>
                  <span class="font-bold text-xs text-cookie-700">${subtotalFormatted}</span>
                </div>
                <div class="text-xs text-[#7A6A60]">${it.quantity || 1} combo(s) · ${it.cookiesCount || 6} galletas c/u (${format(it.unitPrice || 0)} c/u)</div>
                <div class="text-xs text-[#7A6A60]">Empaque: ${it.packaging || 'Caja decorativa'}</div>
                <div class="text-xs font-semibold ${it.hasPaintKit ? 'text-amber-700' : 'text-gray-500'}">
                  ${it.hasPaintKit ? '🎨 Incluye kit de pintura comestible y pinceles' : 'Sin kit de pintura'}
                </div>
              </div>
            `;
          } else {
            return `
              <div class="space-y-1 ${borderStyle}">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sm text-cocoa-900">${it.flavor || 'Galletas Artesanales'}</span>
                  <span class="font-bold text-xs text-cookie-700">${subtotalFormatted}</span>
                </div>
                <div class="text-xs text-[#7A6A60]">${it.quantity || 12} unidades individuales (${format(it.unitPrice || 0)} c/u)</div>
              </div>
            `;
          }
        }).join('')}
      </div>

      ${order.notes ? `
        <div class="border-t border-[#F0EAE1] pt-3">
          <h4 class="font-bold text-xs uppercase text-cookie-700 tracking-wider">Notas de Diseño y Alergias</h4>
          <p class="text-xs bg-amber-50/70 p-2.5 rounded-lg border border-amber-100 text-cocoa-900 mt-1">
            ${order.notes}
          </p>
        </div>
      ` : ''}

      <div class="grid grid-cols-3 gap-2 text-center bg-[#FAF7F2] p-3 rounded-xl border border-[#EDE5DA] mt-3">
        <div>
          <span class="text-[10px] font-semibold text-[#7A6A60] block">TOTAL</span>
          <span class="text-sm font-bold text-cocoa-900">${format(order.payment?.total || 0)}</span>
        </div>
        <div>
          <span class="text-[10px] font-semibold text-[#7A6A60] block">ABONADO</span>
          <span class="text-sm font-bold text-emerald-700">${format(order.payment?.depositAmount || 0)}</span>
        </div>
        <div>
          <span class="text-[10px] font-semibold text-[#7A6A60] block">SALDO PENDIENTE</span>
          <span class="text-sm font-bold text-cookie-700">${format(saldoPendiente)}</span>
        </div>
      </div>
    `;
  }

  modal.showModal();
}

/**
 * Renderiza la Vista de Producción y Métricas
 */
function renderProductionView(orders = [], options = {}) {
  if (typeof document === 'undefined') return;

  const rangeSelect = document.getElementById('production-range-filter');
  const rango = options.rango || (rangeSelect ? rangeSelect.value : 'activos');
  const hoy = options.hoy || new Date();
  const format = OrdersHelper ? OrdersHelper.formatearMoneda : m => `$${m}`;

  if (!ProductionHelper) return;

  const prod = ProductionHelper.consolidarProduccion(orders, { rango, hoy });
  const metrics = ProductionHelper.calcularMetricasFinancieras(orders);

  // 1. Tarjetas financieras
  const elFacturado = document.getElementById('metric-facturado');
  const elCobrado = document.getElementById('metric-cobrado');
  const elSaldo = document.getElementById('metric-saldo');
  const elGalletas = document.getElementById('metric-galletas');
  const elCount = document.getElementById('metric-ordenes-count');

  if (elFacturado) elFacturado.textContent = format(metrics.totalFacturado);
  if (elCobrado) elCobrado.textContent = format(metrics.totalCobrado);
  if (elSaldo) elSaldo.textContent = format(metrics.saldoPendiente);
  if (elGalletas) elGalletas.textContent = `${prod.totalGalletas} u.`;
  if (elCount) elCount.textContent = `En ${prod.ordenesContadas} pedido${prod.ordenesContadas === 1 ? '' : 's'}`;

  // 2. Lotes de galletas por sabor
  const bakingList = document.getElementById('production-baking-list');
  if (bakingList) {
    const saboresEntries = Object.entries(prod.sabores);
    if (saboresEntries.length === 0) {
      bakingList.innerHTML = `<p class="text-xs text-[#8C7B72] italic py-3 text-center">No hay galletas individuales pendientes en este período.</p>`;
    } else {
      bakingList.innerHTML = saboresEntries.map(([sabor, cant], idx) => `
        <label class="flex items-center justify-between p-3 rounded-xl border border-[#EDE5DA] bg-[#FAF7F2] hover:bg-white cursor-pointer transition-colors group">
          <div class="flex items-center gap-3">
            <input type="checkbox" id="check-baking-${idx}" class="baking-check w-4 h-4 rounded text-cookie-600 focus:ring-cookie-500">
            <span class="text-xs sm:text-sm font-semibold text-cocoa-900 group-has-[:checked]:line-through group-has-[:checked]:opacity-45 transition-all">${sabor}</span>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-cookie-100 text-cookie-800">${cant} u.</span>
        </label>
      `).join('');
    }
  }

  // 3. Combos a armar
  const combosList = document.getElementById('production-combos-list');
  if (combosList) {
    const combosEntries = Object.entries(prod.combos);
    if (combosEntries.length === 0) {
      combosList.innerHTML = `<p class="text-xs text-[#8C7B72] italic py-2 text-center">Sin combos en este período.</p>`;
    } else {
      combosList.innerHTML = combosEntries.map(([nombre, cant], idx) => `
        <label class="flex items-center justify-between p-3 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-white cursor-pointer transition-colors group">
          <div class="flex items-center gap-3">
            <input type="checkbox" id="check-combo-${idx}" class="baking-check w-4 h-4 rounded text-amber-600 focus:ring-amber-500">
            <span class="text-xs sm:text-sm font-semibold text-cocoa-900 group-has-[:checked]:line-through group-has-[:checked]:opacity-45 transition-all">${nombre}</span>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">${cant} combo${cant > 1 ? 's' : ''}</span>
        </label>
      `).join('');
    }
  }

  // 4. Empaques y kits de pintura
  const packagingList = document.getElementById('production-packaging-list');
  if (packagingList) {
    const empaquesEntries = Object.entries(prod.empaques);
    let html = '';

    if (prod.totalKitsPintura > 0) {
      html += `
        <div class="flex items-center justify-between p-2.5 rounded-xl border border-amber-300 bg-amber-50 text-xs font-bold text-amber-900">
          <span class="flex items-center gap-2"><i data-lucide="palette" class="w-4 h-4 text-amber-700"></i> Kits de Pintura Comestible</span>
          <span class="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">${prod.totalKitsPintura} kit${prod.totalKitsPintura > 1 ? 's' : ''}</span>
        </div>
      `;
    }

    if (empaquesEntries.length > 0) {
      html += empaquesEntries.map(([empaque, cant]) => `
        <div class="flex items-center justify-between p-2.5 rounded-xl border border-[#EDE5DA] bg-[#FAF7F2] text-xs">
          <span class="text-cocoa-900 font-medium">${empaque}</span>
          <span class="font-bold text-cookie-700">${cant} u.</span>
        </div>
      `).join('');
    }

    if (!html) {
      packagingList.innerHTML = `<p class="text-xs text-[#8C7B72] italic py-2 text-center">Sin requerimientos de empaques especiales.</p>`;
    } else {
      packagingList.innerHTML = html;
    }
  }
}

function downloadFile(content, fileName, mimeType = 'text/plain;charset=utf-8') {
  if (typeof document === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function openReceiptModal(order, settings = {}) {
  if (typeof document === 'undefined' || !order) return;
  const modal = document.getElementById('modal-receipt');
  const container = document.getElementById('receipt-container');
  if (!modal || !container) return;

  if (ReceiptHelper && ReceiptHelper.generarTicketEntregaHtml) {
    container.innerHTML = ReceiptHelper.generarTicketEntregaHtml(order, settings);
  }

  modal.showModal();
}

function openRestoreModal() {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('modal-restore');
  if (!modal) return;

  const fileInput = document.getElementById('restore-file-input');
  const fileName = document.getElementById('restore-file-name');
  const preview = document.getElementById('restore-preview-container');
  const errorBox = document.getElementById('restore-error-box');
  const btnConfirm = document.getElementById('btn-confirm-restore');

  if (fileInput) fileInput.value = '';
  if (fileName) fileName.textContent = 'Ningún archivo seleccionado';
  if (preview) preview.classList.add('hidden');
  if (errorBox) errorBox.classList.add('hidden');
  if (btnConfirm) btnConfirm.disabled = true;

  const radioMerge = document.querySelector('input[name="restoreMode"][value="merge"]');
  if (radioMerge) radioMerge.checked = true;

  modal.showModal();
}

function openSettingsModal(settings = {}) {
  if (typeof document === 'undefined') return;
  const modal = document.getElementById('modal-settings');
  if (!modal) return;

  const nameInput = document.getElementById('setting-business-name');
  const phoneInput = document.getElementById('setting-phone');
  const currencyInput = document.getElementById('setting-currency-symbol');
  const footerInput = document.getElementById('setting-footer-message');

  if (nameInput) nameInput.value = settings.businessName || 'Momentos Cookie';
  if (phoneInput) phoneInput.value = settings.phone || '+56 9 1234 5678';
  if (currencyInput) currencyInput.value = settings.currencySymbol || '$';
  if (footerInput) footerInput.value = settings.footerMessage || '¡Gracias por endulzar tus momentos con nosotros!';

  modal.showModal();
}

function updateBusinessBranding(settings = {}) {
  if (typeof document === 'undefined') return;
  const brandName = settings.businessName || 'Momentos Cookie';
  const heading = document.querySelector('header h1');
  if (heading) heading.textContent = brandName;
  document.title = `${brandName} | Gestión y Control de Pedidos`;
}

function showToast(message, type = 'info') {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-cookie-600 text-white',
    warning: 'bg-amber-600 text-white'
  };

  toast.className = `toast px-4 py-3 rounded-xl shadow-lg text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function switchView(viewId) {
  if (typeof document === 'undefined') return;

  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
  }

  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    const isTarget = btn.getAttribute('data-view') === viewId;
    if (isTarget) {
      btn.className = 'nav-tab-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-cookie-500 text-white shadow-xs';
    } else {
      btn.className = 'nav-tab-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all text-[#6B5A50] hover:bg-[#F2ECE4]';
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

let currentOrderItems = [];

function createDefaultItem(type = 'individual', idSuffix = Date.now()) {
  const isCombo = type === 'combo';
  return {
    id: `item-${idSuffix}`,
    type: isCombo ? 'combo' : 'individual',
    flavor: isCombo ? '' : 'Vainilla Real Glaseada',
    comboName: isCombo ? 'Kit Especial Dulce' : '',
    cookiesCount: isCombo ? 6 : 1,
    packaging: isCombo ? 'Caja decorativa con lazo' : 'Bolsa celofán',
    hasPaintKit: isCombo ? true : false,
    quantity: isCombo ? 1 : 12,
    unitPrice: isCombo ? 14500 : 1200,
    subtotal: isCombo ? 14500 : 14400
  };
}

function renderOrderItems() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('order-items-list');
  if (!container) return;

  if (!Array.isArray(currentOrderItems) || currentOrderItems.length === 0) {
    currentOrderItems = [createDefaultItem('individual', '1')];
  }

  const format = OrdersHelper ? OrdersHelper.formatearMoneda : m => `$${m}`;
  const totalItems = currentOrderItems.length;

  container.innerHTML = currentOrderItems.map((it, idx) => {
    const isCombo = it.type === 'combo';
    const cant = Math.max(1, Number(it.quantity) || 1);
    const precio = Math.max(0, Number(it.unitPrice) || 0);
    const subtotal = Math.round(cant * precio);
    it.subtotal = subtotal;

    return `
      <div class="order-item-card p-4 sm:p-5 rounded-2xl border ${isCombo ? 'border-amber-200 bg-amber-50/40' : 'border-[#E8E1D7] bg-[#FAF7F2]'} space-y-4 relative transition-all shadow-xs" data-item-id="${it.id}">
        <!-- Encabezado del Ítem -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-b ${isCombo ? 'border-amber-200' : 'border-[#EDE5DA]'} pb-3">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full ${isCombo ? 'bg-amber-200 text-amber-900' : 'bg-cookie-200 text-cookie-900'} text-xs font-extrabold flex items-center justify-center">
              ${idx + 1}
            </span>
            <span class="font-bold text-sm text-cocoa-900">
              ${isCombo ? 'Combo / Kit Especial' : 'Galletas Individuales'}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Selector de Tipo por Ítem -->
            <div class="inline-flex p-0.5 rounded-xl bg-white border border-[#DCD3C7] text-xs font-semibold shadow-2xs">
              <button type="button" data-action="set-item-type" data-id="${it.id}" data-type="individual"
                class="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${!isCombo ? 'bg-cookie-500 text-white font-bold shadow-xs' : 'text-[#6B5A50] hover:text-black'}">
                <i data-lucide="cookie" class="w-3.5 h-3.5"></i>
                <span>Individual</span>
              </button>
              <button type="button" data-action="set-item-type" data-id="${it.id}" data-type="combo"
                class="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${isCombo ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-[#6B5A50] hover:text-black'}">
                <i data-lucide="gift" class="w-3.5 h-3.5"></i>
                <span>Combo / Kit</span>
              </button>
            </div>

            <!-- Botón Eliminar Ítem -->
            ${totalItems > 1 ? `
              <button type="button" data-action="delete-item" data-id="${it.id}"
                class="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors" title="Eliminar este ítem">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            ` : ''}
          </div>
        </div>

        ${isCombo ? `
          <!-- Campos para Combo -->
          <div class="space-y-3">
            <div class="space-y-1">
              <label class="block text-xs font-bold text-cocoa-900">
                Nombre o temática del combo <span class="text-red-500">*</span>
              </label>
              <input type="text" data-field="comboName"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DCD3C7] bg-white text-sm focus:border-cookie-500 outline-none"
                placeholder="Ej: Kit Pintura Dulce Dinosaurios, Set Navideño..." value="${it.comboName || ''}">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-cocoa-900">
                  Galletas incluidas por combo
                </label>
                <input type="number" min="1" data-field="cookiesCount"
                  class="w-full px-3.5 py-2 rounded-xl border border-[#DCD3C7] bg-white text-sm focus:border-cookie-500 outline-none"
                  value="${it.cookiesCount || 6}">
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-bold text-cocoa-900">
                  Tipo de empaque
                </label>
                <select data-field="packaging"
                  class="w-full px-3.5 py-2 rounded-xl border border-[#DCD3C7] bg-white text-sm focus:border-cookie-500 outline-none">
                  <option value="Caja decorativa con lazo" ${it.packaging === 'Caja decorativa con lazo' ? 'selected' : ''}>Caja decorativa con lazo</option>
                  <option value="Bolsa decorativa con cinta" ${it.packaging === 'Bolsa decorativa con cinta' ? 'selected' : ''}>Bolsa decorativa con cinta</option>
                  <option value="Lata metálica de lujo" ${it.packaging === 'Lata metálica de lujo' ? 'selected' : ''}>Lata metálica de lujo</option>
                  <option value="Caja con ventana transparente" ${it.packaging === 'Caja con ventana transparente' ? 'selected' : ''}>Caja con ventana transparente</option>
                </select>
              </div>
            </div>

            <div class="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-amber-200">
              <input type="checkbox" data-field="hasPaintKit" id="paint-kit-${it.id}"
                class="w-4 h-4 rounded text-cookie-500 focus:ring-cookie-400 border-gray-300" ${it.hasPaintKit ? 'checked' : ''}>
              <label for="paint-kit-${it.id}" class="text-xs font-semibold text-cocoa-900 cursor-pointer select-none">
                🎨 ¿Incluye kit de pintura comestible? (acuarelas y pinceles)
              </label>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-cocoa-900">Cantidad de combos</label>
                <input type="number" min="1" data-field="quantity"
                  class="w-full px-3.5 py-2 rounded-xl border border-[#DCD3C7] bg-white text-sm focus:border-cookie-500 outline-none"
                  value="${it.quantity || 1}">
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-bold text-cocoa-900">Precio por combo ($)</label>
                <input type="number" min="0" step="500" data-field="unitPrice"
                  class="w-full px-3.5 py-2 rounded-xl border border-[#DCD3C7] bg-white text-sm focus:border-cookie-500 outline-none"
                  value="${it.unitPrice || 14500}">
              </div>
            </div>
          </div>
        ` : `
          <!-- Campos para Individual -->
          <div class="space-y-3">
            <div class="space-y-1">
              <label class="block text-xs font-bold text-cocoa-900">
                Sabor o temática de la galleta <span class="text-red-500">*</span>
              </label>
              <input type="text" data-field="flavor"
                class="w-full px-3.5 py-2 rounded-xl border border-[#DCD3C7] bg-white text-sm focus:border-cookie-500 outline-none"
                placeholder="Ej: Vainilla Real Glaseada, Chispas de Chocolate, Limón..." value="${it.flavor || ''}">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-cocoa-900">Cantidad (unidades)</label>
                <input type="number" min="1" data-field="quantity"
                  class="w-full px-3.5 py-2 rounded-xl border border-[#DCD3C7] bg-white text-sm focus:border-cookie-500 outline-none"
                  value="${it.quantity || 12}">
              </div>
              <div class="space-y-1">
                <label class="block text-xs font-bold text-cocoa-900">Precio unitario ($)</label>
                <input type="number" min="0" step="100" data-field="unitPrice"
                  class="w-full px-3.5 py-2 rounded-xl border border-[#DCD3C7] bg-white text-sm focus:border-cookie-500 outline-none"
                  value="${it.unitPrice || 1200}">
              </div>
            </div>
          </div>
        `}

        <!-- Pie de Ítem con Subtotal Renglón -->
        <div class="flex items-center justify-between pt-2 border-t ${isCombo ? 'border-amber-200' : 'border-[#EDE5DA]'} text-xs">
          <span class="text-[#7A6A60] font-medium">Subtotal de este ítem:</span>
          <span class="font-bold text-sm text-cookie-700">${format(subtotal)}</span>
        </div>
      </div>
    `;
  }).join('');

  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

function syncItemsFromDom() {
  if (typeof document === 'undefined') return;
  const cards = document.querySelectorAll('.order-item-card');
  cards.forEach(card => {
    const id = card.getAttribute('data-item-id');
    const item = currentOrderItems.find(it => it.id === id);
    if (!item) return;

    const flavorInput = card.querySelector('input[data-field="flavor"]');
    if (flavorInput) item.flavor = flavorInput.value;

    const comboNameInput = card.querySelector('input[data-field="comboName"]');
    if (comboNameInput) item.comboName = comboNameInput.value;

    const cookiesCountInput = card.querySelector('input[data-field="cookiesCount"]');
    if (cookiesCountInput) item.cookiesCount = Number(cookiesCountInput.value) || 6;

    const packagingSelect = card.querySelector('select[data-field="packaging"]');
    if (packagingSelect) item.packaging = packagingSelect.value;

    const paintKitCheck = card.querySelector('input[data-field="hasPaintKit"]');
    if (paintKitCheck) item.hasPaintKit = paintKitCheck.checked;

    const qtyInput = card.querySelector('input[data-field="quantity"]');
    if (qtyInput) item.quantity = Math.max(1, Number(qtyInput.value) || 1);

    const priceInput = card.querySelector('input[data-field="unitPrice"]');
    if (priceInput) item.unitPrice = Math.max(0, Number(priceInput.value) || 0);

    item.subtotal = Math.round(item.quantity * item.unitPrice);
  });
}

function addItemToOrder() {
  syncItemsFromDom();
  const lastItem = currentOrderItems[currentOrderItems.length - 1];
  const nextType = lastItem ? lastItem.type : 'individual';
  const newItem = createDefaultItem(nextType, Date.now());

  if (nextType === 'combo' && lastItem) {
    newItem.comboName = lastItem.comboName || '';
    newItem.packaging = lastItem.packaging || 'Caja decorativa con lazo';
    newItem.hasPaintKit = lastItem.hasPaintKit !== undefined ? lastItem.hasPaintKit : true;
    newItem.unitPrice = lastItem.unitPrice || 14500;
  }
  currentOrderItems.push(newItem);
  renderOrderItems();
  updateLiveSummary();
}

function removeItemFromOrder(id) {
  if (currentOrderItems.length <= 1) return;
  syncItemsFromDom();
  currentOrderItems = currentOrderItems.filter(it => it.id !== id);
  renderOrderItems();
  updateLiveSummary();
}

function setItemType(id, type) {
  syncItemsFromDom();
  const item = currentOrderItems.find(it => it.id === id);
  if (item) {
    item.type = type;
    if (type === 'combo') {
      item.comboName = item.comboName || 'Combo Especial';
      item.cookiesCount = item.cookiesCount || 6;
      item.packaging = item.packaging || 'Caja decorativa con lazo';
      item.hasPaintKit = item.hasPaintKit !== undefined ? item.hasPaintKit : true;
      item.unitPrice = item.unitPrice || 14500;
      item.quantity = item.quantity || 1;
    } else {
      item.flavor = item.flavor || 'Vainilla Real';
      item.unitPrice = item.unitPrice || 1200;
      item.quantity = item.quantity || 12;
    }
  }
  renderOrderItems();
  updateLiveSummary();
}

function extractItemsFromForm() {
  syncItemsFromDom();
  return currentOrderItems.map(it => ({ ...it }));
}

function setOrderType(type) {
  if (currentOrderItems.length > 0) {
    setItemType(currentOrderItems[0].id, type);
  }
}

function updateLiveSummary() {
  if (typeof document === 'undefined') return;

  syncItemsFromDom();
  let total = 0;
  for (const it of currentOrderItems) {
    total += Math.round((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0));
  }

  const paymentStatus = document.getElementById('payment-status')?.value || 'Pendiente';
  const depositInput = document.getElementById('deposit-amount');
  const depositAmount = Number(depositInput?.value) || 0;

  const calc = (OrdersHelper ? OrdersHelper.calcularSaldoPendiente : (t, a) => ({ total: t, abono: a, saldo: t - a }))(total, depositAmount, paymentStatus);

  const format = OrdersHelper ? OrdersHelper.formatearMoneda : m => `$${m}`;

  const elTotal = document.getElementById('summary-total');
  const elDeposit = document.getElementById('summary-deposit');
  const elBalance = document.getElementById('summary-balance');

  if (elTotal) elTotal.textContent = format(calc.total);
  if (elDeposit) elDeposit.textContent = format(calc.abono);
  if (elBalance) elBalance.textContent = format(calc.saldo);
}

function resetForm() {
  if (typeof document === 'undefined') return;
  const form = document.getElementById('order-form');
  if (!form) return;

  form.reset();
  document.getElementById('order-id').value = '';
  document.getElementById('order-mode').value = 'create';
  document.getElementById('form-title').textContent = 'Registrar Nuevo Pedido';
  document.getElementById('form-subtitle').textContent = 'Completa los datos de entrega y agrega los artículos individuales o combos que el cliente requiere.';
  document.getElementById('badge-edit-mode').classList.add('hidden');

  const manana = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const y = manana.getFullYear();
  const m = String(manana.getMonth() + 1).padStart(2, '0');
  const d = String(manana.getDate()).padStart(2, '0');
  const dateInput = document.getElementById('delivery-date');
  if (dateInput) dateInput.value = `${y}-${m}-${d}`;
  
  const timeInput = document.getElementById('delivery-time');
  if (timeInput) timeInput.value = '15:00';

  currentOrderItems = [createDefaultItem('individual', '1')];
  renderOrderItems();
  toggleDepositContainer();
  updateLiveSummary();
}

function populateForm(order) {
  if (typeof document === 'undefined' || !order) return;

  document.getElementById('order-id').value = order.id || '';
  document.getElementById('order-mode').value = 'edit';
  document.getElementById('form-title').textContent = `Editar Pedido ${order.id}`;
  document.getElementById('form-subtitle').textContent = 'Modifica los datos del pedido y presiona Guardar para actualizar.';
  document.getElementById('badge-edit-mode').classList.remove('hidden');

  document.getElementById('customer-name').value = order.customer?.name || '';
  document.getElementById('customer-phone').value = order.customer?.phone || '';
  document.getElementById('customer-email').value = order.customer?.email || '';

  document.getElementById('delivery-date').value = order.dates?.deliveryDate || '';
  document.getElementById('delivery-time').value = order.dates?.deliveryTime || '';

  const ord = (OrdersHelper && typeof OrdersHelper.normalizeOrder === 'function') ? OrdersHelper.normalizeOrder(order) : order;
  currentOrderItems = (ord.items && ord.items.length > 0)
    ? ord.items.map(it => ({ ...it }))
    : [createDefaultItem(order.orderType || 'individual', '1')];

  renderOrderItems();

  document.getElementById('order-notes').value = order.notes || '';
  document.getElementById('order-status').value = order.status || 'Pendiente';
  document.getElementById('payment-status').value = order.payment?.status || 'Pendiente';
  document.getElementById('deposit-amount').value = order.payment?.depositAmount || 0;

  toggleDepositContainer();
  updateLiveSummary();
  switchView('view-form');
}

function toggleDepositContainer() {
  if (typeof document === 'undefined') return;
  const paymentStatus = document.getElementById('payment-status')?.value;
  const depositContainer = document.getElementById('deposit-amount-container');
  if (!depositContainer) return;

  if (paymentStatus === 'Abono/Seña') {
    depositContainer.classList.remove('hidden');
  } else {
    depositContainer.classList.add('hidden');
  }
}

// Exportación dual
const UIModule = {
  validateOrderInput,
  extractOrderFromInputs,
  renderOrderCardHtml,
  renderPlanningView,
  renderAllOrdersView,
  renderProductionView,
  openReceiptModal,
  openSettingsModal,
  openRestoreModal,
  updateBusinessBranding,
  downloadFile,
  openDetailModal,
  showToast,
  switchView,
  setOrderType,
  createDefaultItem,
  renderOrderItems,
  addItemToOrder,
  removeItemFromOrder,
  setItemType,
  syncItemsFromDom,
  extractItemsFromForm,
  updateLiveSummary,
  resetForm,
  populateForm,
  toggleDepositContainer
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIModule;
}

if (typeof window !== 'undefined') {
  window.UI = UIModule;
}
