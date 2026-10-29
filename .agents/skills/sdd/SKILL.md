---
name: sdd
description: Metodología Spec-Driven Development (SDD) estricta para desarrollo de software guiado por especificaciones. Rige el ciclo Constitución → Spec (EARS) → Clarificación → Plan → Tareas → Implementación TDD (Red-Green) → Validación → Cambio, gestión de memoria y reglas de parada.
---

# Spec-Driven Development (SDD) — Guía Metodológica Oficial

Este documento define la metodología obligatoria de desarrollo **Spec-Driven Development (SDD)** para agentes, coordinadores y desarrolladores humanos en este repositorio.

---

## 1. Principios Fundamentales e Innegociables

1. **La especificación manda (`spec.md`):** Si una funcionalidad, regla o comportamiento no está formalmente descrita en la especificación aprobada, **no existe y no se implementa**. Ante cualquier duda o decisión no resuelta, el agente debe detenerse y preguntar.
2. **Separación estricta de QUÉ vs CÓMO:** 
   - `spec.md` describe exclusivamente el **QUÉ** y el **POR QUÉ** desde el punto de vista del usuario o del negocio. Nunca contiene nombres de archivos, librerías, detalles de arquitectura ni fragmentos de código.
   - `plan.md` describe el **CÓMO** técnico: arquitectura, funciones puras, responsabilidades de módulos, algoritmos y estrategia de testing.
3. **Compuertas de fase con aprobación explícita:** Ningún agente ni proceso puede avanzar a la siguiente fase sin la confirmación y aprobación explícita del usuario.
4. **Ciclo TDD estricto y granular (Red-Green):** La implementación se ejecuta **tarea por tarea**, escribiendo primero las pruebas unitarias que fallen (Red), implementando el código mínimo para que pasen (Green) con `node --test`, marcando la tarea como completada y **deteniéndose de inmediato** para reportar el avance.
5. **Primero la spec ante cualquier cambio:** Cualquier nuevo requisito o modificación de comportamiento detectado durante el desarrollo debe impactar primero a `spec.md`. Solo tras ser aprobado se actualizan `plan.md`, `tasks.md` y finalmente el código.
6. **Preservación obligatoria de memoria (`memory.md`):** Al concluir cualquier fase o cambio, se debe sincronizar `memory.md` con el estado del sistema, decisiones arquitectónicas vigentes y el historial de cambios fechado.

---

## 2. El Flujo de Trabajo en 8 Fases

```
[Fase 0: Constitución]
         │
         ▼
[Fase 1: Spec] ◄────────────────────────────────────────┐
         │                                              │
         ▼                                              │
[Fase 2: Clarificación (QA)]                            │
         │                                              │
         ▼                                              │
[Fase 3: Plan Técnico]                                  │
         │                                              │
         ▼                                              │
[Fase 4: Tareas Verificables]                           │
         │                                              │
         ▼                                              │
[Fase 5: Implementación TDD] (1 a la vez: Red → Green) │
         │                                              │
         ▼                                              │
[Fase 6: Validación Integral (RF por RF)]              │
         │                                              │
         ▼                                              │
[Fase 7: Gestión de Cambios] ───────────────────────────┘
```

Cada especificación se aísla en su propio directorio versionado dentro de `specs/`:
`specs/NNN-nombre-funcionalidad/` conteniendo:
- `spec.md` (requisitos en EARS, criterios, casos límite)
- `plan.md` (arquitectura, funciones puras, decisiones, estrategia de tests)
- `tasks.md` (lista de tareas verificables con checkboxes)

---

### Fase 0 — Constitución del Proyecto (`docs/constitution.md`)
- **Objetivo:** Definir los cimientos técnicos, filosóficos y límites arquitectónicos inviolables del proyecto.
- **Reglas:**
  - Máximo 6 principios cortos, categóricos y verificables.
  - Cubre: simplicidad del stack, acoplamiento de datos, ergonomía visual / taller, orden operativo / planificación, validación sin fricción y accesibilidad.
  - El archivo `docs/constitution.md` es la ley suprema del proyecto; cualquier spec que contradiga la constitución es inválida.

---

### Fase 1 — Especificación Funcional (`spec.md`)
- **Objetivo:** Capturar la necesidad del usuario, estructurar historias de usuario y redactar Requisitos Funcionales rigurosos en sintaxis EARS.
- **Reglas:**
  - El estado inicial de la spec es obligatoriamente `borrador`.
  - Cero detalles técnicos: prohibido mencionar JavaScript, localStorage, Tailwind, clases CSS o rutas de archivos.
  - Todos los requisitos funcionales deben ser formalizados en **EARS en español** y ser 100% verificables (sin adjetivos subjetivos como "rápido", "intuitivo" o "moderno" sin métricas concretas).

---

### Fase 2 — Clarificación y Revisión de QA
- **Objetivo:** Detectar activamente ambigüedades, contradicciones y vacíos antes de escribir el plan técnico.
- **Reglas:**
  - El revisor/QA actúa como detector, no como resolutor.
  - Realiza preguntas al usuario de **una en una** (máximo 5 en total).
  - Identifica casos límite no cubiertos y posibles conflictos con la Constitución.
  - Una vez resueltas las dudas, se actualiza `spec.md` y se solicita la aprobación del usuario para cambiar su estado a `aprobada`.

---

### Fase 3 — Plan Técnico (`plan.md`)
- **Objetivo:** Diseñar la arquitectura técnica necesaria para cumplir el 100% de los requisitos funcionales de la spec aprobada.
- **Reglas:**
  - Detalla los archivos que se crean o modifican y la responsabilidad única de cada uno.
  - Diseña la lógica de negocio mediante **funciones puras desacopladas** (recibiendo la fecha actual `hoy` como parámetro inyectado para garantizar determinismo en tests).
  - Describe algoritmos clave en pseudocódigo y esquemas de representación en el DOM.
  - Justifica cada decisión técnica documentando explícitamente la **alternativa considerada y descartada**.
  - Traza la cobertura: cada sección del plan debe indicar qué Requisitos Funcionales (`RF-x`) resuelve.
  - Especifica la estrategia de pruebas con el ejecutor nativo `node --test`.

---

### Fase 4 — Desglose de Tareas Verificables (`tasks.md`)
- **Objetivo:** Traducir el plan en una secuencia ordenada de unidades de trabajo atómicas, ejecutables y medibles.
- **Reglas:**
  - Tareas acotadas (estimadas en 20-30 minutos cada una).
  - Orden estricto de dependencias (de menor a mayor acoplamiento: datos/lógica pura → persistencia → DOM/eventos → integración).
  - Cada tarea declara explícitamente los RFs que cubre y una comprobación unívoca bajo la cláusula `Hecho cuando:`.
  - Recomendado máximo de 7 a 10 tareas por spec. Si se supera esa cifra, la spec debe evaluarse para división modular.

---

### Fase 5 — Implementación TDD Granular (Red-Green)
- **Objetivo:** Construir el software con calidad garantizada y cero regresiones.
- **Reglas:**
  - **UNA SOLA TAREA POR TURNO:** Prohibido implementar múltiples tareas en cascada.
  - **Fase Red:** Escribir primero las pruebas unitarias asociadas a la tarea y ejecutar `node --test tests/*.test.js` confirmando que fallan por la causa esperada.
  - **Fase Green:** Escribir la implementación mínima necesaria en el código de producción hasta que la suite pase en verde.
  - Ejecutar la suite completa para descartar regresiones.
  - Marcar el checkbox correspondiente en `tasks.md` (`- [x]`).
  - **PARAR DE INMEDIATO:** Reportar el progreso al usuario con el estado de las pruebas y esperar instrucciones.

---

### Fase 6 — Validación Integral
- **Objetivo:** Certificar que la implementación satisface íntegramente la especificación.
- **Reglas:**
  - Recorrido exhaustivo RF por RF: se indica el test unitario específico que lo valida o el resultado en vivo.
  - Para requisitos de interfaz y ergonomía táctil móvil, validar con herramientas de inspección (DevTools / viewport móvil de 375px a 390px).
  - Comprobación de criterios de aceptación y casos límite.
  - Emisión del veredicto final: si se aprueba, el estado de `spec.md` se actualiza a `implementada`.

---

### Fase 7 — Gestión de Cambios
- **Objetivo:** Gestionar variaciones de alcance sin corromper el diseño ni la trazabilidad.
- **Reglas:**
  - Prohibido modificar el código directamente ante una nueva petición o cambio de idea.
  - Paso 1: Actualizar `spec.md` incorporando o modificando los RFs en sintaxis EARS, nuevos casos límite y alcance.
  - Paso 2: Presentar el diff de la spec al usuario y solicitar aprobación.
  - Paso 3: Ajustar `plan.md` y `tasks.md`.
  - Paso 4: Implementar siguiendo el ciclo TDD.

---

## 3. Guía de Sintaxis EARS (Easy Approach to Requirements Syntax)

Todos los Requisitos Funcionales en `spec.md` deben redactarse bajo uno de los siguientes patrones estandarizados en español:

| Tipo de Requisito | Patrón Sintáctico EARS | Cuándo se usa | Ejemplo |
| :--- | :--- | :--- | :--- |
| **Evento (Event-Driven)** | `CUANDO <evento disparador>, EL SISTEMA <respuesta observable>.` | Para acciones del usuario o eventos del entorno. | *CUANDO el usuario hace clic en "Guardar Pedido", EL SISTEMA valida que el nombre del cliente y la fecha de entrega no estén vacíos.* |
| **Estado no deseado (Unwanted Behavior)** | `SI <condición de error o estado anómalo>, ENTONCES EL SISTEMA <respuesta defensiva>.` | Para validaciones, fallos, excepciones o datos corruptos. | *SI el cliente ingresa un número de teléfono con caracteres no numéricos, ENTONCES EL SISTEMA muestra un mensaje de advertencia y bloquea el guardado.* |
| **Basado en estado (State-Driven)** | `MIENTRAS <estado activo o contexto>, EL SISTEMA <comportamiento continuo>.` | Cuando el comportamiento depende de un modo o estado activo. | *MIENTRAS el tipo de pedido sea "Combo / Kit", EL SISTEMA mantiene visibles los selectores de tipo de empaque y kit de pintura.* |
| **Comportamiento continuo (Ubiquitous)** | `EL SISTEMA <comportamiento permanente y universal>.` | Reglas de negocio globales que aplican en todo momento. | *EL SISTEMA calcula el total del pedido sumando el subtotal de las unidades más el costo de los extras seleccionados.* |
| **Característica opcional (Optional Feature)** | `DONDE <característica o extensión opcional esté activa>, EL SISTEMA <respuesta>.` | Cuando aplica a componentes o flags condicionales. | *DONDE el kit de pintura comestible esté habilitado, EL SISTEMA añade el costo unitario del kit por cada unidad de combo solicitada.* |

### Antipatrones EARS Prohibidos
- ❌ *El sistema debe ser rápido al cargar los pedidos.* (No verificable).
  - ✔️ *CUANDO se inicia la aplicación, EL SISTEMA renderiza los pedidos almacenados en menos de 500 milisegundos.*
- ❌ *La interfaz debe verse bonita y moderna.* (Subjetivo).
  - ✔️ *EL SISTEMA aplica la paleta visual artesanal definida en la Constitución con un contraste de color mínimo de 4.5:1 (WCAG AA).*
- ❌ *El sistema guardará en localStorage usando la clave momentos_orders.* (Error: introduce stack/implementación en la spec).
  - ✔️ *CUANDO el pedido es confirmado, EL SISTEMA persiste la información de manera que esté disponible tras recargar el navegador.*

---

## 4. Roles y Coordinación Multi-Agente

En flujos colaborativos o ejecuciones automatizadas, los agentes asumen responsabilidades estrictamente segregadas:

```
                    ┌──────────────────────────┐
                    │       COORDINATOR        │
                    │  (Orquestador Principal) │
                    └─────────────┬────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│     PLANNER      │    │   IMPLEMENTER    │    │  REVIEWER / QA   │
│  Spec, Plan y    │    │  TDD Red-Green,  │    │  Clarificación y │
│  Desglose Tareas │    │  1 tarea y stop  │    │  Validación RFs  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
                                  ▲
                                  │
                        ┌─────────┴────────┐
                        │     AUDITOR      │
                        │  Cumplimiento y  │
                        │ Memoria de Datos │
                        └──────────────────┘
```

1. **Coordinator (`coordinator.md`):**
   - Vela por la integridad del flujo SDD integral.
   - Es el único canal de diálogo principal con el usuario para pedir aprobaciones de compuerta.
   - Delega tareas específicas a `planner`, `implementer` o `reviewer` y transmite el contexto.
   - Tiene restringida la modificación arbitraria de código sin pasar por el flujo.

2. **Planner (`planner.md`):**
   - Responsable de redactar `spec.md`, `plan.md` y `tasks.md`.
   - Lee exhaustivamente `docs/constitution.md`, `memory.md` y el código previo antes de proponer cambios.
   - Tiene prohibido escribir código ejecutable de producción.

3. **Implementer (`implementer.md`):**
   - Recibe la asignación de **UNA sola tarea** de `tasks.md`.
   - Escribe primero los tests (`Red`), comprueba el fallo, programa la solución (`Green`), corre `node --test`, marca la tarea y **se detiene inmediatamente**.
   - No puede saltar a la tarea siguiente sin nueva asignación.

4. **Reviewer / QA (`reviewer.md`):**
   - En Fase 2: audita la spec en búsqueda de ambigüedades, inconsistencias y casos límite sin proponer soluciones apresuradas.
   - En Fase 6: valida la entrega RF por RF, ejecuta la suite de tests y verifica la interfaz sin tocar código de implementación.

5. **Auditor (`auditor.md`):**
   - Inspecciona la concordancia entre `spec.md`, `plan.md`, `tasks.md` y el código real.
   - Garantiza que `memory.md` refleje fielmente el estado de la arquitectura y el historial de cambios.

---

## 5. Plantillas Oficiales de Artefactos

### A. Plantilla de Especificación (`specs/NNN-nombre/spec.md`)

```markdown
# Spec NNN — <Nombre Descriptivo de la Funcionalidad>

Estado: borrador | aprobada | implementada

## 1. Contexto y Objetivo
<Explicación breve del problema de negocio que resuelve y el objetivo esperado.>

## 2. Usuarios y Roles
- **<Rol 1>**: <Descripción breve de cómo interactúa con esta funcionalidad.>

## 3. Historias de Usuario
- **HU-1**: Como <rol>, quiero <acción o capacidad> para <beneficio o valor obtenido>.

## 4. Definiciones y Glosario
<Solo si existen términos de negocio con posibilidad de ambigüedad.>
- **<Término>**: <Definición unívoca>.

## 5. Requisitos Funcionales (EARS)
- **RF-1**: CUANDO <evento>, EL SISTEMA <respuesta>.
- **RF-2**: SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>.
- **RF-3**: MIENTRAS <estado>, EL SISTEMA <respuesta>.
- **RF-4**: EL SISTEMA <comportamiento permanente>.

## 6. Requisitos No Funcionales
- **RNF-1**: Accesibilidad WCAG AA en contrastes y navegación por teclado.
- **RNF-2**: Persistencia local resiliente ante reinicio del navegador.

## 7. Casos Límite y Manejo de Errores
- <Caso límite 1: valores en cero, campos vacíos, cadenas ultra largas, cortes de red, etc.>

## 8. Fuera de Alcance
- <Funcionalidades explícitamente excluidas de esta versión o iteración.>

## 9. Criterios de Finalización (DoD)
- [ ] Todos los Requisitos Funcionales (RF) verificados mediante pruebas automatizadas o de interfaz.
- [ ] Suite de pruebas pasando al 100% en verde con `node --test`.
- [ ] Sin errores de consola ni advertencias en el navegador.

## 10. Dudas Abiertas
- [NECESITA ACLARACIÓN] <Pregunta puntual para el usuario o stakeholder.>
```

---

### B. Plantilla de Plan Técnico (`specs/NNN-nombre/plan.md`)

```markdown
# Plan Técnico — Spec NNN (<Nombre>)

## 1. Archivos Involucrados y Responsabilidades
- `assets/js/<modulo>.js`: <Responsabilidad única, ej. lógica de cálculo pura>.
- `assets/js/<ui>.js`: <Renderizado de componentes y manipulación del DOM>.
- `tests/<modulo>.test.js`: <Suite de pruebas unitarias asociadas>.

## 2. Lógica Pura y Modelos de Datos
<Firmas de funciones con inyección de dependencias, ej. parámetro 'hoy' para fechas>.
```javascript
function calcularTotales(items, extras, tarifa) { ... }
function determinarEstadoSemaforo(fechaCompromiso, hoy = new Date()) { ... }
```

## 3. Algoritmos y Flujo de Datos
<Descripción en pseudocódigo o diagrama de flujo de las operaciones críticas>.

## 4. Interfaz y Componentes del DOM
<Componentes HTML semánticos, diálogos <dialog>, estados visuales y eventos>.

## 5. Decisiones Técnicas y Alternativas Descartadas
- **Decisión 1:** <Explicación de la tecnología o patrón seleccionado>.
  - *Alternativa descartada:* <Qué otra opción se evaluó y por qué fue rechazada>.

## 6. Estrategia de Pruebas y Cobertura de RF
- `tests/<archivo>.test.js`:
  - Test para RF-1: <descripción del escenario de prueba>.
  - Test para RF-2: <descripción del escenario de prueba>.
```

---

### C. Plantilla de Tareas (`specs/NNN-nombre/tasks.md`)

```markdown
# Tareas — Spec NNN (<Nombre>)

- [ ] **T1. <Título conciso de la tarea de lógica/datos>.** RF-1, RF-2
  - Hecho cuando: Ejecutar `node --test tests/<archivo>.test.js` resulte exitoso verificando <criterio concreto>.
- [ ] **T2. <Título conciso de la tarea de interfaz/DOM>.** RF-3
  - Hecho cuando: <Comprobación verificable en el navegador o test de integración>.
- [ ] **T3. <Título conciso de integración y validación final>.** RF-1, RF-2, RF-3, RF-4
  - Hecho cuando: La suite completa `node --test` pase sin fallos y se cumplan los criterios de finalización de la spec.
```

---

## 6. Comandos del Flujo SDD

Los siguientes comandos automatizan y orientan las distintas etapas metodológicas:

| Comando | Archivo de Instrucción | Acción |
| :--- | :--- | :--- |
| `/sdd-constitution` | `.agents/skills/sdd/sdd-constitution.md` | Propone o revisa la constitución del proyecto (`docs/constitution.md`). |
| `/sdd-spec <NNN-nombre> <idea>` | `.agents/skills/sdd/sdd-spec.md` | Inicia la entrevista y genera el borrador de `spec.md` en EARS. |
| `/sdd-clarify <NNN-nombre>` | `.agents/skills/sdd/sdd-clarify.md` | Revisa la spec con mentalidad de QA para detectar ambigüedades. |
| `/sdd-plan <NNN-nombre>` | `.agents/skills/sdd/sdd-plan.md` | Redacta el plan técnico detallado (`plan.md`) de una spec aprobada. |
| `/sdd-tasks <NNN-nombre>` | `.agents/skills/sdd/sdd-tasks.md` | Desglosa el plan en tareas atómicas con checkboxes en `tasks.md`. |
| `/sdd-implement <NNN-nombre> <Tn>` | `.agents/skills/sdd/sdd-implement.md` | Implementa una sola tarea con TDD estricto (Red-Green) y se detiene. |
| `/sdd-validate <NNN-nombre>` | `.agents/skills/sdd/sdd-validate.md` | Realiza la auditoría final RF por RF de toda la spec implementada. |
| `/sdd-change <NNN-nombre> <cambio>`| `.agents/skills/sdd/sdd-change.md` | Aplica una modificación comenzando por la spec antes del código. |
| `/sdd-status <NNN-nombre>` | `.agents/skills/sdd/sdd-status.md` | Informa la fase actual, tareas completadas y siguiente paso exacto. |
| `/feature <descripción>` | `.agents/skills/sdd/feature.md` | Planifica una nueva funcionalidad antes de modificar cualquier archivo. |

---

## 7. Protocolo de Memoria y Cierre de Tarea

Cada vez que se complete una fase, tarea o ajuste en el repositorio, es **obligatorio** seguir este checklist:

1. **Ejecutar la suite completa de pruebas:**
   ```powershell
   node --test tests/*.test.js
   ```
   Todas las pruebas deben concluir en verde.
2. **Actualizar `memory.md`:**
   - Sección 1: Si hubo adiciones o cambios al esquema de datos o llaves de persistencia.
   - Sección 2: Si se adoptó, modificó o retiró alguna decisión técnica o de diseño.
   - Sección 3: Añadir en la parte superior del historial una entrada fechada (`### YYYY-MM-DD — <Título>`) detallando lo implementado.
3. **Respuesta al Usuario (Formato Estricto de `AGENTS.md`):**
   - Resumen de 3-4 líneas de lo creado o modificado.
   - Pasos para probarlo o verificarlo.
   - Decisiones tomadas por cuenta propia que el usuario deba revisar.
   - Confirmación explícita de que `memory.md` ha sido actualizado.
