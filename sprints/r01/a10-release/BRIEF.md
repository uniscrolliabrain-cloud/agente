# A10 · Release y verificación

**Carril:** C10 · **Rama:** `sprint/r01-a10-release` · **Superficie:** `sprints/r01/a10-release/`, `.github/workflows/`, `scripts/gate-report.ts`

## Estado medido sobre `0c8fe81` — seis defectos concretos

1. **`worker` no bloquea**: `.github/workflows/ci.yml:42` tiene `continue-on-error: true` en el job de typecheck del worker. Puede estar rojo y el CI salir verde.
2. **Dos timeouts distintos**: CI corre `pnpm test` con el `--test-timeout=10000` de `package.json`; `scripts/gate-report.ts` usa `30000` y su comentario `GATE_TEST_TIMEOUT_V1` explica que 10 s mataba tests legítimos (`tests/auth.test.ts` tarda 13 s con hash de password). El CI está corriendo la versión que se sabe rota.
3. **El CI no es el gate**: `ci.yml` encadena 6 audits en un `run: |`. Con `bash -e`, el primero en rojo corta la lista: los demás ni se ejecutan, y no hay informe. `deploy.yml` corre solo `audit:coherence`. `pnpm gate` existe, unifica los 7 y escribe `artifacts/gate/`, y **no se usa en CI**.
4. **9 E2E permanentemente skip**: `tests/campaign-3/e2e-02..12-skip.test.ts` declara 9 `test.skip` vacíos (más 1 en `tests/roadmap/b30-computer-governance.test.ts`). Un skip permanente no es un pendiente: es una promesa que nadie va a cumplir.
5. **Referencia rota**: `tests/setup.ts` cita `docs/audits/01-tests/miniaudit.md` como justificación del bloqueo de red. Ese fichero **no existe** (`docs/audits/` no está en el repo).
6. **Sin SHA acreditado en producción**: `deploy.yml` ya etiqueta la imagen (`--image-label`), pero nada guarda ni verifica qué SHA corre. La R10 pide eso; en R1 basta con dejar el hueco medido.

### Dato medido antes de arrancar, y cambia tu tarea

`pnpm gate` **no está en verde**: `contracts` sale 1 (78 contratos sin uso ni decisión) e `idempotency` sale 1 (5 bloques duplicados). Los otros cinco audits están a 0.

Consecuencia: cambiar el CI a `pnpm gate` tal cual lo deja rojo, y eso puede ser lo correcto — pero tiene que ser una decisión escrita, no un accidente. Tu entregable incluye decir qué pasa con esos dos: se arreglan (es trabajo de A01) o se declaran en su allowlist con motivo y fecha, y el CI bloquea a partir de ahí.

## Preguntas

1. ¿Cuánto tarda el CI hoy de punta a punta y qué jobs se solapan sin necesidad?
2. ¿Qué pasa exactamente si un audit del `run: |` falla: se ven los 6 o solo el primero? (demuéstralo)
3. ¿`pnpm gate` desde CI produce los mismos veredictos que el `run: |` actual? ¿Difiere en algo?
4. ¿Los 9 E2E skip tienen equivalente ya implementado en `tests/campaign-3/e2e-0X-*.test.ts`? (e2e-03 y e2e-05 sí existen como fichero propio; mira nombre por nombre)
5. ¿`anchors` está en el registro pero fuera del CI: se rompe algo si se añade?

## Entregable del sprint

`.github/workflows/ci.yml` con: `worker` bloqueante, `pnpm gate` como único paso de verificación, y subida de `artifacts/gate/` como artifact del run. **Un solo PR**, y `sprints/r01/a10-release/ANTES-DESPUES.md` con la tabla job → qué verifica → bloquea sí/no.

## Gate

```bash
node --import tsx scripts/gate-report.ts --only=typecheck,audit:contracts
node -e "const y=require('fs').readFileSync('.github/workflows/ci.yml','utf8'); if(/continue-on-error:\s*true/.test(y)) {console.error('queda un job no bloqueante');process.exit(1)}"
```

## Trampa

Quitar `continue-on-error` sin arreglar lo que falla detrás. Si el typecheck del worker está rojo, el entregable es el rojo documentado con su log, y el cambio de CI va en un commit separado y marcado para revertir.
