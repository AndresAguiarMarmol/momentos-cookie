const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const indexPath = path.join(__dirname, '..', 'index.html');
const cssPath = path.join(__dirname, '..', 'assets', 'css', 'custom.css');

test('Estructura semántica de index.html para Momentos Cookie', () => {
  assert.ok(fs.existsSync(indexPath), 'index.html debe existir');
  const html = fs.readFileSync(indexPath, 'utf-8');

  // Identidad y branding
  assert.match(html, /Momentos Cookie/i, 'Debe incluir el título o branding de Momentos Cookie');

  // Vistas de la SPA (incluyendo producción y métricas)
  assert.match(html, /id=["']view-planning["']/, 'Debe contener la vista #view-planning');
  assert.match(html, /id=["']view-orders["']/, 'Debe contener la vista #view-orders');
  assert.match(html, /id=["']view-form["']/, 'Debe contener la vista #view-form');
  assert.match(html, /id=["']view-production["']/, 'Debe contener la vista #view-production');
  assert.match(html, /id=["']tab-production["']/, 'Debe contener el botón tab-production');

  // Herramientas de respaldo y exportación
  assert.match(html, /id=["']btn-export-json["']/, 'Debe contener botón exportar JSON');
  assert.match(html, /id=["']btn-export-csv["']/, 'Debe contener botón exportar CSV');
  assert.match(html, /id=["']btn-import-json["']/, 'Debe contener botón importar JSON');

  // Formulario y campos clave
  assert.match(html, /id=["']order-form["']/, 'Debe contener el formulario #order-form');
  assert.match(html, /id=["']customer-name["']/, 'Debe contener campo customer-name');
  assert.match(html, /id=["']customer-phone["']/, 'Debe contener campo customer-phone');
  assert.match(html, /id=["']delivery-date["']/, 'Debe contener campo delivery-date');
  assert.match(html, /id=["']order-type["']|name=["']orderType["']/, 'Debe contener selector de modalidad');

  // Modales nativos <dialog>
  assert.match(html, /<dialog[^>]*id=["']modal-delete["']/, 'Debe contener diálogo nativo modal-delete');
  assert.match(html, /<dialog[^>]*id=["']modal-detail["']/, 'Debe contener diálogo nativo modal-detail');
  assert.match(html, /<dialog[^>]*id=["']modal-receipt["']/, 'Debe contener diálogo nativo modal-receipt');
  assert.match(html, /<dialog[^>]*id=["']modal-settings["']/, 'Debe contener diálogo nativo modal-settings');

  // Scripts modulares en orden
  assert.match(html, /src=["'][^"']*orders\.js["']/, 'Debe incluir orders.js');
  assert.match(html, /src=["'][^"']*production\.js["']/, 'Debe incluir production.js');
  assert.match(html, /src=["'][^"']*receipt\.js["']/, 'Debe incluir receipt.js');
  assert.match(html, /src=["'][^"']*storage\.js["']/, 'Debe incluir storage.js');
  assert.match(html, /src=["'][^"']*ui\.js["']/, 'Debe incluir ui.js');
  assert.match(html, /src=["'][^"']*main\.js["']/, 'Debe incluir main.js');
});

test('Estilos de taller y semáforo en assets/css/custom.css', () => {
  assert.ok(fs.existsSync(cssPath), 'custom.css debe existir');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // Verificación de ergonomía táctil (mínimo 44px)
  assert.match(css, /min-height:\s*44px|min-w-\[44px\]|touch-target/, 'Debe contener directivas ergonómicas de toque (>= 44px)');

  // Clases o tokens de semáforo de urgencia
  assert.match(css, /badge-atrasado|urgente|semaforo/, 'Debe incluir estilos para el semáforo de entregas');
});

