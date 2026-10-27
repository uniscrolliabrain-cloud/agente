# CAMPANA-VERDAD — el repo deja de mentir sobre sí mismo

> **Misión**: hoy el repositorio tiene un gate que **no puede pasar** y una capa de
> verificación que mide cosas que no son las que dice medir. Esta campaña no añade
> producto: consigue que la máquina que dice "esto está bien" diga la verdad, y que
> el mismo comando decida en local, en CI y antes de desplegar.
>
> **Rama**: `campaign/verdad`. **Base**: `campaign/authz-tenant @ c5a8c7c`.
> **Dueño**: Buffy (lane 1). **No necesita ninguna clave**: es todo estático.
>
> Hermanos: [HANDOFF-LLM.md](HANDOFF-LLM.md) (camino LLM, Codex),
> [HANDOFF-CODEX.md](HANDOFF-CODEX.md) (lanes y propiedad),
> [HANDOFF-CLINE.md](HANDOFF-CLINE.md) (corpus documental, Cline).

## 0. El problema, en una frase

`pnpm audit:coherence` falla (5/7) y con él el gate de despliegue. Pero de los dos
checks rojos, ninguno mide lo que su nombre promete:

- **`audit:idempotency`** no audita idempotencia: audita **comentarios con forma de
  marca** (`CAPABILITY_RUNNER_B10_V1`). Su criterio fatal es "la misma marca aparece
  en dos sitios con cuerpo distinto" (157) o "dos veces en el mismo fichero" (138).
  Un fichero con dos hunks marcados con la misma marca hace fallar el gate. Eso no es
  un defecto del código: es el libro de mantenedor convertido en barrera.
- **`audit:contracts`** sí mide algo real (contratos del dominio sin implementación),
  pero su heurística de "implementado" es *que el nombre aparezca en algún sitio*, así
  que 150 huérfanos mezclan tres cosas: código que falta, contratos muertos que
  deberían borrarse, y tipos que solo se consumen desde otro paquete.

Y por debajo de los dos, el defecto de fondo: **no existe un gate único**. `ci.yml`
lista seis audits a mano; `deploy.yml` llama a `audit:coherence`, que corre siete y
que el CI no ejecuta. Lo que se verifica en local, en CI y antes de desplegar son
tres listas distintas.

## 1. Lo que se toca y lo que no

**Escribo en** (mío, sin solapes):

```
scripts/audits/**                      los checks y sus definiciones
scripts/gate-report.ts                 nuevo: el gate unico
apps/server/src/engine/conversation.ts D12 (observador meta que se tira)
apps/server/src/engine/model.ts        solo contabilidad local, NO el esquema llm-usage
tests/gate/**  (nuevo)                 tests de los checks
docs/operacion/CAMPANA-VERDAD.md       este documento (tabla de progreso)
docs/operacion/GATE.md                 (nuevo) la definicion del gate, generada
.github/workflows/ci.yml, deploy.yml   solo para que llamen al gate unico (ver V5)
```

**No toco** (es de Codex, y avisarme no arregla un conflicto):

```
packages/integrations/src/llm/**   apps/server/src/engine/model-chain.ts
apps/server/src/engine/embeddings.ts   engine/planner/**   engine/execution/**
engine/context/**   kernel/authors/**   packages/integrations/src/adapters/**
packages/workspaces/**   apps/web/**
```

Tampoco toco el esquema de `llm-usage`, la cuota ni el coste: eso es **F2 del
mandato LLM**. Mi frontera es `model.ts` como consumidor, no como dueño del dinero.

## 2. Estado medido hoy (`c5a8c7c`, 2026-10-27)

| Check | Exit | Contadores |
|---|---|---|
| `audit:layers` | 0 | — |
| `audit:bridges` | 0 | — |
| `audit:console` | 0 | — |
| `audit:anchors` | 0 | sin bloques `.ps1` que revisar |
| `audit:tenant-default` | 0 | — |
| `audit:contracts` | **1** | 154 OK · 14 PENDING · **150 huérfanos** |
| `audit:idempotency` | **1** | 157 duplicadas · 4 huérfanas · **138 repetidas** |
| `audit:coherence` | **1** | **5/7** |

Extra medido, que explica el ruido: `docs/AUDIT_CONTRACTS.md` (341 líneas) y
`docs/AUDIT_IDEMPOTENCY.md` (734) **se escriben en cada ejecución**, así que cualquier
audit deja el worktree sucio y la copia versionada siempre está desfasada
(`docs/kernel/` guarda otra, del 2026-10-03). Y hay **1.431 identificadores de
marca** (`NOMBRE_V1`) únicos en el código, que es el "libro" que el audit de
idempotencia confunde con comportamiento.

## 3. Fases

Cada fase es un PR pequeño. Criterio de hecho común: `pnpm typecheck` 0, suite 0 fail,
y **el check que toca verde sin ningún `continue-on-error` ni test desactivado**.

### V0 · El gate único (la base de todo lo demás)

- `scripts/gate-report.ts` (`pnpm gate`): corre typecheck + tests + los 7 audits y
  escribe **un** JSON y **un** resumen legible en `artifacts/gate/` — `artifacts/` ya
  está ignorado en `.gitignore:7`.
- Lo que hoy falta no es que `coherence` cortocircuite —ya corre los siete y resume
  (`AUDITS_RUNNER_NO_SHORTCIRCUIT_V1`)— sino: (a) no emite nada legible por máquina,
  (b) cada audit **escribe su informe dentro de `docs/`**, así que engorda el worktree,
  y (c) **el CI no lo usa**: `ci.yml` encadena seis audits a mano en un `run: |`, que
  con `bash -e` se detiene en el primero que falla y no ves los demás.
- `docs/operacion/GATE.md`: qué comprueba cada check, **qué significa fallarlo** y
  **qué no cubre** (una línea por check). Nada de "auditoría de coherencia" a secas.
- **Hecho**: `pnpm gate` da el mismo resultado que correr los 7 a mano, y su salida
  cabe en 30 líneas legibles.

### V1 · `audit:idempotency` mide idempotencia (el check deja de mentir)

Tres cosas separadas, que hoy viven en un solo exit code:

1. **Índice de marcas** (no fatal): cuántas marcas, dónde, cuántas por fichero. Se
   publica, no bloquea. Una marca puede legítimamente marcar dos hunks del mismo
   fichero (`CAPABILITY_RUNNER_B10_V1` aparece 2× en `capability-runner.ts:42,72`).
2. **Revisión de duplicados con cuerpo distinto** (fatal solo si es un duplicado de
   *aplicación*, no de *mención*): triaje de las 157 pares con evidencia, y una
   allowlist explícita `{marca, ficheros, motivo, fecha}` para los que son menciones
   legítimas (barrel, re-export, cabecera de sección). **Sin motivo escrito, no hay
   allowlist.**
3. **Idempotencia de verdad** (nuevo, y es lo que importa): un test que ejecuta tres
   rutas con efecto (una capacidad de workspace con `messaging.send`, un
   `transition_entity`, un `prepare_email`) **dos veces con la misma clave** y
   demuestra que el efecto ocurre una vez y el segundo intento devuelve el mismo
   resultado. Eso es idempotencia; lo de arriba es contabilidad.
- **Hecho**: check verde con las tres categorías reportadas por separado, y los
  tests de doble ejecución pasando. Ninguna marca borrada.

### V2 · `audit:contracts` vacía los 150 huérfanos con criterio

Triaje obligatorio de los 150 en tres cubos, cada uno con su salida:

| Cubo | Qué es | Qué se hace |
|---|---|---|
| **Implementar** | el contrato se usa de verdad y falta la implementación | se implementa (o se abre tarea con dueño) |
| **Borrar** | contrato muerto: nadie lo importa en N meses | se borra del dominio, con el `git log` que lo demuestra |
| **Declarar PENDING** | contrato de una etapa futura, consciente | `// PENDING(<motivo>, <fecha>)`, no un `PENDING` suelto |

- La heurística "el nombre aparece en algún fichero" se endurece a **import real**
  (`from "@openmuse/domain"`) del símbolo, no mención textual: es la diferencia entre
  150 huérfanos y los que de verdad lo son. El número honesto puede bajar mucho; eso
  también hay que demostrarlo, no proclamarlo.
- **Hecho**: exit 0 con los tres cubos a cero, y cada `PENDING` con motivo y fecha.

### V3 · El observador meta que se paga y se tira (D12)

`conversation.ts` calcula hints y `metaHintsPromptBlock` devuelve `""`: el trabajo se
hace, se paga en tokens y no llega al prompt. Decisión **medida**: cablearlo (y probar
que el prompt cambia) o borrarlo (y probar que no se calcula). Lo que no puede quedar
es una funcionalidad que parece existir.
- **Hecho**: o hay test de que el bloque entra en el prompt, o el cálculo ya no se
  ejecuta. Sin `TODO` en el medio.

### V4 · La documentación operativa, anclada al código

`pnpm docs:anchors` (nuevo): extrae de `docs/operacion/*.md` y `README.md` cada
`VARIABLE_DE_ENTORNO`, cada `pnpm <script>` y cada ruta de fichero citada, y verifica
que existen en `scripts/secrets-check.ts`, `package.json` y el árbol. Es el check que
habría cazado el bug del webhook (`WHATSAPP_WEBHOOK_SECRET`, que no existía en ningún
sitio) **antes** de que un cliente lo sufriera.
- **Hecho**: verde, y falla de verdad si se cita una variable o un script inexistente
  (test con un `.md` de fixture roto).

### V5 · Un solo gate en los tres sitios

`ci.yml`, `deploy.yml` y la máquina de un dev tienen que ejecutar **lo mismo**. Hoy:
seis audits en CI, siete en `deploy.yml`, y `anchors`/`coherence` en ninguno de los dos
a la vez. Se sustituyen las listas por `pnpm gate`, y el job de worker deja de ser
`continue-on-error` **solo si** su typecheck está verde; si no, se queda warn con un
comentario que dice por qué y quién lo arregla.
- **Hecho**: `grep -c "pnpm audit:" .github/workflows/*.yml` = 0, y el gate es el
  mismo comando en los tres sitios.

### V6 · Evidencia

Tabla de progreso en este documento: fase · antes · después · test que lo prueba ·
qué no se pudo probar. Y `docs/operacion/GATE.md` enlazado desde `README.md`.

## 4. Reglas de la campaña

1. **No se relaja un check para ponerlo verde.** Si un check está mal definido, se
   cambia su definición **con la evidencia de por qué** y se añade lo que sí mide
   (V1.3, V4). La diferencia entre "arreglar" y "desactivar" es que la segunda no
   añade ningún test.
2. **Cada allowlist lleva motivo y fecha, y caduca.** Una entrada sin motivo es un
   check desactivado con más pasos.
3. **Números, no adjetivos.** Antes/después medidos con el comando. Si el número no
   baja, se escribe que no bajó.
4. **Un PR por fase**, con el defecto que cierra y el test que lo demuestra.
5. **Nada de dependencias nuevas** ni cambios en `pnpm-lock.yaml`. Todo es `node:fs`,
   `node:child_process` y lo que ya hay.
6. **Los generados no se versionan.** La salida de un audit va a `artifacts/`, que está
   en `.gitignore`. Lo que se versiona es la definición y el resumen.

## 5. Tablero

| Fase | Estado | Antes | Después | Test |
|---|---|---|---|---|
| V0 gate único | pendiente | 3 listas distintas, sin JSON, informes en `docs/` | `pnpm gate` + `artifacts/gate/` | — |
| V1 idempotencia real | pendiente | 157 / 4 / 138, exit 1 | 3 categorías + test de doble efecto | `tests/gate/idempotency-*.test.ts` |
| V2 contratos | pendiente | 150 huérfanos, exit 1 | 0, con import real | `tests/gate/contracts-*.test.ts` |
| V3 meta hints | pendiente | se calcula y se tira | cableado o borrado | `tests/gate/meta-*.test.ts` |
| V4 docs:anchors | pendiente | no existe | verde + falla con fixture roto | `tests/gate/docs-anchors.test.ts` |
| V5 gate en CI | pendiente | 6 audits vs coherence | `pnpm gate` en los tres | — |

## 6. Fuera de alcance

- **Coste, tokens, cuota y `llm-usage`**: F2 del mandato LLM. Yo no toco el dinero;
  solo dejo de contarlo mal donde me toca (si acaso, un PR aparte cuando F2 aterrice).
- **Los handlers de workspace y `bridge.ts`** (`idempotency: "idempotent"` en todo,
  evento falso en `mark_read`): F6 del mandato LLM. Es el otro gran "el repo miente",
  pero es de Codex. Lo vigilo.
- **El corpus documental**: Cline, [HANDOFF-CLINE.md](HANDOFF-CLINE.md).
- **Cualquier llamada de red**: esta campaña entera corre con `ALLOW_NETWORK=0`.
