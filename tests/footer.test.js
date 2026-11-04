const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');

test('T1.1: El documento index.html contiene un elemento semántico <footer>', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  assert.match(html, /<footer[\s\S]*?<\/footer>/i, 'Debe existir un elemento <footer> en index.html');
});

test('T1.2: El <footer> contiene los créditos completos con versión y fecha actual (2611.04 / Noviembre 2026)', () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/i);
  assert.ok(footerMatch, 'El footer debe existir');
  const footerHtml = footerMatch[0];
  
  // Debe contener: Análisis/Diseño de Andres Aguiar V 2611.04 Santiago de Chile Noviembre 2026
  assert.match(
    footerHtml,
    /Análisis\/Diseño\s+de\s+Andres\s+Aguiar\s+V\s+2611\.04\s+Santiago\s+de\s+Chile\s+Noviembre\s+2026/i,
    'El footer debe contener el texto de análisis/diseño con versión 2611.04 y Santiago de Chile Noviembre 2026'
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

test('T1.4: El pie de página es un valor fijo estático en index.html y no se manipula dinámicamente en runtime por JS', () => {
  const jsFiles = ['assets/js/main.js', 'assets/js/ui.js', 'assets/js/orders.js', 'assets/js/storage.js', 'assets/js/production.js', 'assets/js/receipt.js'];
  for (const relPath of jsFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf-8');
    assert.doesNotMatch(
      content,
      /document\.querySelector\(['"]footer['"]\)/i,
      `${relPath} no debe manipular dinámicamente el footer en tiempo de ejecución`
    );
    assert.doesNotMatch(
      content,
      /2611\.04/i,
      `${relPath} no debe inyectar la versión estática del footer en runtime`
    );
  }
});
