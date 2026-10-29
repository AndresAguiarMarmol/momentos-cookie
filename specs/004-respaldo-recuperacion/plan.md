# Plan de Implementación — Spec 004: Mecanismos de Respaldo y Recuperación en el Menú Principal

## Archivos y responsabilidades

1. **`tests/backup_restore.test.js` (Nuevo):**
   - Pruebas unitarias puras para la lógica de validación de archivos de respaldo, previsualización de datos e importación en modos `merge` y `replace`.
2. **`index.html`:**
   - Incorporar en el `<header>` (menú principal) dos botones táctiles:
     - `#btn-header-backup`: Icono `download` + "Respaldar" (o solo icono en móviles compactos).
     - `#btn-header-restore`: Icono `upload` + "Recuperar" (o solo icono en móviles compactos).
   - Agregar el modal `<dialog id="modal-restore">` con:
     - Selector de archivo (`<input type="file" id="restore-file-input" accept=".json">`).
     - Área de resumen previo (oculta inicialmente, se revela al cargar archivo válido: cantidad de pedidos, fecha de creación).
     - Selector de modo: radio buttons para *"Fusionar (sin duplicar)"* vs *"Reemplazar todo"*.
     - Botones de acción: *"Cancelar"* y *"Confirmar Recuperación"* (deshabilitado hasta que haya archivo válido).
3. **`assets/js/storage.js`:**
   - Asegurar que `importBackupJson(jsonString, { mode })` aplique correctamente los ajustes contenidos en el respaldo (`settings`) si vienen en el payload.
4. **`assets/js/ui.js`:**
   - Métodos auxiliares para el modal de restauración: `openRestoreModal()`, `updateRestorePreview(parsedData)`.
5. **`assets/js/main.js`:**
   - Listeners para `#btn-header-backup` (dispara `storage.exportBackupJson()` y `UI.downloadFile`).
   - Listeners para `#btn-header-restore`, selección de archivo, lectura vía `FileReader`, previsualización y confirmación.

## Algoritmo de Recuperación (Pseudocódigo)

```text
FUNCIÓN alSeleccionarArchivo(evento):
  archivo = evento.target.archivos[0]
  SI no hay archivo: RETORNAR
  
  lector = FileReader()
  lector.alCargar = (e):
    texto = e.target.resultado
    resultado = validarYPrevisualizar(texto)
    SI resultado.valido:
      mostrarResumen(resultado.cantidadPedidos, resultado.fecha)
      habilitarBotonConfirmar()
    SINO:
      mostrarError(resultado.error)
      deshabilitarBotonConfirmar()
  lector.leerComoTexto(archivo)

FUNCIÓN alConfirmarRecuperacion():
  modo = obtenerModoSeleccionado() // 'merge' o 'replace'
  resultado = storage.importBackupJson(textoCargado, { mode: modo })
  SI resultado.exitoso:
    cerrarModal()
    mostrarToast("Copia recuperada: X pedidos sincronizados", "success")
    refrescarTodasLasVistas()
  SINO:
    mostrarToast(resultado.error, "error")
```

## Estrategia de Tests (`tests/backup_restore.test.js`)
- Test 1: Validación de archivo JSON correcto con metadata y pedidos.
- Test 2: Rechazo de archivos no válidos (JSON malformado, sin array de pedidos, o vacío).
- Test 3: Importación en modo fusión (`merge`): conserva pedidos preexistentes y suma nuevos.
- Test 4: Importación en modo reemplazo (`replace`): sobrescribe completamente la base de datos local.
- Test 5: Importación de configuraciones asociadas al backup.
