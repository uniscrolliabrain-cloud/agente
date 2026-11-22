# Estado y cierre de la integración transversal · 22 de noviembre de 2026

> **Estado documental:** PARTIAL · Snapshot de trabajo, con verificaciones pendientes por campaña.
> **Revisado contra:** `main@8c6a951` y los SHA de rama consignados abajo.
> **Fuente:** este informe actualiza el estado operativo del [informe 05](05-INFORME-POR-RAMA.md) y conserva las decisiones de alcance de la [auditoría 06](06-AUDIT-RECOMENDACIONES-Y-VIGENCIA-DOCS.md).

## Alcance

Incluye la base común, Cognition V2, conversación, baseline móvil C02, scaffold histórico de voz, continuación C05 y sus fuentes documentales. El baseline C02 se mantiene en alcance porque es la referencia de regresión previa a los prototipos recientes. Por instrucción del propietario quedan fuera los prototipos y ramas recientes de UX, UI Lab y su despliegue Vercel, las ramas legales y los releases asociados. Por prudencia también queda fuera la documentación reciente de diseño y móvil. Los conteos frente a main usan referencias Git; las ramas excluidas no se evaluaron para este informe.

## Estado ejecutivo

- **Base de integración.** El preflight inicial partió de `3023637`. El snapshot de hoy sitúa `main` en `8c6a951`. Antes de fusionar se deben recalcular diffs, revalidar el árbol combinado y ejecutar los gates sobre ese árbol.
- **C02 y C03 están publicados para revisión.** Los PR #17 y #18 tienen los checks aplicables en verde. C02 conserva el baseline móvil probado; C03 aporta evidencia y una regresión de fail-closed sin activar RLS compartido en producción.
- **C04 tiene un bloqueo de CI.** El backend común existe y la continuidad con transcripciones sintéticas está probada localmente. En el PR #19, el test de cancelación entre coordinadores terminó con una promesa pendiente mientras Node daba el bucle por agotado. El sondeo con `unref()` es la causa probable que debe validarse. La ejecución posterior de C05 no sustituye el gate global de C04.
- **C05 avanzó sobre C04.** Está 22 commits por delante de `c8293e8`. El gate propio de `2f420e4` está verde, incluida la corrección que exige `active: true` explícito. El ciclo de medios aún necesita montaje y validación integrada. La configuración detectada por el descriptor solo acredita que existen valores configurados.
- **Decisión actual.** GO para preparar y revisar cambios aislados. NO_GO para integrar C04 con el gate global rojo, habilitar medios reales o declarar la integración transversal terminada.

## Trabajo hecho y criterio de cierre por campaña

| Campaña | Hecho y evidencia | Falta para cerrar |
| --- | --- | --- |
| C00 · Preflight | Snapshot inicial de 19 ramas, 651 commits alcanzables, cinco tags, PRs y CI. El último despliegue de panel verificado entonces fue `18ee1c1` y se registró el sitio en Vercel como componente distinto. | Actualizar inventario y procedencia del panel para el siguiente release. La evidencia histórica no certifica las imágenes activas hoy, el worker ni la demo privada. |
| C01 · Arqueología | Se enumeraron 651 commits del snapshot inicial; se calcularon merge-base, divergencia y equivalencias. W4–W6, Doppler, ramas Cognition y cadena WIP móvil ya tienen decisiones fundadas en historial. | Cerrar revisión de merges, reversiones implícitas, dependencias y equivalencia semántica por archivo. Completar ledger con SHA, ruta, destino, motivo y prueba. Las referencias fuera de alcance se mantienen fuera de esta decisión. |
| C02 · Baseline móvil | SHA `18ee1c1` trasladado por fast-forward al PR #17, con informe adicional. JS/CSS locales coincidieron byte a byte con lo servido por el panel durante la revisión. CDP, Playwright móvil, typechecks, build, coherencia 7/7 y suite de 874 aprobadas, 0 fallos, 21 omitidas y 5 TODO. | Confirmar SHA de demo privada y teclado en dispositivo físico; al combinar con C04 repetir cambio de hilo, cancelación, recuperación de red, teclado, gestos, FAB y continuidad de mensajes. |
| C03 · Kernel y tenant | W4–W6 equivalentes en main. PostgreSQL 17.9 sintético: 70/70 de la base; regresión HTTP 2/2 y CI del PR #18 en verde. Cognition compartido queda fail-closed; business-write experimental sigue retirado. | Certificar despliegue compartido con rol real restringido, migración RLS y revocación. Exigir ActionService y aprobación antes de cualquier escritura de negocio V2. |
| C04 · Conversación universal | PR #19 con historial persistido para inferencia, append transaccional idempotente, tenant y actor autenticados, rol activo, adjuntos autorizados, guardado de texto, sesiones de voz/vídeo con consentimiento y cancelación, códigos de error y barrido de sesiones. Recorrido HTTP texto → voz → vídeo → texto con transcripciones e inferencia simuladas. | Reproducir y corregir la salida prematura de la prueba de cancelación, repetir gate global y comprobar combinación con C02. Revisar procedencia de hilos históricos sin etiqueta antes de migrar entre empresas. Distinguir C04 (texto y estado) de la captura y reproducción de medios reales. |
| C05 · Scaffold y ciclo de medios | `2f420e4`: descubrimiento autorizado sin exponer claves o IDs, inspección durable, transporte mock, adaptador de apertura/interrupción/cierre, revalidación de epoch y revisión, cleanup tras apertura parcial y rol explícitamente activo. CI específica en verde. | Integrar sobre C04 corregida con diff propio, repetir suite V2 completa y gate global. Verificar montaje del ciclo, exclusión distribuida de apertura, lease durable, límites de cleanup y reintentos de cierre. Mantener adaptadores externos deshabilitados hasta C06. |
| C06 · Proveedores | Identificados los contratos y configuración requerida para ElevenLabs y Anam. Los mocks y descriptores permiten validar condiciones sin acceder a credenciales. | Verificar contratos y SDK, credenciales efímeras, STT/TTS y avatar, consentimiento, permisos, transporte y expiración. Probar primero con mocks y luego, con autorización, en entorno de pruebas controlado. |
| C07 · Transporte y latencia | C04 propaga cancelación a inferencia simulada y documenta el contrato previsto por sesión, turno, epoch y secuencia. | Implementar y probar entrega incremental, cancelación hasta TTS/playback, control de presión, reconexión y replay acotado. Medir p50/p95, primer token y primer audio. Separar recibo del servidor, entrega al cliente y reproducción real. La API de transcripciones actual responde JSON al finalizar. |
| C08 · UX de integración | El baseline previo C02 da las regresiones que debe conservar el flujo. | Verificar controles y estados del flujo conversacional integrado cuando se apruebe esa revisión. Las ramas recientes de UX quedan fuera de este informe por instrucción del propietario. |
| C09 · Vigencia | Auditoría 06 define D00–D04. Se contó en el snapshot C04 un total de 1.121 Markdown, 539 bajo `docs/`. | Actualizar recuento, crear matriz de vigencia por archivo y redirecciones, incorporar cabeceras debajo del H1, conservar contenido histórico, enlazar índice canónico y probar referencias de los documentos modificados. |
| C10 · Cierre y operación | Hay PRs aislados, reportes y límites de integración documentados. | Verificar el árbol combinado, gates CI, Postgres restringido, smoke, rollback y procedencia del SHA desplegado. Solicitar aprobación expresa para cada merge, despliegue o borrado. |

## Ramas y decisión de reconciliación

Los conteos son commits propios / commits exclusivos de main al momento del informe. La ascendencia y los patches equivalentes se verifican por separado.

| Rama incluida | HEAD | Propios / Main | Decisión y siguiente comprobación |
| --- | --- | ---: | --- |
| `main` | `8c6a951` | 0 / 0 | Base actual. Revalidar el árbol combinado. |
| `docs/integracion-transversal-coherente-20261121` | `eebe09a` | 8 / 1 | Coordinación documental. SHA anterior a este informe. |
| `campaign/c02-baseline-movil` | `a61978e` | 23 / 1 | PR #17. Integrar el baseline; ejecutar las regresiones sobre el candidato combinado. |
| `campaign/c03-cognition` | `add8798` | 1 / 1 | PR #18. Evidencia y regresión; conservar el bloqueo multi-tenant compartido. |
| `campaign/c04-conversacion-universal` | `c8293e8` | 11 / 1 | PR #19. Resolver CI y revalidar el contrato común. |
| `feat/continuacion-c05-voz-cognition-v2` | `2f420e4` | 33 / 1 | Apilada sobre C04. Revisar solo su delta una vez reconciliada la base. |
| `fix/mobile-chat-sheet-keyboard-gestures` | `18ee1c1` | 22 / 1 | PR #16 en borrador; su código está contenido en C02. Revisar el código una sola vez. |
| `wip/mobile-chat-sheet` | `365d9fd` | 14 / 1 | Ancestro de la rama móvil. Referencia histórica. |
| `feat/cognition-v2-W4-backfill` | `88f4246` | 1 / 37 | Equivalente af3b16d en main. Evitar reaplicar el backfill. |
| `feat/cognition-v2-W5-outcomes` | `33f9760` | 1 / 35 | Equivalente 812ea36. Mantener evidencia y receipts con alcance. |
| `feat/cognition-v2-W6-jev-contract` | `1f63fa9` | 2 / 35 | Equivalentes 812ea36 y 403bc74. Activación externa sujeta a su gate. |
| `feat/cognition-v2-runtime-C00-C15` | `685ef3a` | 0 / 22 | Ancestro de main. Fuente del runtime vigente. |
| `feat/cognition-v2-stepwise-001-504c0b5b` | `770f86e` | 0 / 13 | Ancestro de main. Retiro del stub de escritura en 770f86e. |
| `feat/cognition-v2-worker-reliability-504c0b5b` | `2b117b6` | 0 / 14 | Ancestro de main. Referencia de disponibilidad y recuperación. |
| `feat/voice-avatar-scaffold` | `f530eee` | 11 / 66 | Extracción selectiva de perfiles y adaptadores. Mantener una sola conversación y reutilizar C04/C05. |
| `docs/2026-11-17-universal-conversation` | `821580a` | 16 / 14 | Diagnóstico y contratos de hilo/concurrencia. Contrastar por archivo en C09. |
| `docs/doppler-auth` | `6ef939a` | 1 / 9 | Patch equivalente y PR #15 fusionado. Referencia de procedencia y autenticación. |
| `docs/observability-dogfooding-audit-20261117` | `8ce0869` | 5 / 9 | Contrastar telemetría y contratos durante C07/C09. |
| `docs/vigencia-2026-11-10` | `cc0b755` | 4 / 72 | Revisar documentos y sucesores en C09. |
| `audit/preflight-cognition-option3-20261115` | `1e007d7` | 57 / 66 | Conservar diseño y decisiones históricas; contrastar con el runtime ejecutable. |
| `audit/update-docs-20261118` | `626c378` | 75 / 66 | Clasificar y deduplicar en C09. |
| `docs/audit-30-dominios-runtime-20261115` | `546d264` | 70 / 66 | Comparar por dominio con código y pruebas vigentes. |

Las ramas de campaña publicadas `campaign/c00-preflight` (`ad8a34a`) y `campaign/c01-arqueologia` (`28bb383`) conservan los commits originales. Esta rama también contiene los [informes C00](evidence/C00-REPORT.md) y [C01](evidence/C01-REPORT.md), la [procedencia](evidence/DEPLOY-PROVENANCE.md) y la [matriz inicial](evidence/BRANCH-MATRIX.md). Los TSV son evidencia del snapshot original y no incluyen las referencias aparecidas después. Los worktrees de otros entornos siguen fuera de la observación.

## Orden de integración y comprobaciones

1. **Restablecer la CI de C04.** Corregir el test de sondeo entre coordinadores con espera acotada que mantenga vivo el proceso y probar la señal del proveedor, la ausencia de turnos obsoletos y el código de error. Ejecutar el mismo comando de CI y conservar el resultado del SHA exacto.
2. **Validar el candidato C02+C04 contra main actualizado.** Revisar especialmente `useChat.ts`, las rutas de hilos, la representación de mensajes y el streaming. C02 y C04 modifican superficies comunes. Probar la carga de datos antiguos, fallos de persistencia, aislamiento al cambiar de tenant y el recorrido móvil. Mantener trabajos de C03 separados en revisión, con su prueba de fail-closed incluida en el conjunto final.
3. **Actualizar C05 sobre la base C04 revisada.** Medir el delta respecto de C04, sin volver a incorporar los commits de C04 como si fueran de C05. Ejecutar typecheck, suite V2, medios simulados, HTTP y CI global sobre el candidato. Revisar condiciones de apertura, revocación y cierre desde procesos distintos y documentar recuperación.
4. **Habilitar C06/C07 por etapas.** Aprobar la configuración de pruebas antes de conectar proveedores. Verificar rol, tenant, consentimiento y permisos antes de expedir credenciales de sesión. El audio y vídeo deben usar el mismo hilo ya probado, con cancelación y métricas verificables.
5. **Cerrar D00–D04 y el release.** Asignar estado y SHA a cada contrato incluido. Publicar índice y evidencias, comprobar diffs y rollback, registrar aprobación y comprobar la imagen/SHA del panel y worker tras un despliegue autorizado.

## Evidencias primarias

- Baseline móvil y sus checks. [PR #17](https://github.com/uniscrolliabrain-cloud/agente/pull/17) · [CI](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44905930414)
- Cognition V2 y controles de arranque. [PR #18](https://github.com/uniscrolliabrain-cloud/agente/pull/18) · [CI](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44908980004)
- Conversación universal, cancelación y mantenimiento. [PR #19](https://github.com/uniscrolliabrain-cloud/agente/pull/19) · [Informe C04](https://github.com/uniscrolliabrain-cloud/agente/blob/c8293e8/docs/integracion-transversal-2026-11-21/evidence/C04-REPORT.md) · [CI fallida](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44945470616/job/136971704133)
- Capacidades y ciclo de vida de voz. [Informe C05](https://github.com/uniscrolliabrain-cloud/agente/blob/2f420e4/docs/integracion-transversal-2026-11-21/evidence/C05-RECONCILIACION-INICIAL.md) · [CI específica](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/45040913830)
- Último despliegue del baseline comprobado durante C00/C02. [Registro](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44898256365)
