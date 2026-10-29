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
  const isCombo = inputs.orderType === 'combo';
  const calcSubtotal = OrdersHelper ? OrdersHelper.calcularSubtotal : (q, p) => q * p;
  const calcSaldo = OrdersHelper ? OrdersHelper.calcularSaldoPendiente : (t, a) => ({ total: t, abono: a, saldo: t - a });

  let quantity = 0;
  let unitPrice = 0;
  let subtotal = 0;
  let details = {};

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
    orderType: inputs.orderType || 'individual',
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
  if (order.orderType === 'combo') {
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

      <div class="space-y-2 border-t border-[#F0EAE1] pt-3">
        <h4 class="font-bold text-xs uppercase text-cookie-700 tracking-wider">Detalles del Producto</h4>
        ${isCombo ? `
          <div class="space-y-1">
            <div class="font-bold text-sm text-cocoa-900">${order.details?.comboName || 'Combo Especial'}</div>
            <div class="text-xs text-[#7A6A60]">${order.details?.quantity} combo(s) · ${order.details?.cookiesCount} galletas incluidas por combo</div>
            <div class="text-xs text-[#7A6A60]">Empaque: ${order.details?.packaging}</div>
            <div class="text-xs font-semibold ${order.details?.hasPaintKit ? 'text-amber-700' : 'text-gray-500'}">
              ${order.details?.hasPaintKit ? '🎨 Incluye kit de pintura comestible y pinceles' : 'Sin kit de pintura'}
            </div>
          </div>
        ` : `
          <div class="space-y-1">
            <div class="font-bold text-sm text-cocoa-900">${order.details?.flavor || 'Galletas Artesanales'}</div>
            <div class="text-xs text-[#7A6A60]">${order.details?.quantity} unidades individuales</div>
          </div>
        `}
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

function setOrderType(type) {
  if (typeof document === 'undefined') return;

  const btnIndividual = document.getElementById('btn-mode-individual');
  const btnCombo = document.getElementById('btn-mode-combo');
  const fieldsIndividual = document.getElementById('fields-individual');
  const fieldsCombo = document.getElementById('fields-combo');

  const radioInd = document.querySelector('input[name="orderType"][value="individual"]');
  const radioCombo = document.querySelector('input[name="orderType"][value="combo"]');

  if (type === 'combo') {
    if (radioCombo) radioCombo.checked = true;
    if (btnCombo) {
      btnCombo.classList.add('active');
      btnCombo.classList.remove('text-[#6B5A50]');
    }
    if (btnIndividual) {
      btnIndividual.classList.remove('active');
      btnIndividual.classList.add('text-[#6B5A50]');
    }
    if (fieldsIndividual) fieldsIndividual.classList.add('hidden');
    if (fieldsCombo) fieldsCombo.classList.remove('hidden');
  } else {
    if (radioInd) radioInd.checked = true;
    if (btnIndividual) {
      btnIndividual.classList.add('active');
      btnIndividual.classList.remove('text-[#6B5A50]');
    }
    if (btnCombo) {
      btnCombo.classList.remove('active');
      btnCombo.classList.add('text-[#6B5A50]');
    }
    if (fieldsIndividual) fieldsIndividual.classList.remove('hidden');
    if (fieldsCombo) fieldsCombo.classList.add('hidden');
  }

  updateLiveSummary();
}

function updateLiveSummary() {
  if (typeof document === 'undefined') return;

  const isCombo = document.querySelector('input[name="orderType"][value="combo"]')?.checked;
  let subtotal = 0;

  if (isCombo) {
    const qty = Number(document.getElementById('combo-quantity')?.value) || 1;
    const price = Number(document.getElementById('combo-price')?.value) || 0;
    subtotal = (OrdersHelper ? OrdersHelper.calcularSubtotal : (q, p) => q * p)(qty, price);
  } else {
    const qty = Number(document.getElementById('individual-quantity')?.value) || 1;
    const price = Number(document.getElementById('individual-price')?.value) || 0;
    subtotal = (OrdersHelper ? OrdersHelper.calcularSubtotal : (q, p) => q * p)(qty, price);
  }

  const paymentStatus = document.getElementById('payment-status')?.value || 'Pendiente';
  const depositInput = document.getElementById('deposit-amount');
  const depositAmount = Number(depositInput?.value) || 0;

  const calc = (OrdersHelper ? OrdersHelper.calcularSaldoPendiente : (t, a) => ({ total: t, abono: a, saldo: t - a }))(subtotal, depositAmount, paymentStatus);

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
  document.getElementById('form-subtitle').textContent = 'Completa los datos de entrega y selecciona entre galletas individuales o combos.';
  document.getElementById('badge-edit-mode').classList.add('hidden');

  const manana = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const y = manana.getFullYear();
  const m = String(manana.getMonth() + 1).padStart(2, '0');
  const d = String(manana.getDate()).padStart(2, '0');
  const dateInput = document.getElementById('delivery-date');
  if (dateInput) dateInput.value = `${y}-${m}-${d}`;
  
  const timeInput = document.getElementById('delivery-time');
  if (timeInput) timeInput.value = '15:00';

  setOrderType('individual');
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

  if (order.orderType === 'combo') {
    setOrderType('combo');
    document.getElementById('combo-name').value = order.details?.comboName || '';
    document.getElementById('combo-cookies-count').value = order.details?.cookiesCount || 6;
    document.getElementById('combo-packaging').value = order.details?.packaging || 'Caja decorativa con lazo';
    document.getElementById('combo-has-paint-kit').checked = Boolean(order.details?.hasPaintKit);
    document.getElementById('combo-quantity').value = order.details?.quantity || 1;
    document.getElementById('combo-price').value = order.details?.unitPrice || 14500;
  } else {
    setOrderType('individual');
    document.getElementById('individual-flavor').value = order.details?.flavor || '';
    document.getElementById('individual-quantity').value = order.details?.quantity || 12;
    document.getElementById('individual-price').value = order.details?.unitPrice || 1200;
  }

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
