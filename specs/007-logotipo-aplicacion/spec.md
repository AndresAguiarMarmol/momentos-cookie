# Spec 007 — Logotipo Oficial e Identidad Visual de la Aplicación

Estado: implementada

## 1. Contexto y Objetivo
La aplicación web Momentos Cookie utilizaba hasta ahora un ícono genérico de galleta provisto por la librería Lucide en el encabezado y en los comprobantes de entrega. El taller ha suministrado el diseño gráfico oficial de su marca con sus personajes ilustrados y mangas pasteleras. Esta especificación define la integración del logotipo oficial en todos los puntos de contacto visual clave: encabezado principal, favicon de la pestaña del navegador, comprobante térmico/remito imprimible y manifiesto PWA.

## 2. Usuarios y Roles
- **Repostera / Encargada de taller:** Visualiza la identidad de marca auténtica de Momentos Cookie tanto en la pantalla de gestión diaria como en los tickets que entrega a los clientes.
- **Cliente:** Recibe un comprobante de entrega físico o digital con el logotipo oficial reconocible de la marca.

## 3. Historias de Usuario
- **HU-1**: Como repostera del taller, quiero que la aplicación muestre el logotipo oficial en el encabezado principal para darle identidad profesional e inconfundible al sistema de control de pedidos.
- **HU-2**: Como usuaria de la aplicación, quiero que la pestaña del navegador muestre el logotipo como favicon para identificar rápidamente la app entre múltiples pestañas abiertas.
- **HU-3**: Como repostera y cliente, quiero que los comprobantes o tickets impresos de entrega incluyan el logotipo oficial en la cabecera para respaldar la entrega con la imagen del negocio.

## 4. Definiciones
- **Logotipo Oficial:** Archivo de imagen ilustrado suministrado por el taller (`assets/img/logo.jpg`) que contiene los personajes de galletas sonrientes, mangas pasteleras y la tipografía de Momentos Cookie.

## 5. Requisitos Funcionales (EARS)
- **RF-1**: EL SISTEMA aloja la imagen oficial del logotipo en la ruta accesible `assets/img/logo.jpg`.
- **RF-2**: CUANDO se carga la aplicación en el navegador, EL SISTEMA muestra el logotipo oficial en el contenedor del encabezado (`<header>`) con dimensiones responsivas, bordes suaves y atributo descriptivo de accesibilidad (`alt="Momentos Cookie"`).
- **RF-3**: CUANDO la página se carga en cualquier navegador, EL SISTEMA expone el logotipo como favicon en el `<head>` mediante `<link rel="icon">`.
- **RF-4**: CUANDO se genera el comprobante / ticket de entrega imprimible, EL SISTEMA incorpora el logotipo oficial centrado en la cabecera del comprobante antes del nombre del taller.
- **RF-5**: CUANDO el navegador consulta la configuración PWA, EL SISTEMA expone la ruta del logotipo en los iconos de `manifest.json`.

## 6. Requisitos No Funcionales
- **RNF-1**: Responsividad y ergonomía: El logotipo debe adaptarse armoniosamente a dispositivos móviles (375px a 390px) sin desbordar el encabezado ni desplazar los botones de acción rápida ("Respaldar", "Recuperar", "Ajustes").
- **RNF-2**: Resiliencia: Si por algún motivo la imagen no se encontrara disponible temporalmente, la interfaz debe mantener la legibilidad del nombre del taller sin romper el layout.

## 7. Criterios de Finalización (DoD)
- [x] Imagen oficial copiada en `assets/img/logo.jpg`.
- [x] `index.html` actualizado con el logotipo en el encabezado y como favicon.
- [x] `assets/js/receipt.js` actualizado para incluir el logotipo en el comprobante imprimible.
- [x] `manifest.json` actualizado con la referencia al logotipo.
- [x] Pruebas unitarias en `tests/ui_layout.test.js` o `tests/logo.test.js` validando la presencia y atributos del logotipo.
- [x] 100% de la suite de pruebas pasando en verde con `node --test`.

