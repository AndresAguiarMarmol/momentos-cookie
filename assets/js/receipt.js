/**
 * assets/js/receipt.js
 * Generador de comprobantes / remitos de entrega para Momentos Cookie.
 * Formateado limpio para impresión térmica o papel A4/media carta.
 */

function formatearMonedaTicket(monto, simbolo = '$') {
  const num = Math.round(Number(monto) || 0);
  return `${simbolo}${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

function formatearResumenPagoTicket(payment = {}, simboloMoneda = '$') {
  const total = Math.max(0, Number(payment.total) || 0);
  let abono = Math.max(0, Number(payment.depositAmount) || 0);

  if (payment.status === 'Pagado total') {
    abono = total;
  }

  const saldo = Math.max(0, total - abono);
  const esPagadoTotal = saldo === 0 || payment.status === 'Pagado total';

  return {
    totalFormatted: formatearMonedaTicket(total, simboloMoneda),
    abonoFormatted: formatearMonedaTicket(abono, simboloMoneda),
    saldoFormatted: formatearMonedaTicket(saldo, simboloMoneda),
    saldo,
    esPagadoTotal
  };
}

function generarTicketEntregaHtml(order, settings = {}) {
  if (!order) return '';

  const businessName = settings.businessName || 'Momentos Cookie';
  const phone = settings.phone || '+56 9 1234 5678';
  const footerMessage = settings.footerMessage || '¡Gracias por endulzar tus momentos con nosotros!';
  const currencySymbol = settings.currencySymbol || '$';

  const pago = formatearResumenPagoTicket(order.payment, currencySymbol);
  const isCombo = order.orderType === 'combo';

  const items = (Array.isArray(order.items) && order.items.length > 0)
    ? order.items
    : [
        isCombo
          ? {
              type: 'combo',
              comboName: order.details?.comboName || 'Combo Especial',
              quantity: order.details?.quantity || 1,
              cookiesCount: order.details?.cookiesCount || 6,
              packaging: order.details?.packaging || 'Caja decorativa',
              hasPaintKit: Boolean(order.details?.hasPaintKit),
              unitPrice: order.details?.unitPrice || 0,
              subtotal: order.details?.subtotal || 0
            }
          : {
              type: 'individual',
              flavor: order.details?.flavor || 'Galletas Artesanales',
              quantity: order.details?.quantity || 12,
              unitPrice: order.details?.unitPrice || 0,
              subtotal: order.details?.subtotal || 0
            }
      ];

  const productoHtml = items.map((it, idx) => {
    const isComboItem = it.type === 'combo';
    const subtotalFormatted = formatearMonedaTicket(
      it.subtotal !== undefined ? it.subtotal : (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
      currencySymbol
    );
    const borderStyle = idx > 0 ? 'border-top: 1px dotted #e5e5e5; padding-top: 6px; margin-top: 6px;' : '';

    if (isComboItem) {
      return `
        <div style="margin-bottom: 6px; ${borderStyle}">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-weight: bold; font-size: 13px;">${it.comboName || 'Combo Especial'}</span>
            <span style="font-weight: bold; font-size: 13px;">${subtotalFormatted}</span>
          </div>
          <div style="font-size: 12px; color: #555;">
            ${it.quantity || 1} combo(s) · ${it.cookiesCount || 6} galletas c/u · Empaque: ${it.packaging || 'Caja decorativa'}
          </div>
          ${it.hasPaintKit ? '<div style="font-size: 11px; font-weight: bold; color: #9A3412; margin-top: 2px;">🎨 Incluye kit de pintura comestible y pinceles</div>' : ''}
        </div>
      `;
    } else {
      return `
        <div style="margin-bottom: 6px; ${borderStyle}">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <span style="font-weight: bold; font-size: 13px;">${it.flavor || 'Galletas Artesanales'}</span>
            <span style="font-weight: bold; font-size: 13px;">${subtotalFormatted}</span>
          </div>
          <div style="font-size: 12px; color: #555;">
            ${it.quantity || 12} unidades individuales (${formatearMonedaTicket(it.unitPrice || 0, currencySymbol)} c/u)
          </div>
        </div>
      `;
    }
  }).join('');

  let notasHtml = '';
  if (order.notes && order.notes.trim()) {
    notasHtml = `
      <div style="border-top: 1px dashed #ccc; padding-top: 8px; margin-top: 8px;">
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #7B3615;">Notas de diseño / Alergias:</div>
        <div style="font-size: 12px; font-style: italic; background: #FFF7ED; padding: 6px; border-radius: 4px; margin-top: 4px; border: 1px solid #FFEDD5;">
          "${order.notes.trim()}"
        </div>
      </div>
    `;
  }

  let pagoHtml = '';
  if (pago.esPagadoTotal) {
    pagoHtml = `
      <div style="border: 2px solid #16A34A; background: #F0FDF4; color: #166534; padding: 8px; text-align: center; border-radius: 6px; font-weight: bold; font-size: 13px; margin-top: 10px;">
        ✓ PAGADO AL 100% (Total: ${pago.totalFormatted})
      </div>
    `;
  } else {
    pagoHtml = `
      <div style="border-top: 1px dashed #ccc; padding-top: 8px; margin-top: 8px; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span>Total del pedido:</span>
          <span style="font-weight: bold;">${pago.totalFormatted}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px; color: #166534;">
          <span>Abono registrado:</span>
          <span>-${pago.abonoFormatted}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; color: #9A3412; border-top: 1px solid #ddd; padding-top: 4px; margin-top: 4px;">
          <span>SALDO POR COBRAR:</span>
          <span>${pago.saldoFormatted}</span>
        </div>
      </div>
    `;
  }

  return `
    <div id="printable-receipt" style="max-width: 380px; margin: 0 auto; padding: 16px; font-family: monospace, sans-serif; color: #2D241E; background: #FFF; border: 1px dashed #DCD3C7; border-radius: 8px;">
      
      <!-- Encabezado del Negocio -->
      <div style="text-align: center; border-bottom: 2px solid #2D241E; padding-bottom: 10px; margin-bottom: 10px;">
        <div style="font-size: 18px; font-weight: bold; letter-spacing: -0.5px;">🍪 ${businessName}</div>
        <div style="font-size: 11px; color: #666; margin-top: 2px;">Repostería Artesanal & Galletas de Diseño</div>
        ${phone ? `<div style="font-size: 11px; font-weight: bold; color: #555; margin-top: 2px;">Tel / WhatsApp: ${phone}</div>` : ''}
      </div>

      <!-- Datos de la Orden -->
      <div style="font-size: 12px; margin-bottom: 10px; line-height: 1.4;">
        <div style="display: flex; justify-content: space-between;">
          <span>Pedido: <strong style="font-size: 13px;">${order.id}</strong></span>
          <span style="font-size: 11px; color: #666;">${order.dates?.deliveryDate || ''}</span>
        </div>
        <div style="margin-top: 4px;">
          <strong>Cliente:</strong> ${order.customer?.name || 'Cliente'}
        </div>
        ${order.customer?.phone ? `<div><strong>Teléfono:</strong> ${order.customer.phone}</div>` : ''}
        ${order.dates?.deliveryTime ? `<div><strong>Hora entrega:</strong> ${order.dates.deliveryTime} hrs</div>` : ''}
      </div>

      <!-- Desglose de Productos -->
      <div style="border-top: 1px dashed #ccc; padding-top: 10px; margin-top: 10px;">
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #7B3615; margin-bottom: 6px;">Detalle de Producción:</div>
        ${productoHtml}
      </div>

      <!-- Notas / Alergias -->
      ${notasHtml}

      <!-- Resumen Financiero -->
      ${pagoHtml}

      <!-- Mensaje de Agradecimiento -->
      <div style="text-align: center; border-top: 2px solid #2D241E; padding-top: 10px; margin-top: 14px; font-size: 11px; color: #666; font-style: italic;">
        "${footerMessage}"
      </div>
    </div>
  `;
}

// Exportación dual
const ReceiptModule = {
  generarTicketEntregaHtml,
  formatearResumenPagoTicket
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReceiptModule;
}

if (typeof window !== 'undefined') {
  window.Receipt = ReceiptModule;
}

