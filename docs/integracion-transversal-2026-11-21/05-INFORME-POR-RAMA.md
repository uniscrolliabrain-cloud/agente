# Informe de integración por rama · 2026-11-21

Inventario actualizado tras fetch con **22 ramas remotas y dos ramas de campaña exclusivamente locales**. El punto de comparación es `main` en `3023637d72994460b1aa4742f558557ec0c69922`. Los conteos muestran commits propios de cada lado desde su divergencia. La equivalencia de patch se comprobó con `git cherry` y se detalla donde se usó para decidir. Una coincidencia histórica requiere comprobar el comportamiento vigente cuando el código posterior ha cambiado.

## Campañas y entregables

| Campaña | Trabajo realizado | Estado |
| --- | --- | --- |
| C00 · Preflight | Capturé los SHA remotos, worktree, cinco tags, PRs, CI y procedencia de Fly y Vercel. El snapshot inicial cubrió 19 ramas y 651 commits alcanzables. | Cerrada para auditoría. Falta comprobación directa de las imágenes y alias activos en proveedores. |
| C01 · Arqueología | Guardé inventario, matriz, equivalencias, registro histórico y dos reversiones explícitas. | En curso. Pendientes merges, reversiones implícitas y decisiones por archivo. |
| C02 · Chat móvil | Integré el baseline exacto en una rama aislada, ejecuté gates y comparé los activos del panel público. | PR #17 abierto, CI en verde. |
| C03 · Cognition V2 | Verifiqué W4/W5/W6, RLS con PostgreSQL 17.9 y añadí la regresión de arranque compartido. | PR #18 abierto, CI en verde. |
| C04–C10 | Conversación común, voz y avatar, latencia, UX, vigencia documental e integración final. | Pendientes. |

El despliegue de producción registrado para `18ee1c1` publicó imágenes etiquetadas para API y worker en Fly y el sitio en Vercel. La verificación posterior reprodujo byte por byte los dos activos de entrada del panel web. La procedencia de la demo privada y las imágenes activas de cada máquina quedan abiertas. [Despliegue](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44898256365)

## Ramas remotas

### `main`

HEAD `3023637d72994460b1aa4742f558557ec0c69922`, base común `3023637d7299`, **+0 / −0** frente a main. El diff desde el ancestro común abarca 0 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/3023637d72994460b1aa4742f558557ec0c69922)

**Trabajo realizado.** Fijé este commit como base reproducible de C00–C03. Verifiqué el CI del SHA y leí el workflow de despliegue, el Dockerfile y la configuración de Fly. Usé su árbol para ejecutar el control de Cognition V2.

**Estado.** Base de integración. El último despliegue registrado partió de la rama móvil. Cualquier integración a main sigue sujeta a aprobación.

### `audit/preflight-cognition-option3-20261115`

HEAD `1e007d75b470490fe2ca8943ed5dc91803af039a`, base común `54b8d5407a85`, **+57 / −65** frente a main. El diff desde el ancestro común abarca 37 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/1e007d75b470490fe2ca8943ed5dc91803af039a)

**Trabajo realizado.** Registré 57 commits a favor y 65 por detrás. El diff desde el ancestro común contiene documentación del rediseño. Verifiqué Cognition contra código y pruebas de main en C03.

**Estado.** Queda conciliar las decisiones históricas con los contratos vigentes, por documento.

### `audit/update-docs-20261118`

HEAD `626c378ac54df62b026e2d0c277bf6bce7f7bbec`, base común `54b8d5407a85`, **+75 / −65** frente a main. El diff desde el ancestro común abarca 69 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/626c378ac54df62b026e2d0c277bf6bce7f7bbec)

**Trabajo realizado.** Registré 75 commits a favor y 65 por detrás. Confirmé alcance documental de 69 archivos.

**Estado.** Queda revisión de vigencia y deduplicación con las demás auditorías.

### `campaign/c02-baseline-movil`

HEAD `a61978e349e94cc54281e0a23a22eb61dfe6a9fd`, base común `3023637d7299`, **+23 / −0** frente a main. El diff desde el ancestro común abarca 26 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/a61978e349e94cc54281e0a23a22eb61dfe6a9fd)

**Trabajo realizado.** Creé la rama desde main, avancé al SHA exacto del PR móvil y añadí el informe C02. Publiqué la rama y abrí el PR #17. El gate local y GitHub registraron 874 aprobadas, 0 fallos, 21 omitidas y 5 TODO. También pasaron typecheck global y web, compilación, coherencia 7/7, CDP y Playwright.

**Estado.** Disponible para revisión. La integración con Docker y el gate de release se reservan a main en el workflow. [PR #17](https://github.com/uniscrolliabrain-cloud/agente/pull/17) · [CI](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44905930414)

### `campaign/c03-cognition`

HEAD `add8798b71a6a4cb16855d76085e84d737cd5117`, base común `3023637d7299`, **+1 / −0** frente a main. El diff desde el ancestro común abarca 2 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/add8798b71a6a4cb16855d76085e84d737cd5117)

**Trabajo realizado.** Creé la rama desde main, añadí una regresión del rechazo de arranque compartido y su informe, publiqué y abrí el PR #18. La suite base V2 pasó 70/70 contra PostgreSQL 17.9 desechable, incluidas RLS con rol restringido, revocación y concurrencia. Tras el cambio pasaron 2/2 pruebas del archivo HTTP y el CI del PR.

**Estado.** Disponible para revisión. Sigue pendiente certificar el entorno compartido y el camino de escritura gobernada por ActionService. [PR #18](https://github.com/uniscrolliabrain-cloud/agente/pull/18) · [CI](https://github.com/uniscrolliabrain-cloud/agente/actions/runs/44908980004)

### `docs/2026-11-17-universal-conversation`

HEAD `821580a9401d686d573f8acdb8d7de43ac861e5c`, base común `2b117b6fa4f0`, **+16 / −13** frente a main. El diff desde el ancestro común abarca 16 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/821580a9401d686d573f8acdb8d7de43ac861e5c)

**Trabajo realizado.** Confirmé alcance documental y registré su HEAD. Contrasté su papel con el handoff de arquitectura.

**Estado.** Fuente de C04. Queda decidir qué contratos corresponden al runtime actual y cuáles requieren implementación.

### `docs/audit-30-dominios-runtime-20261115`

HEAD `546d264eda148cf765195cdf8d624099e4442399`, base común `54b8d5407a85`, **+70 / −65** frente a main. El diff desde el ancestro común abarca 68 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/546d264eda148cf765195cdf8d624099e4442399)

**Trabajo realizado.** Registré 70 commits a favor y 65 por detrás y confirmé 68 archivos documentales en el delta.

**Estado.** Queda contrastar por dominio el inventario histórico con el código ejecutable.

### `docs/doppler-auth`

HEAD `6ef939ae0387ff298e4ad1f19516c0d1c0e5e5e6`, base común `3f15ca824af2`, **+1 / −8** frente a main. El diff desde el ancestro común abarca 1 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/6ef939ae0387ff298e4ad1f19516c0d1c0e5e5e6)

**Trabajo realizado.** Git detectó un patch equivalente en main y GitHub registra el PR #15 como fusionado. Contrasté la configuración de despliegue al reconstruir la procedencia.

**Estado.** Equivalente integrado. La validación del estado de proveedores externos quedó registrada aparte.

### `docs/integracion-transversal-coherente-20261121`

HEAD `114c1c60e9e810e493a35dfcefdb09683ad2757a`, base común `3023637d7299`, **+5 / −0** frente a main. El diff desde el ancestro común abarca 5 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/114c1c60e9e810e493a35dfcefdb09683ad2757a)

**Trabajo realizado.** Leí los cinco documentos de coordinación y usé sus campañas, criterios de evidencia y restricciones. Incorporo aquí este informe.

**Estado.** Fuente de coordinación. El SHA de la ficha corresponde al estado antes de publicar este documento.

### `docs/observability-dogfooding-audit-20261117`

HEAD `8ce08698a72af0d601a4d68d809f830154afde21`, base común `3f15ca824af2`, **+5 / −8** frente a main. El diff desde el ancestro común abarca 5 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/8ce08698a72af0d601a4d68d809f830154afde21)

**Trabajo realizado.** Inventarié su HEAD y cinco archivos de documentación del delta. El handoff final está identificado en 8ce0869.

**Estado.** Queda contrastar métricas y telemetría con el runtime en C07/C09.

### `docs/vigencia-2026-11-10`

HEAD `cc0b755fc08b817a3d43cdb1495c0d0897812bc2`, base común `ecef3893c5c3`, **+4 / −71** frente a main. El diff desde el ancestro común abarca 14 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/cc0b755fc08b817a3d43cdb1495c0d0897812bc2)

**Trabajo realizado.** Registré divergencia, merge y cambios documentales, incluido el whitepaper. La fecha y el merge de main son evidencia histórica.

**Estado.** Queda revisar vigencia y vínculos a documentos sucesores antes de clasificarla definitivamente.

### `feat/cognition-v2-W4-backfill`

HEAD `88f4246e930e3cea9f96ae8be97a7f5475358804`, base común `11b3ebd0dfdf`, **+1 / −36** frente a main. El diff desde el ancestro común abarca 12 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/88f4246e930e3cea9f96ae8be97a7f5475358804)

**Trabajo realizado.** Comparé patches y localicé af3b16d como equivalente en main. Verifiqué las pruebas de backfill reanudable, revocación después de la vista previa y concurrencia de la importación.

**Estado.** Equivalente integrado. Conservar su referencia para la procedencia.

### `feat/cognition-v2-W5-outcomes`

HEAD `33f97608c2d62935e019e06ab38963b4fc51b9b7`, base común `af3b16d244b6`, **+1 / −34** frente a main. El diff desde el ancestro común abarca 12 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/33f97608c2d62935e019e06ab38963b4fc51b9b7)

**Trabajo realizado.** Localicé 812ea36 como equivalente en main y verifiqué los casos de resultados derivados de receipts con alcance, ejecución fallida y cancelación.

**Estado.** Equivalente integrado. Los resultados verificados mantienen su separación de hipótesis y ACK.

### `feat/cognition-v2-W6-jev-contract`

HEAD `1f63fa9929a48c16f02344a0b1efa52216f2e91a`, base común `af3b16d244b6`, **+2 / −34** frente a main. El diff desde el ancestro común abarca 19 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/1f63fa9929a48c16f02344a0b1efa52216f2e91a)

**Trabajo realizado.** Localicé equivalentes para sus dos commits, 812ea36 y 403bc74. Contrasté el adaptador Jev y las pruebas de revocación, permisos y límites en el código base.

**Estado.** Equivalentes integrados. La activación en vivo del proveedor queda fuera de C03.

### `feat/cognition-v2-runtime-C00-C15`

HEAD `685ef3a17e77245fdb2d7b438584c237beccd91e`, base común `685ef3a17e77`, **+0 / −21** frente a main. El diff desde el ancestro común abarca 0 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/685ef3a17e77245fdb2d7b438584c237beccd91e)

**Trabajo realizado.** Comprobé que HEAD es ancestro de main. Consulté la evidencia de ejecución C15 al revisar la instalación y los controles de Cognition V2.

**Estado.** Historial integrado. Las pruebas de C03 se ejecutaron desde main.

### `feat/cognition-v2-stepwise-001-504c0b5b`

HEAD `770f86e86f84cf66790884f59e2734228db9e934`, base común `770f86e86f84`, **+0 / −12** frente a main. El diff desde el ancestro común abarca 0 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/770f86e86f84cf66790884f59e2734228db9e934)

**Trabajo realizado.** Comprobé ascendencia y confirmé que 770f86e retiró de main el adaptador experimental incompatible con el camino de aprobación de ActionService.

**Estado.** Historial integrado. La escritura empresarial V2 sigue bloqueada.

### `feat/cognition-v2-worker-reliability-504c0b5b`

HEAD `2b117b6fa4f030651ced611da9860dfcfdd6fd71`, base común `2b117b6fa4f0`, **+0 / −13** frente a main. El diff desde el ancestro común abarca 0 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/2b117b6fa4f030651ced611da9860dfcfdd6fd71)

**Trabajo realizado.** Comprobé ascendencia y contrasté el reporte W11 con las pruebas actuales de disponibilidad del worker, reinicio y recuperación en la suite C03.

**Estado.** Historial integrado. El test de salud verifica 503 sin worker y recuperación al arrancarlo.

### `feat/legal-privacy-ai-compliance`

HEAD `e40a7d382f8366b6174932cca408def9fa243466`, base común `3023637d7299`, **+8 / −0** frente a main. El diff desde el ancestro común abarca 8 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/e40a7d382f8366b6174932cca408def9fa243466)

**Trabajo realizado.** Confirmé alcance documental de ocho archivos de compliance por diff con el ancestro común.

**Estado.** Clasificación documental. Queda validar la vigencia de sus comprobaciones y contrastarlas con producción.

### `feat/mobile-chat-multimodal-ux`

HEAD `2ab9fe4028cab4e1aab129232b3cefe5826b6855`, base común `3023637d7299`, **+25 / −0** frente a main. El diff desde el ancestro común abarca 32 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/2ab9fe4028cab4e1aab129232b3cefe5826b6855)

**Trabajo realizado.** Detecté la rama al actualizar referencias y revisé el diff inicial y el documento del prototipo. La primera revisión fue en 7bb8990. En el snapshot actual observé otros dos commits, 9556833 y 2ab9fe4, sobre la demo de vídeo y la visibilidad de llamadas al colapsar el chat.

**Estado.** Los tres commits posteriores a 18ee1c1 quedan fuera de C02. Queda revisar sus cambios finales y verificar los contratos de medios, persistencia, permisos y sesiones.

### `feat/voice-avatar-scaffold`

HEAD `f530eee1325a166dfd62794f1f73731245a1ce06`, base común `54b8d5407a85`, **+11 / −65** frente a main. El diff desde el ancestro común abarca 21 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/f530eee1325a166dfd62794f1f73731245a1ce06)

**Trabajo realizado.** Leí la auditoría del scaffold y medí su divergencia y alcance. Registré perfiles, sesiones y adaptadores como candidatos a revisión. Los contratos de identidad, conversación y proveedores requieren contraste con main.

**Estado.** En espera de C05/C06. Queda revisar patches por archivo y verificar SDK, auth, One Thread e interrupción con pruebas.

### `fix/mobile-chat-sheet-keyboard-gestures`

HEAD `18ee1c1f0387e5a9f3cf7044936bbb687dac77c6`, base común `3023637d7299`, **+22 / −0** frente a main. El diff desde el ancestro común abarca 25 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/18ee1c1f0387e5a9f3cf7044936bbb687dac77c6)

**Trabajo realizado.** Verifiqué el PR #16 y trasladé sus 22 commits intactos a C02 por fast-forward. Compilé su SHA y comparé el JS y CSS con los activos servidos por el panel público mediante SHA-256. Ejecuté CDP y Playwright para FAB, envío único, gestos, cancelación, viewport visual, reapertura, scroll, continuidad de hilo, dictado simulado y recuperación de red.

**Estado.** Baseline móvil verificado. La demo privada y el teclado físico siguen pendientes. [PR #16](https://github.com/uniscrolliabrain-cloud/agente/pull/16)

### `wip/mobile-chat-sheet`

HEAD `365d9fd0493969f8a990b45a4159d2fb17297e0e`, base común `3023637d7299`, **+14 / −0** frente a main. El diff desde el ancestro común abarca 19 archivos. [Commit](https://github.com/uniscrolliabrain-cloud/agente/commit/365d9fd0493969f8a990b45a4159d2fb17297e0e)

**Trabajo realizado.** Comprobé por ascendencia Git que su HEAD está contenido en la rama móvil del PR #16. El primer informe de ejecución móvil también usa este SHA como base.

**Estado.** Referencia histórica. El baseline C02 ya incorpora su historial.

## Ramas de campaña locales

### `campaign/c00-preflight`

El commit local `ad8a34a` conserva el informe C00, la procedencia del despliegue, la primera matriz, el registro de patches y el registro histórico. El trabajo se limitó a documentación.

### `campaign/c01-arqueologia`

El commit local `28bb383` conserva los informes C00/C01 y los TSV de commits y equivalencias. Se registraron las reversiones explícitas `312d2bf` (alcance de tenant en el bus) y `a27bda0` (botón de escalado desconectado). Quedan por revisar las demás reversiones, los merges y la vigencia por archivo.

## Alcance verificable

Las fichas cubren las referencias observadas en el remoto `origin` y las dos ramas locales de preflight y arqueología. Las ramas que aparecen únicamente como origen histórico de PRs cerrados se pueden consultar en el [historial de PRs](https://github.com/uniscrolliabrain-cloud/agente/pulls?q=is%3Apr). Los worktrees de otros equipos o entornos quedan fuera del inventario observado. El snapshot se puede reconstruir con `git for-each-ref refs/remotes/origin`, `git merge-base`, `git rev-list --left-right --count` y `git diff --name-only`.

Las campañas publicadas se revisan en los PR #17 y #18. La publicación de este informe es un cambio documental en la rama de coordinación. Las decisiones de merge a main, despliegue y eliminación de ramas siguen pendientes de autorización explícita.
