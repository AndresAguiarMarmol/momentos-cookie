const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');

test('T1.1: Barra de navegación tiene variantes compactas para móvil y extendidas para PC', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  assert.match(html, /<button[^>]*id=["']tab-planning["'][\s\S]*?sm:hidden[\s\S]*?hidden sm:inline/i, 'tab-planning debe tener versión móvil y escritorio');
  assert.match(html, /<button[^>]*id=["']tab-orders["'][\s\S]*?sm:hidden[\s\S]*?hidden sm:inline/i, 'tab-orders debe tener versión móvil y escritorio');
  assert.match(html, /<button[^>]*id=["']tab-production["'][\s\S]*?sm:hidden[\s\S]*?hidden sm:inline/i, 'tab-production debe tener versión móvil y escritorio');
  assert.match(html, /<button[^>]*id=["']tab-form["'][\s\S]*?sm:hidden[\s\S]*?hidden sm:inline/i, 'tab-form debe tener versión móvil y escritorio');
  assert.match(html, /<button[^>]*id=["']btn-nav-pending-balance["'][\s\S]*?sm:hidden[\s\S]*?hidden sm:inline/i, 'btn-nav-pending-balance debe tener versión móvil y escritorio');
});

test('T1.2: Bloques del semáforo de planificación tienen títulos adaptativos con sm:hidden', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  assert.match(html, /id=["']group-atrasados["'][\s\S]*?Atrasados \/ Urgentes[\s\S]*?hidden sm:inline/i, 'group-atrasados debe incluir versión compacta y extendida');
  assert.match(html, /id=["']group-hoy["'][\s\S]*?sm:hidden[\s\S]*?hidden sm:inline/i, 'group-hoy debe incluir versión compacta y extendida');
  assert.match(html, /id=["']group-esta-semana["'][\s\S]*?sm:hidden[\s\S]*?hidden sm:inline/i, 'group-esta-semana debe incluir versión compacta y extendida');
});

test('T1.3: Modales principales tienen títulos adaptativos con versión móvil compacta', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  assert.match(html, /<dialog[^>]*id=["']modal-settings["'][\s\S]*?sm:hidden[\s\S]*?hidden sm:inline/i, 'modal-settings debe tener variante responsiva');
  assert.match(html, /<dialog[^>]*id=["']modal-restore["'][\s\S]*?sm:hidden[\s\S]*?hidden sm:inline/i, 'modal-restore debe tener variante responsiva');
});
