# Plan Técnico — Spec 009 (Preparación para Instalación en iPhone / iOS PWA)

## 1. Arquitectura de Metadatos y Estilos iOS

### A. Metaetiquetas en `<head>` de `index.html`
- Actualizar viewport para safe areas:
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">
  ```
- Metaetiquetas específicas para Apple iOS:
  ```html
  <!-- Soporte para PWA en iOS / iPhone -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Momentos Cookie">
  <link rel="apple-touch-icon" href="assets/img/logo.jpg">
  ```

### B. Reglas CSS para Safe Area (Notch / Isla Dinámica / Home Indicator) en `assets/css/custom.css`
- Integrar padding adaptable con `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)`:
  ```css
  /* Soporte ergonómico para iPhone (Safe Area Insets) */
  header {
    padding-top: env(safe-area-inset-top, 0px);
  }
  body {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  ```

### C. Manifiesto PWA (`manifest.json`)
- Parámetros completos para PWA:
  - `name`: "Momentos Cookie - Control de Pedidos"
  - `short_name`: "Momentos Cookie"
  - `start_url`: "./index.html"
  - `scope`: "./"
  - `display`: "standalone"
  - `theme_color`: "#D97724"
  - `background_color`: "#FAF7F2"
  - `icons`: referencia a `assets/img/logo.jpg`.

### D. Service Worker (`sw.js`)
- Incrementar versión de caché a `momentos-cookie-v2`.
- Añadir a `ASSETS_TO_CACHE`:
  - `'./assets/img/logo.jpg'`
  - `'./assets/js/production.js'`
  - `'./assets/js/receipt.js'`

### E. Guía de Instalación en iPhone en el Modal de Ajustes (`index.html`)
- Agregar una tarjeta visual colapsable/descriptiva en `#modal-settings` con los pasos para iPhone:
  - Paso 1: Abrir en Safari y tocar el botón **Compartir** (icono de cuadrado con flecha hacia arriba ⎋).
  - Paso 2: Deslizar hacia abajo y tocar **"Agregar a inicio"** (o *"Add to Home Screen"*).

## 2. Estrategia de Pruebas (TDD)
- Crear `tests/ios_pwa.test.js`:
  1. Verificar que `index.html` contiene `viewport-fit=cover`.
  2. Verificar que `index.html` contiene las metaetiquetas `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`.
  3. Verificar que `index.html` contiene `<link rel="apple-touch-icon" href="assets/img/logo.jpg">`.
  4. Verificar que `assets/css/custom.css` incluye soporte para `safe-area-inset-top` y `safe-area-inset-bottom`.
  5. Verificar que `manifest.json` contiene `display: "standalone"`, `start_url` y `scope`.
  6. Verificar que `sw.js` incluye `assets/img/logo.jpg`, `production.js` y `receipt.js` en su lista de caché.
  7. Verificar que el modal de ajustes incluye la guía de instalación para iPhone.

