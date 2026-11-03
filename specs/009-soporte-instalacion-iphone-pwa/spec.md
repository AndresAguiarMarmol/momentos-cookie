# Spec 009 — Preparación para Instalación en iPhone (PWA iOS Standalone)

Estado: implementada

## 1. Contexto y Objetivo
La encargada del taller Momentos Cookie utiliza un dispositivo iPhone (iOS / Safari) y necesita instalar y utilizar la aplicación como si fuera una app nativa desde la pantalla de inicio de su teléfono, sin barra de direcciones del navegador, con icono oficial de alta definición, soporte para la zona segura de pantalla (notch e isla dinámica), funcionamiento sin conexión (offline) y guía asistida de instalación en Safari de iOS. La preparación debe ser 100% no invasiva: no modifica la operatividad existente de pedidos ni cálculos contables.

## 2. Usuarios y Roles
- **Repostera / Usuaria de iPhone:** Agrega la aplicación a la pantalla de inicio de su iPhone con un toque y la ejecuta en modo pantalla completa autónoma (*standalone*), visualizando el icono oficial y accediendo fluidamente en el taller.

## 3. Historias de Usuario
- **HU-1**: Como encargada del taller que usa iPhone, quiero agregar la aplicación a la pantalla de inicio con su icono oficial para abrirla directamente como cualquier app de iOS sin el marco de Safari.
- **HU-2**: Como usuaria de iPhone, quiero que la interfaz respete las zonas seguras (*safe-area-insets*) de la pantalla para que la barra de estado, el notch y el botón de inicio inferior no tapen los controles ni el encabezado.
- **HU-3**: Como usuaria, quiero contar con una guía breve y accesible que me recuerde cómo instalar la app en iOS (pulsar Compartir ⎋ y seleccionar "Agregar a inicio").
- **HU-4**: Como repostera, quiero que los recursos esenciales estén disponibles en caché para poder consultar pedidos aun si la señal de internet es débil en el taller.

## 4. Definiciones
- **PWA en iOS:** Aplicación Web Progresiva ejecutada a través del motor WebKit de iOS configurada con metaetiquetas `apple-mobile-web-app-*` y `apple-touch-icon`.
- **Modo Standalone:** Modo en el cual la aplicación se visualiza a pantalla completa sin los controles de navegación habituales del navegador Safari.
- **Safe Area Inset:** Variables CSS del entorno iOS (`env(safe-area-inset-top)`, etc.) que evitan superposiciones con la cámara frontal y la barra de gestos de inicio.

## 5. Requisitos Funcionales (EARS)
- **RF-1**: CUANDO la aplicación se abre en Safari de iOS, EL SISTEMA expone las metaetiquetas obligatorias de Web App para Apple (`apple-mobile-web-app-capable="yes"`, `apple-mobile-web-app-status-bar-style="default"`, `apple-mobile-web-app-title="Momentos Cookie"`).
- **RF-2**: EL SISTEMA define el icono de pantalla de inicio de iOS vinculando `assets/img/logo.jpg` mediante la etiqueta `<link rel="apple-touch-icon" href="assets/img/logo.jpg">`.
- **RF-3**: CUANDO la app se ejecuta en un iPhone con notch o Dynamic Island, EL SISTEMA aplica la directiva `viewport-fit=cover` y adapta los rellenos superiores e inferiores mediante CSS respetando las variables de entorno de área segura (`env(safe-area-inset-*)`).
- **RF-4**: EL SISTEMA actualiza el archivo `manifest.json` con metadatos completos de instalación (`display="standalone"`, `start_url="./index.html"`, `scope="./"`, `theme_color="#D97724"`, `background_color="#FAF7F2"` y colección de iconos).
- **RF-5**: EL SISTEMA actualiza el Service Worker (`sw.js`) a la versión de caché `momentos-cookie-v2` incorporando todos los scripts (`production.js`, `receipt.js`, etc.) y el logotipo oficial para permitir la carga offline instantánea.
- **RF-6**: CUANDO la usuaria abre el modal de Configuración o consulta la ayuda de instalación, EL SISTEMA presenta una guía gráfica rápida con los 2 pasos necesarios para instalar en iPhone desde Safari (1. Botón Compartir ⎋ -> 2. "Agregar a inicio").
- **RF-7**: EL SISTEMA mantiene 100% inalterada la operatividad existente del registro de pedidos, semáforo de planificación, consolidación y saldo pendiente.

## 6. Requisitos No Funcionales
- **RNF-1**: Cero rotura y compatibilidad multiplataforma: las mejoras para iOS deben convivir limpiamente con navegadores de escritorio (Chrome, Edge) y Android sin alterar su comportamiento actual.
- **RNF-2**: Rendimiento y ligereza: sin librerías externas adicionales ni compiladores.

## 7. Criterios de Finalización (DoD)
- [x] Metaetiquetas de iOS y `apple-touch-icon` en `<head>` de `index.html`.
- [x] Directiva `viewport-fit=cover` y reglas CSS de áreas seguras en `custom.css`.
- [x] `manifest.json` con parámetros completos de PWA.
- [x] `sw.js` actualizado con el bundle completo de archivos y versión `momentos-cookie-v2`.
- [x] Guía accesible de instalación para iPhone integrada en el modal de configuración de `index.html`.
- [x] Pruebas unitarias en `tests/ios_pwa.test.js` verificando la presencia y validez de cada componente.
- [x] 100% de la suite de pruebas pasando en verde con `node --test`.

