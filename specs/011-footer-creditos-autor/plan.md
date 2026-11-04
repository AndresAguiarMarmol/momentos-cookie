# Plan de Implementación — Spec 011: Pie de Página (Footer) con Créditos de Autor y Contacto

## 1. Arquitectura y Enfoque Técnico
- **Ubicación en DOM:** Se añadirá un elemento semántico `<footer>` inmediatamente después de `</main>` (línea 674 aprox.) y antes de la sección de modales `<dialog>` en `index.html`.
- **Diseño visual:**
  - Alineado con la paleta de repostería artesanal (`bg-white/80` o `bg-[#FAF7F2]`, bordes suaves `#E8E1D7`, texto `#7A6A60`).
  - Utilización de clases utilitarias de Tailwind CSS existentes en el proyecto.
  - Soporte de zona segura para iPhone: `padding-bottom: max(1rem, env(safe-area-inset-bottom))` para evitar colisiones con la barra de gestos de iOS.
  - `flex-wrap` con centrado y espaciado adaptativo para lectura impecable tanto en pantallas móviles estrechas (iPhone SE / iPhone 13/14/15/16) como en monitores de escritorio.
- **Enlaces de contacto:**
  - Teléfono: `<a href="tel:+56933395447" class="...">+56933395447</a>`
  - WhatsApp: `<a href="https://wa.me/56933395447" target="_blank" rel="noopener noreferrer" class="...">+56933395447</a>`
- **Aislamiento de funcionalidad:** No se tocan scripts de lógica de negocio (`orders.js`, `storage.js`, `receipt.js`, `production.js`, `ui.js`, `main.js`), preservando intacto el 100% del comportamiento de la aplicación.

## 2. Estrategia TDD (Red-Green-Refactor)
1. **Fase Roja (Red):**
   - Escribir `tests/footer.test.js` usando `node:test` y `node:assert`.
   - Verificar la existencia de `<footer>` en `index.html`.
   - Verificar el texto completo requerido: `"Análisis/Diseño de Andres Aguiar V 26.11 Santiago de Chile (Noviembre 2026)"`.
   - Verificar la existencia del enlace `tel:+56933395447` con etiqueta de Contacto.
   - Verificar la existencia del enlace `https://wa.me/56933395447` con etiqueta de Whatsapp.
   - Ejecutar la prueba y comprobar que falla porque el footer aún no existe en `index.html`.
2. **Fase Verde (Green):**
   - Agregar el elemento `<footer>` con el marcado semántico y clases responsive en `index.html`.
   - Si se requiere ajuste fino de safe area en CSS, añadir regla en `assets/css/custom.css`.
   - Ejecutar `node --test tests/footer.test.js` y verificar paso a verde.
3. **Fase de Integración y Regresión:**
   - Ejecutar la suite completa (`node --test tests/*.test.js`) asegurando que los 70 tests preexistentes continúen en verde más los nuevos tests del footer.

## 3. Riesgos y Mitigaciones
- **Riesgo:** Superposición con modales o con el toast de notificaciones.
  - **Mitigación:** El footer se ubica dentro del flujo normal del documento al final de la página. Los modales usan `<dialog class="modal-backdrop">` con `position: fixed` / overlay nativo del navegador, por lo que no sufren interferencia. El toast tiene `fixed bottom-4 right-4 z-50`.
- **Riesgo:** Desbordamiento horizontal en pantallas pequeñas de iPhone.
  - **Mitigación:** Usar `flex-wrap justify-center text-center break-words` y espaciados proporcionados.

