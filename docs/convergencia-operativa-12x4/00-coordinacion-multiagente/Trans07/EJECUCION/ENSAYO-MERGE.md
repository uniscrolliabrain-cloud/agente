# Ensayo de merge `main` → `converge/trans00-core`

**Método:** worktree desechable en `.audit/merge`, `git merge --no-commit --no-ff origin/main`,
comprobaciones sobre el árbol fusionado y `git merge --abort` + `git worktree remove`. Ninguna rama
compartida se toca: no hay merge real, ni commit de merge, ni push.

## 1. Resultado

| Comprobación | Resultado |
|---|---|
| Conflictos textuales (`--diff-filter=U`) | **0 archivos** |
| Archivos que aporta `main` | **146** (`+6298 / −1597`) |
| `tsc --noEmit -p tsconfig.json` sobre el árbol fusionado | **exit 0** |
| Suites de campaña sobre el árbol fusionado | **113 tests, 113 PASS, 0 FAIL, 0 SKIP** |
| Árbol tras el ensayo | limpio (`git status` vacío, worktree eliminado y pruneado) |

## 2. Qué aporta `main` (146 archivos)

| Área | Archivos | Lectura |
|---|---|---|
| `apps/ui-lab/**` | 122 | UI heredada; el último commit de `main` aísla su CSS del V5 actual |
| `apps/web/**` | 23 | panel actual |
| `.github/workflows/**` | 1 | cambio de CI: **revisión humana obligatoria antes del merge real** |

**Corrección respecto al corpus:** el documento preveía conflicto en `apps/site/**` y en assets
generados. En este head no aparece ninguno de los dos: `apps/site` no está en la diferencia y no hay
assets en conflicto. Se anota la diferencia en lugar de heredar la predicción.

## 3. Conflictos semánticos

No hay conflicto textual, así que el riesgo se mide aparte:

- **Tipos:** `tsc` sobre el árbol fusionado devuelve 0, incluidos `apps/web` y `apps/ui-lab` que llegan
  de `main`. No hay conflicto de tipos entre las dos líneas.
- **Comportamiento:** las suites de campaña (Trans01–Trans06 + kernel + readiness) pasan en el árbol
  fusionado con **113/113**. No se observa cambio de comportamiento en kernel, cognición, verdad,
  integraciones ni longitudinal.
- **CI:** el único archivo de `.github/workflows` que cambia **no** se ha ejecutado (no hay runner de
  GitHub en este entorno). Su contenido debe revisarse a mano antes del merge real; es el único punto
  donde el ensayo no puede dar una respuesta automática.

## 4. Decisión propuesta por área

| Área | Propuesta |
|---|---|
| `apps/ui-lab/**` | aceptar tal cual: es trabajo de `main`, aislado del panel actual |
| `apps/web/**` | aceptar tal cual; `tsc` y las suites lo cubren parcialmente |
| `.github/workflows/**` | aceptar **después** de revisión humana del diff de CI |
| assets / `apps/site` | nada que decidir en este head |

## 5. Lo que este ensayo NO es

- **No es un merge.** No existe commit de merge y `main` no se ha modificado.
- **No es el gate integral.** 113 tests acotados no son las 1.173 pruebas del gate.
- **No cubre CI**: el workflow que llega de `main` no se ha ejecutado.
- **No certifica PostgreSQL**: la concurrencia nativa sigue sin instancia disponible.

El merge real es la siguiente acción que requiere autorización explícita del operador.
