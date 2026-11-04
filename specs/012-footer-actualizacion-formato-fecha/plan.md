# Plan de Implementación — Spec 012: Actualización de Formato de Fecha en Pie de Página

## 1. Arquitectura y Cambios Requeridos
- **Archivo afectado:** `index.html` en el elemento `<footer>`.
- **Modificación:**
  - Sustituir la versión previa `"Análisis/Diseño de Andres Aguiar V 26.11 Santiago de Chile (Noviembre 2026)"` por `"Análisis/Diseño de Andres Aguiar V 2611.04 Santiago de Chile Noviembre 2026"`.
  - Mantener los enlaces interactivos:
    - `tel:+56933395447` para Contacto.
    - `https://wa.me/56933395447` para WhatsApp.
  - Mantener estructura HTML semántica y clases de Tailwind CSS.
  - Cero modificación de scripts de negocio ni persistencia.

## 2. Estrategia TDD (Red-Green-Refactor)
1. **Fase Roja (Red):**
   - Actualizar `tests/footer.test.js` para exigir la nueva cadena: `Análisis/Diseño de Andres Aguiar V 2611.04 Santiago de Chile Noviembre 2026`.
   - Ejecutar `node --test tests/footer.test.js` y confirmar fallo por discrepancia de texto.
2. **Fase Verde (Green):**
   - Actualizar el texto en `index.html`.
   - Ejecutar `node --test tests/footer.test.js` y verificar paso a verde.
3. **Fase de Integración y Regresión:**
   - Ejecutar la suite completa `node --test tests/*.test.js` asegurando 100% de éxito en todos los tests.

