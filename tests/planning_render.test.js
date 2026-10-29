const test = require('node:test');
const assert = require('node:assert/strict');
const {
  renderOrderCardHtml
} = require('../assets/js/ui.js');

test('Renderizado de tarjeta de pedido en HTML con atributos y clases de semáforo', () => {
  const pedidoUrgente = {
    id: 'MC-20261028-100',
    customer: { name: 'Ignacio Silva', phone: '+56911223344' },
    dates: { deliveryDate: '2026-10-28', deliveryTime: '15:00' },
    orderType: 'combo',
    details: {
      comboName: 'Kit Pintura Dulce',
      cookiesCount: 6,
      packaging: 'Caja decorativa',
      hasPaintKit: true,
      quantity: 2,
      subtotal: 29000
    },
    notes: 'Temática espacial',
    status: 'En producción',
    payment: { total: 29000, status: 'Abono/Seña', depositAmount: 15000 }
  };

  const html = renderOrderCardHtml(pedidoUrgente, { categoriaSemaforo: 'urgente_hoy' });

  // Verificaciones de contenido
  assert.match(html, /MC-20261028-100/, 'Debe contener el código del pedido');
  assert.match(html, /Ignacio Silva/, 'Debe contener el nombre del cliente');
  assert.match(html, /Kit Pintura Dulce/, 'Debe indicar el nombre del combo');
  assert.match(html, /Kit de pintura/i, 'Debe indicar que incluye kit de pintura');
  assert.match(html, /En producción/, 'Debe indicar el estado actual');
  assert.match(html, /wa\.me\/56911223344/, 'Debe contener el enlace de WhatsApp preformateado');

  // Verificación de semáforo visual
  assert.match(html, /order-card-warning|badge-urgente/, 'Debe contener la clase o distintivo de urgente');

  // Verificación de botones de acción rápida
  assert.match(html, /data-action=["']status-next["']|data-action=["']quick-status["']/, 'Debe tener botón de acción rápida de estado');
});

test('Renderizado de pedido atrasado con alerta visual roja', () => {
  const pedidoAtrasado = {
    id: 'MC-20261025-050',
    customer: { name: 'Beatriz Peña', phone: '98765432' },
    dates: { deliveryDate: '2026-10-25', deliveryTime: '10:00' },
    orderType: 'individual',
    details: { flavor: 'Vainilla Glaseada', quantity: 12, subtotal: 14400 },
    status: 'Pendiente',
    payment: { total: 14400, status: 'Pendiente', depositAmount: 0 }
  };

  const html = renderOrderCardHtml(pedidoAtrasado, { categoriaSemaforo: 'atrasado' });

  assert.match(html, /order-card-urgent|badge-atrasado/, 'Debe contener indicador visual de atrasado');
  assert.match(html, /Pendiente/, 'Debe mostrar el estado Pendiente');
});

