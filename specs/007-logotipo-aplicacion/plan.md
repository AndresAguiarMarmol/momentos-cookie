# Plan Técnico — Spec 007 (Logotipo Oficial e Identidad Visual)

## 1. Arquitectura y Ubicación de Recursos
- **Directorio de imágenes:** Crear carpeta `assets/img/` si no existe.
- **Ruta canónica del logotipo:** `assets/img/logo.jpg`.
- Copiar la imagen suministrada por la usuaria (`media_1793704627921_0e4627a2.jpg`) a `assets/img/logo.jpg`.

## 2. Modificaciones de Interfaz y Código

### A. Encabezado y Favicon en `index.html`
- **Favicon:** En el `<head>`, agregar:
  ```html
  <link rel="icon" type="image/jpeg" href="assets/img/logo.jpg">
  ```
- **Header:** Reemplazar el contenedor con icono SVG genérico de Lucide por la imagen del logotipo:
  ```html
  <img src="assets/img/logo.jpg" alt="Momentos Cookie" class="w-11 h-11 rounded-2xl object-cover shadow-xs border border-cookie-200">
  ```
  Esto conserva exactamente las dimensiones (`w-11 h-11`, 44px), la curvatura moderna (`rounded-2xl`) y el borde suave sin romper la alineación con el título "Momentos Cookie".

### B. Manifiesto PWA (`manifest.json`)
- Actualizar la colección `icons` para incluir `assets/img/logo.jpg` con tipo `image/jpeg` y propósitos estándar y maskable.

### C. Comprobante / Ticket de Entrega (`assets/js/receipt.js`)
- En la función pura `generarTicketEntregaHtml(order, settings)`, incorporar la imagen centrada y circular de 64px a 72px en la parte superior del encabezado del ticket:
  ```html
  <img src="assets/img/logo.jpg" alt="Momentos Cookie" style="width: 68px; height: 68px; object-fit: cover; border-radius: 50%; margin: 0 auto 8px auto; display: block; border: 1px solid #E8E1D7;">
  ```
  Esto garantiza que el remito o ticket térmico impreso muestre la marca oficial del taller.

## 3. Estrategia de Pruebas (TDD)
- Crear `tests/logo.test.js`:
  1. Verificar que `assets/img/logo.jpg` existe y no está vacío.
  2. Verificar que `index.html` contiene el favicon apuntando a `assets/img/logo.jpg`.
  3. Verificar que el header en `index.html` renderiza la etiqueta `img` con `src="assets/img/logo.jpg"` y `alt="Momentos Cookie"`.
  4. Verificar que `manifest.json` referencia `assets/img/logo.jpg`.
  5. Verificar que `generarTicketEntregaHtml` incluye el logotipo en el HTML generado.
- Ejecutar la suite completa para asegurar 0 regresiones en las 49 pruebas existentes.

