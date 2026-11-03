const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');

test('T1.1: index.html declara viewport-fit=cover para safe areas en iPhone', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  assert.match(html, /<meta\s+name=["']viewport["'][^>]*viewport-fit=cover/i, 'index.html debe incluir viewport-fit=cover en el meta viewport');
});

test('T1.2: index.html incluye metaetiquetas obligatorias de Apple para Web App standalone', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  assert.match(html, /<meta\s+name=["']apple-mobile-web-app-capable["']\s+content=["']yes["']/i, 'Debe incluir apple-mobile-web-app-capable="yes"');
  assert.match(html, /<meta\s+name=["']apple-mobile-web-app-status-bar-style["']/i, 'Debe incluir apple-mobile-web-app-status-bar-style');
  assert.match(html, /<meta\s+name=["']apple-mobile-web-app-title["']\s+content=["']Momentos Cookie["']/i, 'Debe incluir apple-mobile-web-app-title="Momentos Cookie"');
});

test('T1.3: index.html declara apple-touch-icon apuntando a assets/img/logo.jpg', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  assert.match(html, /<link\s+[^>]*rel=["']apple-touch-icon["'][^>]*href=["']assets\/img\/logo\.jpg["']/i, 'Debe incluir apple-touch-icon apuntando a assets/img/logo.jpg');
});

test('T1.4: assets/css/custom.css implementa soporte para safe-area-inset de iOS', () => {
  const css = fs.readFileSync(path.join(ROOT_DIR, 'assets', 'css', 'custom.css'), 'utf-8');
  assert.match(css, /env\(safe-area-inset-top/i, 'custom.css debe incluir env(safe-area-inset-top)');
  assert.match(css, /env\(safe-area-inset-bottom/i, 'custom.css debe incluir env(safe-area-inset-bottom)');
});

test('T1.5: manifest.json está configurado para modo standalone con alcance y arranque definidos', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'manifest.json'), 'utf-8'));
  assert.equal(manifest.display, 'standalone', 'manifest.json debe tener display: standalone');
  assert.equal(manifest.start_url, './index.html', 'manifest.json debe tener start_url ./index.html');
  assert.ok(manifest.scope, 'manifest.json debe definir scope');
  assert.equal(manifest.short_name, 'Momentos Cookie', 'manifest.json debe tener short_name "Momentos Cookie"');
});

test('T1.6: sw.js incluye todos los módulos y el logotipo oficial en ASSETS_TO_CACHE con versión v2', () => {
  const swCode = fs.readFileSync(path.join(ROOT_DIR, 'sw.js'), 'utf-8');
  assert.match(swCode, /momentos-cookie-v2/i, 'sw.js debe usar versión de caché v2');
  assert.match(swCode, /assets\/img\/logo\.jpg/i, 'sw.js debe cachear assets/img/logo.jpg');
  assert.match(swCode, /assets\/js\/production\.js/i, 'sw.js debe cachear production.js');
  assert.match(swCode, /assets\/js\/receipt\.js/i, 'sw.js debe cachear receipt.js');
});

test('T1.7: index.html incluye guía explicativa para instalación en iPhone en el modal de ajustes', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  assert.match(html, /modal-settings/i, 'Debe existir modal-settings');
  assert.match(html, /iPhone|iOS/i, 'Debe mencionar instrucciones para iPhone o iOS');
  assert.match(html, /Agregar a inicio/i, 'Debe indicar cómo agregar a pantalla de inicio');
});
