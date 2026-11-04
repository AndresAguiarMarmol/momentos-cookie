# Tareas — Spec 011: Pie de Página (Footer) con Créditos de Autor y Contacto

Estado general: Completado

## Tareas

- [x] **T1. Fase Roja (TDD Red):** Crear prueba unitaria en `tests/footer.test.js` que valide la presencia del elemento `<footer>`, el texto exacto con versión y fecha (`26.11` y `Noviembre 2026`), y los enlaces interactivos a teléfono y WhatsApp. Verificar fallo controlado.
- [x] **T2. Fase Verde (TDD Green):** Implementar el elemento `<footer>` con marcado semántico, estilos adaptativos mobile/desktop y soporte para safe area de iOS en `index.html`. Ejecutar `tests/footer.test.js` hasta alcanzar luz verde.
- [x] **T3. Validación Integral y Regresión:** Ejecutar la suite completa de pruebas unitarias (`node --test tests/*.test.js`) para garantizar cero regresiones y actualizar `memory.md` y estados de spec.
