const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');

test('T1.1: El documento index.html contiene un elemento semántico <footer>', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  assert.match(html, /<footer[\s\S]*?<\/footer>/i, 'Debe existir un elemento <footer> en index.html');
});

test('T1.2: El <footer> contiene los créditos completos con versión y fecha actual (26.11 / Noviembre 2026)', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/i);
  assert.ok(footerMatch, 'El footer debe existir');
  const footerHtml = footerMatch[0];
  
  // Debe contener: Análisis/Diseño de Andres Aguiar V 26.11 Santiago de Chile (Noviembre 2026)
  assert.match(
    footerHtml,
    /Análisis\/Diseño\s+de\s+Andres\s+Aguiar\s+V\s+26\.11\s+Santiago\s+de\s+Chile\s+\(Noviembre\s+2026\)/i,
    'El footer debe contener el texto de análisis/diseño con fecha 26.11 y (Noviembre 2026)'
  );
});

test('T1.3: El <footer> contiene enlaces interactivos a Contacto telefónico y WhatsApp', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/i);
  assert.ok(footerMatch, 'El footer debe existir');
  const footerHtml = footerMatch[0];

  // Enlace telefónico tel:+56933395447
  assert.match(
    footerHtml,
    /href=["']tel:\+56933395447["'][\s\S]*?\+56933395447/i,
    'Debe existir enlace tel:+56933395447'
  );
  assert.match(footerHtml, /Contacto/i, 'Debe incluir la etiqueta Contacto');

  // Enlace WhatsApp https://wa.me/56933395447
  assert.match(
    footerHtml,
    /href=["']https:\/\/wa\.me\/56933395447["'][\s\S]*?\+56933395447/i,
    'Debe existir enlace https://wa.me/56933395447'
  );
  assert.match(footerHtml, /Whatsapp/i, 'Debe incluir la etiqueta Whatsapp');
});
