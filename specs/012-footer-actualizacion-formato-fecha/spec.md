# Spec 012 — Actualización de Formato de Fecha en Pie de Página (Footer)

Estado: implementada

## 1. Contexto y Objetivo
El usuario solicita ajustar el texto del pie de página (`<footer>`) de la aplicación para actualizar la versión fechada al formato `AAMM.DD` (`2611.04`) y sustituir la frase `Mes y Año Actual` por `Noviembre 2026`, manteniendo los enlaces interactivos a teléfono y WhatsApp intactos y sin modificar ninguna funcionalidad existente de la aplicación.

## 2. Definición del Texto
- **Texto Oficial Requerido:**
  `"Análisis/Diseño de Andres Aguiar V 2611.04 Santiago de Chile Noviembre 2026 - Contacto +56933395447 - Whatsapp +56933395447"`
- **Sustituciones aplicadas (fecha actual 04 de Noviembre de 2026):**
  - `AA`: `26`
  - `MM`: `11`
  - `DD`: `04`
  - `AAMM.DD`: `2611.04`
  - `Mes y Año Actual`: `Noviembre 2026`
- **Enlaces de contacto:**
  - Teléfono: `tel:+56933395447`
  - WhatsApp: `https://wa.me/56933395447`

## 3. Requisitos Funcionales (EARS)
- **RF-1**: EL SISTEMA actualiza el texto del elemento `<footer>` en `index.html` reflejando exactamente:
  `"Análisis/Diseño de Andres Aguiar V 2611.04 Santiago de Chile Noviembre 2026 - Contacto +56933395447 - Whatsapp +56933395447"`.
- **RF-2**: EL SISTEMA preserva los enlaces táctiles interactivos de llamada (`href="tel:+56933395447"`) y de WhatsApp (`href="https://wa.me/56933395447"` con `target="_blank"` y `rel="noopener noreferrer"`).
- **RF-3**: EL SISTEMA mantiene el diseño responsivo (`flex-wrap`, centrado, tipografía legible y márgenes de zona segura para iOS y PC).
- **RF-4**: EL SISTEMA mantiene 100% inalterada toda la operatividad, persistencia, cálculos contables, semáforo y pedidos de la aplicación.

## 4. Requisitos No Funcionales
- **RNF-1**: Cero impacto en rendimiento y compatibilidad garantizada tanto en navegadores móviles (Safari en iPhone) como de escritorio (Chrome/Edge/Firefox).

## 5. Criterios de Finalización (DoD)
- [x] Elemento `<footer>` actualizado en `index.html` con el texto exacto sustituido.
- [x] Pruebas unitarias en `tests/footer.test.js` actualizadas y pasando en verde con `node --test`.
- [x] 100% de la suite de pruebas pasando sin regresiones.
- [x] `memory.md` actualizado con el cambio.

