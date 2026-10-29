/**
 * assets/js/orders.js
 * Lógica de negocio pura para Momentos Cookie (cálculos, semáforo, ordenamiento y búsqueda).
 * Funciones desacopladas del DOM y testeables de forma determinista.
 */

function calcularSubtotal(cantidad, precioUnitario) {
  const cant = Math.max(0, Number(cantidad) || 0);
  const precio = Math.max(0, Number(precioUnitario) || 0);
  return Math.round(cant * precio);
}

function calcularSaldoPendiente(total, montoAbono, estadoPago) {
  const totalLimpio = Math.max(0, Math.round(Number(total) || 0));

  if (estadoPago === 'Pagado total') {
    return {
      total: totalLimpio,
      abono: totalLimpio,
      saldo: 0
    };
  }

  if (estadoPago === 'Abono/Seña') {
    const abonoLimpio = Math.min(totalLimpio, Math.max(0, Math.round(Number(montoAbono) || 0)));
    return {
      total: totalLimpio,
      abono: abonoLimpio,
      saldo: totalLimpio - abonoLimpio
    };
  }

  // Estado 'Pendiente' u otro
  return {
    total: totalLimpio,
    abono: 0,
    saldo: totalLimpio
  };
}

function clasificarPedidoPorUrgencia(fechaEntrega, horaEntrega, estadoPedido, hoy = new Date()) {
  if (estadoPedido === 'Entregado' || estadoPedido === 'Cancelado') {
    return 'finalizado';
  }

  if (!fechaEntrega) {
    return 'proximas';
  }

  const [y, m, d] = fechaEntrega.split('-').map(Number);
  const [h, min] = (horaEntrega && horaEntrega.trim() ? horaEntrega.trim() : '23:59').split(':').map(Number);

  const target = new Date(y, (m || 1) - 1, d || 1, isNaN(h) ? 23 : h, isNaN(min) ? 59 : min, 0, 0);
  const diffMs = target.getTime() - hoy.getTime();

  if (diffMs < 0) {
    return 'atrasado';
  }

  if (diffMs <= 24 * 60 * 60 * 1000) {
    return 'urgente_hoy';
  }

  if (diffMs <= 7 * 24 * 60 * 60 * 1000) {
    return 'esta_semana';
  }

  return 'proximas';
}

function ordenarPedidosPorFecha(pedidos = []) {
  return [...pedidos].sort((a, b) => {
    const fechaA = (a.dates && a.dates.deliveryDate) || '9999-12-31';
    const horaA = (a.dates && a.dates.deliveryTime && a.dates.deliveryTime.trim()) || '23:59';
    const fechaB = (b.dates && b.dates.deliveryDate) || '9999-12-31';
    const horaB = (b.dates && b.dates.deliveryTime && b.dates.deliveryTime.trim()) || '23:59';

    const [yA, mA, dA] = fechaA.split('-').map(Number);
    const [hA, minA] = horaA.split(':').map(Number);
    const timeA = new Date(yA, (mA || 1) - 1, dA || 1, hA || 0, minA || 0).getTime();

    const [yB, mB, dB] = fechaB.split('-').map(Number);
    const [hB, minB] = horaB.split(':').map(Number);
    const timeB = new Date(yB, (mB || 1) - 1, dB || 1, hB || 0, minB || 0).getTime();

    return timeA - timeB;
  });
}

function agruparPedidosPorSemaforo(pedidos = [], hoy = new Date()) {
  const grupos = {
    atrasados: [],
    urgenteHoy: [],
    estaSemana: [],
    proximas: []
  };

  const ordenados = ordenarPedidosPorFecha(pedidos);

  for (const pedido of ordenados) {
    const fecha = (pedido.dates && pedido.dates.deliveryDate) || '';
    const hora = (pedido.dates && pedido.dates.deliveryTime) || '';
    const categoria = clasificarPedidoPorUrgencia(fecha, hora, pedido.status, hoy);

    if (categoria === 'atrasado') {
      grupos.atrasados.push(pedido);
    } else if (categoria === 'urgente_hoy') {
      grupos.urgenteHoy.push(pedido);
    } else if (categoria === 'esta_semana') {
      grupos.estaSemana.push(pedido);
    } else if (categoria === 'proximas') {
      grupos.proximas.push(pedido);
    }
  }

  return grupos;
}

function normalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function filtrarPedidos(pedidos = [], { textoBusqueda = '', estadoFiltro = 'todos' } = {}) {
  const termino = normalizarTexto(textoBusqueda);
  const soloDigitosTermino = termino.replace(/\D/g, '');

  return pedidos.filter(pedido => {
    // Filtro por estado
    if (estadoFiltro && estadoFiltro !== 'todos' && pedido.status !== estadoFiltro) {
      return false;
    }

    if (!termino) {
      return true;
    }

    // Filtro por texto en cliente, teléfono o ID
    const nombreNorm = normalizarTexto(pedido.customer && pedido.customer.name);
    const idNorm = normalizarTexto(pedido.id);
    const telefono = String((pedido.customer && pedido.customer.phone) || '');
    const telefonoDigitos = telefono.replace(/\D/g, '');

    const coincideNombre = nombreNorm.includes(termino);
    const coincideId = idNorm.includes(termino);
    const coincideTelefono = (soloDigitosTermino && telefonoDigitos.includes(soloDigitosTermino)) ||
                             normalizarTexto(telefono).includes(termino);

    return coincideNombre || coincideId || coincideTelefono;
  });
}

function generarIdPedido(secuencial = 1, fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const sec = String(secuencial).padStart(3, '0');
  return `MC-${anio}${mes}${dia}-${sec}`;
}

function construirEnlaceWhatsApp(telefono, cliente, codigoPedido, estadoPedido) {
  const digitos = String(telefono || '').replace(/\D/g, '');
  const mensaje = `¡Hola ${cliente || ''}! Te contactamos de Momentos Cookie respecto a tu pedido ${codigoPedido || ''}. El estado actual es: ${estadoPedido || 'Pendiente'}.`;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensaje)}`;
}

function formatearMoneda(monto, simbolo = '$') {
  const valor = Math.round(Number(monto) || 0);
  const formateado = valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${simbolo}${formateado}`;
}

// Exportación dual: CommonJS para pruebas Node.js y objeto global para el navegador
const OrdersModule = {
  calcularSubtotal,
  calcularSaldoPendiente,
  clasificarPedidoPorUrgencia,
  ordenarPedidosPorFecha,
  agruparPedidosPorSemaforo,
  normalizarTexto,
  filtrarPedidos,
  generarIdPedido,
  construirEnlaceWhatsApp,
  formatearMoneda
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = OrdersModule;
}

if (typeof window !== 'undefined') {
  window.Orders = OrdersModule;
}

