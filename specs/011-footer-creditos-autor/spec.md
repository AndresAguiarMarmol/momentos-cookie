# Spec 011 — Pie de Página (Footer) con Créditos de Autor y Contacto

Estado: implementada

## 1. Contexto y Objetivo
Se requiere incorporar un pie de página (`<footer>`) permanente, elegante y accesible en la aplicación Momentos Cookie con los créditos de análisis, diseño y autoría técnica de Andrés Aguiar, reflejando la versión fechada (año y mes actual: `26.11`), la ciudad de origen (Santiago de Chile) y los datos directos de contacto telefónico y WhatsApp, optimizados tanto para teléfonos móviles (iPhone) como para computadoras de escritorio (PC), sin alterar ninguna funcionalidad existente.

## 2. Usuarios y Roles
- **Usuaria / Visitante:** Visualiza al final de la página los datos del diseñador y desarrollador, pudiendo pulsar directamente en los enlaces de teléfono o WhatsApp para iniciar contacto inmediato.

## 3. Historias de Usuario
- **HU-1**: Como autor y diseñador de la aplicación, quiero que aparezca el pie de página con mi nombre, versión fechada (Año.Mes actual: 26.11), ubicación y canales de contacto directo (+56933395447 / WhatsApp).
- **HU-2**: Como usuaria en iPhone o PC, quiero que los números de contacto y WhatsApp sean enlaces táctiles interactivos (`tel:` y `https://wa.me/`).
- **HU-3**: Como encargada del taller, quiero que el pie de página se adapte limpiamente al diseño artesanal sin tapar contenido ni interferir con la navegación ni el registro de pedidos.

## 4. Definiciones
- **Texto Oficial Requerido:**
  `"Análisis/Diseño de Andres Aguiar V 26.11 Santiago de Chile (Noviembre 2026) - Contacto +56933395447 - Whatsapp +56933395447"`
- **Enlaces Interactivos:**
  - Enlace Contacto: `tel:+56933395447`
  - Enlace WhatsApp: `https://wa.me/56933395447`

## 5. Requisitos Funcionales (EARS)
- **RF-1**: EL SISTEMA renderiza un elemento semántico `<footer>` al pie de la página (`index.html`) después de `<main>`, integrado armónicamente con la paleta de colores de taller.
- **RF-2**: EL SISTEMA muestra el texto de autoría especificando: `"Análisis/Diseño de Andres Aguiar V 26.11 Santiago de Chile (Noviembre 2026)"`.
- **RF-3**: EL SISTEMA expone el número de contacto `+56933395447` con enlace directo de llamada telefónica (`href="tel:+56933395447"`).
- **RF-4**: EL SISTEMA expone el enlace a WhatsApp `+56933395447` con enlace web seguro (`href="https://wa.me/56933395447"` con `target="_blank"` y `rel="noopener noreferrer"`).
- **RF-5**: MIENTRAS la aplicación se visualice en pantalla móvil (iPhone de 375px a 430px) o pantalla grande (PC), EL SISTEMA adapta el espaciado y ajuste de líneas (`flex-wrap`, centrado y márgenes de zona segura de iOS) para evitar desbordes horizontales.
- **RF-6**: EL SISTEMA mantiene 100% inalterada toda la operatividad, persistencia, cálculos contables, semáforo y pedidos de la aplicación.

## 6. Requisitos No Funcionales
- **RNF-1**: Ergonomía visual: tipografía legible (`text-xs sm:text-sm`), colores acordes al tema canela/vainilla con contraste AA, sin bloquear modales ni elementos interactivos.
- **RNF-2**: Cero impacto en rendimiento ni dependencias externas.

## 7. Criterios de Finalización (DoD)
- [x] Elemento `<footer>` con el texto y enlaces de llamada y WhatsApp implementado en `index.html`.
- [x] Reglas CSS de soporte ergonómico en `custom.css` si corresponde.
- [x] Pruebas unitarias en `tests/footer.test.js` validando la presencia del footer, texto exacto y enlaces interactivos.
- [x] 100% de la suite de pruebas pasando en verde con `node --test`.

