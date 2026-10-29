# Spec 004 — Mecanismos de Respaldo y Recuperación en el Menú Principal

Estado: implementada

## Contexto y objetivo
El taller artesanal "Momentos Cookie" almacena sus pedidos y configuraciones de forma local (`localStorage`). Para prevenir la pérdida de datos ante borrado de historial, cambio de dispositivo o fallas en el navegador, el usuario necesita un acceso rápido y visible desde el menú principal (cabecera de la aplicación) para:
1. **Respaldar en el equipo:** Generar y descargar instantáneamente un archivo de respaldo `.json` completo con todos los pedidos y ajustes.
2. **Recuperar respaldo del equipo:** Cargar un archivo `.json` previamente respaldado, con confirmación clara, validación de integridad y opción de modo de importación (fusión inteligente sin sobrescribir pedidos existentes o reemplazo total).

## Usuarios
- **Artesano / Administrador del taller:** Desea asegurar sus datos al final de cada jornada o transferirlos a otro equipo (ej. de la tablet de cocina a la PC de escritorio) desde cualquier pantalla sin tener que desplazarse a vistas secundarias.

## Historias de usuario
- **HU-1:** Como repostero, quiero un botón visible de "Respaldar" en el menú principal para descargar una copia de seguridad en mi equipo con un solo clic.
- **HU-2:** Como repostero, quiero un botón de "Recuperar" en el menú principal que me permita seleccionar un archivo de copia de seguridad y aplicarlo de forma segura.
- **HU-3:** Como repostero, quiero ver un diálogo de confirmación que valide el archivo antes de restaurarlo, mostrándome cuántos pedidos contiene y permitiéndome elegir si fusionar o reemplazar.
- **HU-4:** Como repostero en dispositivo móvil, quiero que los botones de respaldo y recuperación sean cómodos de presionar ($\ge 44$px) y se adapten sin desbordar el encabezado.

## Requisitos funcionales (EARS)
- **RF-01:** CUANDO el usuario presione el botón de "Respaldar" en el menú principal, EL SISTEMA generará y descargará inmediatamente en el equipo el archivo `momentos-cookie-backup-YYYY-MM-DD.json` con todos los pedidos y configuraciones actuales, y mostrará una notificación toast de éxito.
- **RF-02:** CUANDO el usuario presione el botón de "Recuperar" en el menú principal, EL SISTEMA abrirá un modal de diálogo (`<dialog id="modal-restore">`) para gestionar la recuperación desde el equipo.
- **RF-03:** CUANDO el usuario seleccione un archivo `.json` en el modal de recuperación, EL SISTEMA validará su estructura; SI el archivo no tiene formato válido, ENTONCES EL SISTEMA mostrará un mensaje de error y bloqueará la confirmación.
- **RF-04:** MIENTRAS el archivo sea válido, EL SISTEMA mostrará el resumen previo (número de pedidos encontrados y fecha del respaldo) y ofrecerá dos opciones de restauración:
  - *"Fusionar pedidos"* (conserva los existentes y agrega los nuevos sin duplicados por ID).
  - *"Reemplazar todo"* (sustituye completamente la base de datos local).
- **RF-05:** CUANDO el usuario confirme la recuperación, EL SISTEMA guardará los datos en el almacenamiento local, refrescará todas las vistas abiertas, cerrará el diálogo y mostrará un toast con la cantidad de pedidos sincronizados.
- **RF-06:** SI el usuario cancela la recuperación o cierra el diálogo, EL SISTEMA no modificará los pedidos existentes.

## Requisitos no funcionales
- **RNF-01 (Ergonomía de taller):** Botones con iconos representativos (`download` y `upload`), etiquetas legibles y áreas táctiles mínimas de 44x44px.
- **RNF-02 (Defensividad):** Validación estricta con protección contra JSON corruptos o archivos ajenos.
- **RNF-03 (Compatibilidad y cero dependencias):** Implementado con componentes nativos HTML5 (`<dialog>`, `<input type="file">`) y JavaScript Vanilla.

## Casos límite
- Archivo JSON vacío o con sintaxis inválida: no debe romper la app ni borrar datos; se notifica al usuario.
- Archivo JSON con array vacío de pedidos: alerta informativa al usuario.
- Restauración sin pedidos nuevos (todos ya existen en modo fusión): notifica que no hubo cambios o que 0 pedidos nuevos fueron incorporados.

## Criterios de finalización
- Botones de "Respaldar" y "Recuperar" integrados en la barra superior / menú principal.
- Modal interactivo de recuperación con previsualización y selector de modo (fusión / reemplazo).
- Suite de pruebas automatizadas en `tests/backup_restore.test.js` pasando al 100% en verde con `node --test`.
