# Verificación - Campaña UI/UX

> **UI_CAMPAIGN_06_VERIFICACION_V1**
>
> Cómo se verifica que un branch está cerrado correctamente. Comandos, criterios,
> y qué hacer si algo falla.
>
> Última actualización: 2026-10-03.

---

## Los 3 comandos obligatorios

Al cerrar cada branch, estos 3 comandos deben pasar:

1. `pnpm typecheck` → debe dar 0.
2. `pnpm --filter @openmuse/web typecheck` → debe dar 0.
3. `pnpm test` → debe pasar (con los tests nuevos).

Si alguno falla, el branch no se cierra.

---

## Comandos auxiliares

**Ver el estado de la rama:**

    git status -sb
    git rev-parse --abbrev-ref HEAD

**Ver el diff de un fichero:**

    git diff apps/server/src/engine/routes.ts

**Ver un fichero concreto:**

    Get-Content -Raw apps/server/src/engine/routes.ts

**Buscar una marca de idempotencia:**

    Get-ChildItem -Recurse -Include *.ts,*.tsx | Select-String "A1_MEMORY_PATCH_V2"

---

## Criterios de aceptación por branch

Cada branch tiene su propio `X-NOMBRE.md` con criterios concretos. Además, todos
comparten estos:

- [ ] Typecheck backend en 0.
- [ ] Typecheck frontend en 0.
- [ ] `pnpm test` pasa.
- [ ] Los tests nuevos pasan.
- [ ] Los tests existentes no se rompen.
- [ ] La funcionalidad manual funciona (si aplica).
- [ ] El CSS nuevo reutiliza lo existente (D16).
- [ ] No se tocan ficheros intocables (`kernel/**`, `db.ts`, contratos).
- [ ] El branch se puede revertir sin tocar otros.

---

## Qué hacer si algo falla

**Typecheck backend falla:**

1. Leer el error completo.
2. `Get-Content -Raw` del fichero que falla.
3. Si es un error trivial (tipo, import), corregir.
4. Si es un error de diseño (falta un tipo, contrato no coincide), parar y
   discutir.
5. **No apilar parches.** Si un parche no resuelve, revertir y reescribir.

**Typecheck frontend falla:**

1. Igual que backend.
2. Prestar atención a `noUnusedLocals` y `noUnusedParameters` (el tsconfig los
   tiene activados).
3. Prestar atención a `class=` en vez de `className=` en JSX.

**`pnpm test` falla:**

1. Identificar qué test falla.
2. Ejecutar ese test solo: `tsx --test tests/memory.test.ts`.
3. Si es un test nuevo, arreglarlo.
4. Si es un test existente que se rompe por el cambio, decidir:
   - ¿El test estaba mal? Arreglarlo.
   - ¿El código está mal? Arreglarlo.
   - **No borrar tests.**

**Manual falla:**

1. Reproducir el bug en el navegador con la consola abierta.
2. Ver qué request falla o qué render no cuadra.
3. Corregir.

---

## Revertir un branch

Si el branch está roto y no se puede arreglar rápido:

    git checkout main
    git branch -D feat/a1-memory-hotfix

O si está mergeado pero roto:

    git revert <commit>
    git checkout main

**Antes de revertir**, guardar el trabajo en un fichero aparte o en un stash:

    git stash push -m "A1 roto"

---

## Verificación visual (manual)

Para los branches que tocan UI, comprobar en el navegador:

1. Abrir http://localhost:5173/.
2. Login con el usuario de prueba.
3. Ir a la vista tocada.
4. Probar los casos del criterio de aceptación.
5. **Abrir DevTools** y comprobar:
   - No hay errores en Console.
   - No hay errores en Network.
   - No hay warnings de React.

---

## Verificación de idempotencia

Si un bloque se ejecuta dos veces, la segunda no debe hacer nada. Comprobar:

1. Buscar la marca `XXX_V1` en el fichero. Debe aparecer una vez.
2. Ejecutar el bloque de nuevo. Debe imprimir `SKIP`.
3. El fichero no debe cambiar.

---

## Verificación de aislamiento

Un branch no debe tocar ficheros de otro branch. Comprobar:

1. `git diff main` en el branch actual.
2. Comparar los ficheros tocados con los de `02-ARQUITECTURA.md`.
3. Si hay ficheros no previstos, anotar y discutir.

---

## Verificación de docs

Al cerrar un branch:

1. El `.md` del branch tiene los commits marcados como completados.
2. El `.md` del branch tiene el estado a HECHO.
3. `99-HISTORIAL.md` tiene una entrada nueva con fecha, resumen, verificación.
4. `README.md` tiene la tabla de estado actualizada.

---

## Checklist de cierre de branch

Antes de decir "HECHO":

- [ ] Typecheck backend: `pnpm typecheck` → 0.
- [ ] Typecheck frontend: `pnpm --filter @openmuse/web typecheck` → 0.
- [ ] Tests: `pnpm test` → verde.
- [ ] Manual (si aplica): comprobado en navegador.
- [ ] Console: sin errores.
- [ ] Network: sin errores.
- [ ] Idempotencia: la marca aparece una vez.
- [ ] Aislamiento: los ficheros tocados están en `02-ARQUITECTURA.md`.
- [ ] Docs: `.md` del branch, `99-HISTORIAL.md`, `README.md` actualizados.
- [ ] El branch revierte sin tocar otros.

Si todos los checkboxes están, el branch se cierra.

---

**Fin de la verificación.**