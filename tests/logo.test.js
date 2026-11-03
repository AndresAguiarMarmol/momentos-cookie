const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const receiptModule = require('../assets/js/receipt.js');

test('T1.1: Archivo de imagen assets/img/logo.jpg existe y tiene tamaño válido', () => {
  const logoPath = path.join(ROOT_DIR, 'assets', 'img', 'logo.jpg');
  assert.ok(fs.existsSync(logoPath), 'assets/img/logo.jpg debe existir en el disco');
  const stats = fs.statSync(logoPath);
  assert.ok(stats.size > 1000, 'El archivo de imagen debe tener un tamaño válido (> 1KB)');
});

test('T2.1: index.html declara favicon apuntando a assets/img/logo.jpg', () => {
  const indexPath = path.join(ROOT_DIR, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf-8');
  assert.match(html, /<link\s+[^>]*rel=["']icon["'][^>]*href=["']assets\/img\/logo\.jpg["']/i, 'index.html debe tener <link rel="icon" ... href="assets/img/logo.jpg">');
});

test('T2.2: index.html incluye el logotipo oficial en el header con alt="Momentos Cookie"', () => {
  const indexPath = path.join(ROOT_DIR, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf-8');
  assert.match(html, /<header[\s\S]*?<img\s+[^>]*src=["']assets\/img\/logo\.jpg["'][^>]*alt=["']Momentos Cookie["']/i, 'El header debe incluir la imagen del logotipo oficial');
});

test('T2.3: manifest.json referencia assets/img/logo.jpg en sus iconos', () => {
  const manifestPath = path.join(ROOT_DIR, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const hasLogo = manifest.icons && manifest.icons.some(icon => icon.src === 'assets/img/logo.jpg');
  assert.ok(hasLogo, 'manifest.json debe incluir assets/img/logo.jpg en su lista de iconos');
});

test('T3.1: generarTicketEntregaHtml incluye el logotipo oficial en el comprobante', () => {
  const sampleOrder = {
    id: 'MC-TEST-001',
    customer: { name: 'Test Cliente', phone: '+56911112222' },
    dates: { deliveryDate: '2026-11-05', deliveryTime: '16:00' },
    orderType: 'individual',
    items: [
      { type: 'individual', flavor: 'Vainilla', quantity: 12, unitPrice: 1000, subtotal: 12000 }
    ],
    payment: { totalAmount: 12000, depositAmount: 12000, status: 'Pagado total' }
  };
  const ticketHtml = receiptModule.generarTicketEntregaHtml(sampleOrder);
  assert.match(ticketHtml, /<img\s+[^>]*src=["']assets\/img\/logo\.jpg["']/i, 'El ticket generado debe contener la imagen del logotipo');
});

