# Handoff para Freebuff · Trans00–Trans06

## Mandato para el agente receptor

Continúa el desarrollo de las campañas en `uniscrolliabrain-cloud/agente`. Empieza por la convergencia local y las pruebas reproducibles. Ejecuta las comprobaciones en vivo en paralelo si tu runner ya dispone del secreto HTTP o de un token de servicio autorizado. Un fallo del vínculo de Codex deja pendiente la evidencia en vivo y permite continuar el trabajo offline.

Conserva cambios del operador. Usa una rama de trabajo sobre la base indicada tras verificar los heads. Este handoff autoriza planificación técnica. La autorización para integrar, hacer push, abrir PR, publicar o desplegar corresponde al operador. Trabaja exclusivamente en desarrollo. Evita ejecutar sondas que escriban, envíen mensajes, llamen a teléfonos o generen costes salvo autorización expresa para esa sonda.

## Punto de partida

Refs observadas en GitHub por Codex el 27 de noviembre de 2026:

| Rama | SHA |
| --- | --- |
| `integration/trans00-core` | `892061c98f21c371739c16c781a7ad8d9bbe4c61` |
| `main` | `e496dd43338107f07d48d62d3e0ea03c0e0c6c89` |
| `infra/trans00-provider-readiness` | `1bb25aba34b2d362d47fadcb72c652a71154b55d` |
| `exec/Trans01` | `bd3a31ec` |
| `exec/Trans02` | `c99951fe` |
| `exec/Trans03` | `5e8b1272` |
| `exec/Trans04` | `9eb03fd5` |
| `exec/Trans05` | `ba56896b` |
| `exec/Trans06` | `7663df43` |

Codex confirmó en un repositorio temporal que las seis ramas `exec` son ancestros de integration y que infra queda fuera de esa historia. Integration está 88 commits por delante y 32 por detrás de main. El último commit de integration cambia dos documentos respecto a `9eb03fd5`. Toma integration como base de trabajo mientras se mantengan estas relaciones. Refresca refs, confirma ancestry con `git merge-base --is-ancestor` y usa `git rev-list --left-right --count integration...main` con refs reales de tu clon. Si cambiaron los heads, recalcula antes de integrar trabajo. Las ramas originales de campaña fueron clasificadas como superadas mediante comparación de contenido. Evita incorporar esas ramas en bloque.

La auditoría previa reportó sobre `892061c9` un typecheck correcto y 332 pruebas focalizadas, con 319 PASS, 0 FAIL y 13 SKIP por falta de PostgreSQL nativo. El gate integral, la suite completa y la compatibilidad con main quedaron pendientes. Otro agente reportó 12/12 pruebas offline en `1bb25aba` y `unregistered: []`. Conserva esas cifras con su SHA. La preparación de Codex verificó instalación, tipos y smoke sobre su checkout separado `ce032d90`.

Fuentes disponibles si vienen con el entorno receptor: `.audit/INFORME-AUDITORIA-CONVERGENCIA-2026-11-27.md` en el workspace del auditor y `docs/TRANS-PROVIDER-READINESS-AUDIT.md` en la rama infra.

## Orden de ejecución

1. **Fija la base y captura el estado inicial.** Registra SHA, diff, versiones, comandos y códigos de salida. Lee los ledgers y criterios de aceptación bajo `docs/convergencia-operativa-12x4/00-coordinacion-multiagente/` en el árbol vigente. El resumen anterior contiene una discrepancia: 282 PENDING + 3 IN_PROGRESS + 4 NOT_RUN da 289, frente a 288 declarados. Recuenta desde los archivos antes de definir el denominador o cerrar bloques.
2. **Trans00 · integra el trabajo de readiness de manera selectiva.** Inspecciona los cambios de `1bb25aba` y su serie previa frente a integration. En `892061c9` falta `scripts/trans-provider-readiness.mjs`; compara el registro y el resolver antes de portarlos. Integration ya incluye `tests/trans01-openrouter-app-wiring.test.ts` y `tests/trans02-openrouter-jev.test.ts`; conserva sus contratos. Porta las piezas necesarias juntas, incluido el contrato offline, el registro, las pruebas y los scripts de entrada. Evita aplicar a ciegas un commit cuya base pueda faltar. Ejecuta `corepack pnpm infra:readiness`, `corepack pnpm infra:readiness:test`, las pruebas focalizadas y el typecheck. Lee en el script la semántica y el exit status de `--strict` antes de usarlo como gate. Criterios de aceptación: registro alineado con consumidores, nombres sin registrar detectados por el modo estricto y separación comprobada entre la cuenta OpenRouter del slow lane y JEV, incluso cuando falta una clave.
3. **Trans01–Trans04 · convierte el código existente en evidencia de aceptación.** Ejecuta los gates por campaña, contrasta cada bloque con su consumidor real y repara evidencia que remita a archivos vacíos o rutas efímeras. Para Trans01 regenera el log de TypeScript desde el SHA evaluado y valida su tamaño, hash y código de salida. Ejecuta las pruebas PostgreSQL omitidas en una base efímera dedicada si el runner dispone de PostgreSQL nativo; conserva SKIP si falta esa capacidad.
4. **Trans05 · monta longitudinal en el punto de entrada previsto por su campaña.** Los módulos están en `apps/server/src/engine/cognition/v2/longitudinal/`. La búsqueda de referencias a `longitudinal/` fuera de esa carpeta en `apps/server/src` no devolvió coincidencias. Confirma el alcance y revisa también reexportaciones o consumidores indirectos. Si sigue sin montar, conecta el consumidor previsto y valida un recorrido desde el punto de entrada hasta persistencia/lectura, incluyendo aislamiento entre tenants cuando aplique. Los tests internos del módulo son evidencia parcial.
5. **Trans06 · ejecuta los criterios documentales y operativos.** Integration contiene `tests/trans06-{composition,kernel-regressions,primitives}.test.ts`; inclúyelos al validar el alcance. Verifica cada artefacto contra el código vigente y registra el SHA y las pruebas de aceptación. Mantén el estado de cada bloque sustentado por su propia evidencia.
6. **Cierra la convergencia.** Ejecuta el gate integral y la suite completa en un runner con tiempo suficiente. Verifica compatibilidad con main en un checkout desechable o con un análisis de merge sin cambiar ramas compartidas. Registra conflictos por archivo y semántica. Deja listos los cambios locales y su resumen para que el operador autorice el paso siguiente.

## Comprobación Doppler en runner autorizado

Objetivo único de acceso: proyecto `agntiapro`, configuración `dev_campaign_transversal_leads_ia`. El conector de una auditoría anterior reportó un service token limitado a esa configuración. Codex observó `has_saved_binding: false`, ausencia del token en la instancia y un 403 de CONNECT antes de llegar a Doppler. La disponibilidad del conector se verifica en el runner receptor. Usa su vínculo existente y mantén el token fuera de la consola, logs, argumentos de comandos, archivos del repositorio y artefactos.

Si el runner tiene el token disponible mediante binding, esta comprobación descarta el cuerpo y solo informa el estado HTTP. El proxy, cuando aplique, debe sustituir el marcador de secreto en este destino. Ejecuta en Bash:

```bash
(
  set +x
  : "${DOPPLER_TOKEN:?El runner requiere una vinculación autorizada}"
  case "$DOPPLER_TOKEN" in
    *$'\n'*|*$'\r'*) exit 1 ;;
  esac
  token="$DOPPLER_TOKEN"
  token="${token//\\/\\\\}"
  token="${token//\"/\\\"}"
  status="$(printf 'header = "Authorization: Bearer %s"\n' "$token" |
    curl -q --config - --silent --show-error --max-time 20 \
      --output /dev/null --write-out '%{http_code}' \
      'https://api.doppler.com/v3/configs/config/secrets?project=agntiapro&config=dev_campaign_transversal_leads_ia&include_dynamic_secrets=false')" || exit 1
  printf 'Doppler HTTP %s\n' "$status"
  [[ "$status" == 200 ]]
)
```

Un HTTP 200 verifica acceso a la configuración. Para verificar cada proveedor, revisa primero la implementación de su sonda, el entorno que usará y sus efectos. Ejecuta únicamente sondas de lectura autorizadas con un modo que omita valores y datos sensibles. Un stub o un contrato satisfecho sigue siendo evidencia offline. Si una sonda falla, registra por separado red, autenticación, permisos, configuración y comportamiento según la evidencia disponible. Evita duplicar configuraciones o credenciales y evita producción. Si el runner carece de acceso, documenta el bloqueo exacto y sigue con los pasos offline.

## Entrega esperada del agente receptor

- SHA base, SHA evaluado y resumen de cambios por campaña.
- Tabla por bloque con criterio de aceptación, estado, comando o ruta de evidencia y dependencia pendiente. Separa PASS, FAIL, SKIP y NO EJECUTADO. Conserva fecha, versiones, SHA y exit status.
- Matriz de proveedores con consumidor real, configuración requerida, tipo de sonda y resultado offline o en vivo. Elimina valores y datos sensibles de la evidencia.
- Lista de decisiones que requieren al operador, con las tareas offline ya resueltas y el próximo paso concreto para cada bloqueo abierto.
