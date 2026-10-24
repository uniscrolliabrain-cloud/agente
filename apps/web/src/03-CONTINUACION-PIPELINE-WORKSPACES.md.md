<!-- CONTINUACION_PIPELINE_WORKSPACES_V1 -->
# Continuacion del pipeline de workspaces

> Este doc complementa a otros dos. NO los reemplaza.
> Orden de lectura:
> 1. HANDOFF-IA-WORKSPACES.md (reglas de PowerShell, repomix, paleta)
> 2. 34-workspaces-pipeline.md (pipeline y SOP)
> 3. Este. Aumenta y complementa.

---

## 1. Las tres capas de un workspace

Un workspace no es una sola cosa. Tiene tres capas. La IA debe
entenderlas antes de tocar nada. Esto NO esta en los otros dos docs.

### Capa backend (contract)

Vive en `packages/workspaces/NN-nombre/`. Declara el contrato:
capacidades, comandos, queries, eventos, entidades. Cada workspace
backend exporta un `WorkspaceModule` con `manifest`, `capabilities`,
`views`, `publishes`, `consumes`.

Estado real de los 34 backend:

- `capabilities.ts` completo.
- `commands.ts` completo.
- `queries.ts` completo.
- `views.ts` vacio (`VIEWS = []`).
- `contract.ts` con `status: "implemented"`.
- `workspace.json` con `status: "scaffold"`.

Esa incoherencia entre `contract.ts` y `workspace.json` es conocida.
No la arregla este frente. Pero la IA debe saber que existe.

### Capa frontend (UI)

Vive en `apps/web/src/workspaces/NN-nombre/`. Es lo que implementa
la IA. Estructura:

```
NN-nombre/
├── README.md
├── index.ts
├── types.ts
├── format.ts
├── <Nombre>Workspace.css
├── api.ts
├── hooks/
├── components/
└── docs/
```

### Capa de montaje

El `registry.ts` y el `WorkspaceShell.tsx` viven en
`apps/web/src/workspaces/`. Son compartidos por los 34. La IA no los
toca, pero debe entenderlos para saber donde se monta su workspace.

---

## 2. Como se monta un workspace hoy

Esto es critico. La IA que no lo sepa va a fallar. NO esta en los
otros dos docs.

`registry.ts` es **metadata-only**. Define:

```ts
interface WorkspaceFrontendEntry {
  id: string;
  slug: string;
  family: WorkspaceFamily;
  title: string;
  reference: string;
}
```

No tiene `component`, ni `loader`, ni `render`. Solo datos. Funciones:
`getWorkspace(id)`, `listByFamily(family)`.

`WorkspaceShell.tsx` recibe `{ workspaceId, spec }` y monta:

```tsx
<ViewRenderer spec={spec} />
```

`ViewRenderer` pinta un `RuntimeViewSpec` con una de las 9 plantillas
de `apps/web/src/templates/`:

- `dashboard`
- `queue`
- `inbox`
- `board`
- `table`
- `detail`
- `form`
- `timeline`
- `graph`

**Consecuencia para la IA:** un workspace que encaja en una de esas
9 plantillas NO necesita componente React propio. Basta con que el
backend sirva un `RuntimeViewSpec`. Pero un workspace cuya UI no
encaja (chat, kanban con drag&drop, editores ricos) necesita una
via de montaje aparte.

### Las tres opciones de montaje

**Opcion A - Plantilla existente.**
El workspace se sirve con `RuntimeViewSpec` y `ViewRenderer`. No hay
componente React propio. Es la via normal. La mayoria de workspaces
(tablas, listas, dashboards) pueden ir por aqui.

**Opcion B - Excepcion en WorkspaceShell.**
Si `workspaceId === "NN-nombre"`, montar un componente propio en vez
de `ViewRenderer`. Rompe la simetria pero permite UI no-estandar.
Asi se hizo con `02-whatsapp`.

**Opcion C - Ruta propia en App.tsx.**
El workspace vive fuera del sistema de shells. Es lo que menos encaja
con el catalogo. Solo si A y B no valen.

**Antes de decidir cual**, la IA debe ver `WorkspaceShell.tsx` y
`App.tsx`. Sin verlos, no se decide.

---

## 3. Orden de lectura obligatorio antes de tocar nada

La IA NO escribe una sola linea hasta haber leido todo esto. Si no
lo tiene, lo pide. En este orden. NO esta en los otros dos docs.

### 3.1. El arbol del frente

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
tree "apps/web/src/workspaces" /F /A
```

### 3.2. El workspace objetivo

```powershell
Get-ChildItem "apps/web/src/workspaces/NN-nombre" -Recurse | Select-Object FullName
Get-Content "apps/web/src/workspaces/NN-nombre/README.md"
Get-Content "apps/web/src/workspaces/NN-nombre/index.ts"
Get-Content "apps/web/src/workspaces/NN-nombre/docs/01-ui-map.md"
Get-Content "apps/web/src/workspaces/NN-nombre/docs/02-roadmap.md"
Get-Content "apps/web/src/workspaces/NN-nombre/docs/03-spec.md"
```

### 3.3. Los ficheros globales del frontend (una vez por sesion)

```powershell
Get-Content "apps/web/src/workspaces/registry.ts"
Get-Content "apps/web/src/workspaces/WorkspaceShell.tsx"
Get-Content "apps/web/src/workspaces/index.ts"
Get-Content "apps/web/tailwind.config.js"
Get-Content "apps/web/src/index.css"
```

### 3.4. Los ficheros de montaje (si el workspace se monta)

```powershell
Get-Content "apps/web/src/App.tsx"
Get-Content "apps/web/src/main.tsx"
```

### 3.5. La referencia viva: 02-whatsapp

El workspace `02-whatsapp` ya esta implementado. Es la base de este
pipeline. Antes de empezar otro, leer:

```powershell
Get-Content "apps/web/src/workspaces/02-whatsapp/README.md"
Get-Content "apps/web/src/workspaces/02-whatsapp/types.ts"
Get-Content "apps/web/src/workspaces/02-whatsapp/format.ts"
Get-Content "apps/web/src/workspaces/02-whatsapp/api.ts"
Get-Content "apps/web/src/workspaces/02-whatsapp/hooks/useChatWorkspace.ts"
Get-Content "apps/web/src/workspaces/02-whatsapp/components/ChatWorkspace.tsx"
```

Con eso ve el patron real de un workspace implementado.

### 3.6. El backend del workspace (si aplica)

```powershell
Get-Content "packages/workspaces/NN-nombre/workspace.json"
Get-Content "packages/workspaces/NN-nombre/src/contract.ts"
Get-Content "packages/workspaces/NN-nombre/src/application/commands.ts"
Get-Content "packages/workspaces/NN-nombre/src/application/queries.ts"
Get-Content "packages/workspaces/NN-nombre/src/application/capabilities.ts"
Get-Content "packages/workspaces/NN-nombre/src/domain/entities.ts"
```

Con eso la IA sabe que datos, comandos y queries tiene ya declarados
el backend para ese workspace. La UI debe reflejarlos, no inventarlos.

---

## 4. Repomix cuando el config excluye apps/web/

Esto es un bug real que ya ha pasado. NO esta en los otros dos docs.

El `repomix.config.json` del repo excluye `apps/web/**` en sus
`customPatterns`. Eso significa que:

```powershell
npx repomix --include "apps/web/src/..." --output x.md
```

sale **vacio**. Aunque el include parezca correcto. El ignore del
config gana.

### Solucion 1 (recomendada): pedir ficheros uno a uno

```powershell
Get-Content "apps/web/src/workspaces/NN-nombre/README.md"
```

El humano pega el output. Es lo mas eficiente para la IA y lo que
hemos usado para el 02-whatsapp.

### Solucion 2: repomix con override de config

Si de verdad se quiere repomix:

```powershell
npx repomix --style markdown --include "apps/web/src/workspaces/NN-nombre/**" --ignore "**/node_modules/**,**/dist/**,**/.git/**" --config "{\"ignore\":{\"customPatterns\":[\"**/node_modules/**\",\"**/dist/**\",\"**/.git/**\"]}}" --output repomix-ws-NN.md
```

El `--config` override desactiva el `apps/web/**` del config real.

### Lo que NO hay que pedir

- El repo entero.
- `apps/web/**` sin acotar.
- `node_modules`, `dist`, `.git`, `.env`, `artifacts`, `coverage`.
- `apps/server/`, `packages/`, `clientes/`, `docs/` salvo que el
  workspace lo requiera.

---

## 5. Modos de trabajo

Cuando el humano dice "trabajamos el workspace NN-nombre", puede
querer cuatro cosas distintas. La IA debe preguntar cual. NO esta en
los otros dos docs.

**Modo implementar.**
La UI no existe o es scaffold. La IA la construye entera siguiendo
el pipeline de los 9 pasos.

**Modo actualizar docs.**
La UI ya existe pero los docs (README, 01-ui-map, 02-roadmap,
03-spec, 04-handoff-v2) estan a medias o desfasados. La IA los
actualiza contra el codigo real.

**Modo verificar.**
La UI y los docs ya existen. La IA comprueba que todo cuadra:
paleta correcta, imports con extension, typecheck verde, nada
inventado.

**Modo corregir.**
Hay un bug o algo no encaja. La IA lo arregla con un patchset
quirurgico.

---

## 6. Los 34 workspaces backend

NO esta en los otros dos docs. Es importante saberlo porque la UI
debe reflejar el backend.

- Viven en `packages/workspaces/NN-nombre/`.
- Cada uno exporta un `WorkspaceModule`.
- El barrel `packages/workspaces/src/index.ts` exporta `ALL_WORKSPACES`.
- El `MANIFEST.yaml` los agrupa en 9 familias.
- El `views.ts` de los 34 esta vacio (`VIEWS = []`).
- El `workspace.json` dice `status: "scaffold"`, el `contract.ts`
  dice `status: "implemented"`. Incoherencia conocida.

Si la IA implementa la UI de un workspace, debe leer los comandos,
queries y capabilities del backend para saber que datos maneja. No
inventar entidades.

---

## 7. api.ts del workspace vs api global

NO esta en los otros dos docs.

Cada workspace puede tener su `api.ts` dentro del workspace. Es lo
que hemos hecho con `02-whatsapp/api.ts`. Es un mock en memoria con
las firmas reales.

Ademas, el repo tiene `apps/web/src/api/` con ficheros globales:
`chat.ts`, `agents.ts`, `threads.ts`, `tasks.ts`, etc. **No los
hemos visto.** Si existen y tienen contenido vivo, la IA no los
toca sin verlos.

Regla: el `api.ts` del workspace es del workspace. El `api/` global
es del repo. Si el workspace necesita conectar al backend real, se
decide entonces si se sustituye su `api.ts` o se unifica con el
global.

---

## 8. AppShell vs WorkspaceShell

NO esta en los otros dos docs.

- `apps/web/src/components/AppShell.tsx`: shell de la app entera.
  Sidebar, topbar, layout global.
- `apps/web/src/workspaces/WorkspaceShell.tsx`: contenedor del
  workspace activo. Recibe `{ workspaceId, spec }`. Monta
  `ViewRenderer`.

No son lo mismo. Si la IA confunde uno con otro, monta el workspace
en el sitio equivocado.

---

## 9. pnpm typecheck corre tambien el worker

NO esta en los otros dos docs.

En el `package.json` de la raiz:

```json
"typecheck": "tsc --noEmit && npm --prefix apps/worker run typecheck"
```

Si aparecen errores del worker, **no son del workspace**. La IA debe
filtrar y quedarse solo con los de `apps/web/`.

Para chequear solo el frontend:

```powershell
pnpm --filter @openmuse/web exec tsc --noEmit
```

---

## 10. Trampas conocidas (por gravedad)

### Criticas

1. **Repomix vacio.** El config excluye `apps/web/**`. Solucion:
   pedir ficheros con `Get-Content`, o `--config` override.
2. **Montaje mal entendido.** `registry.ts` no monta componentes.
   `WorkspaceShell` monta `ViewRenderer`, no componentes del
   workspace. El chat fue una excepcion.
3. **Paleta inventada.** `bg-canvas`, `bg-surface`, `text-ink`,
   `text-muted`, `bg-accent` NO existen. Usar los reales:
   `bg-bg-card`, `bg-bg-soft`, `border-border`, `text-text`,
   `text-text-2`, `purple`, `purple-soft`, `green`.
4. **Dark mode.** El repo no lo tiene. No meter
   `@media (prefers-color-scheme: dark)` ni `data-theme`.

### Importantes

5. **Heredoc anidado en PowerShell.** Revienta el shell. Usar
   arrays de lineas.
6. **18 ficheros en un script.** Un patchset = un fichero.
7. **Imports sin extension.** El repo usa `moduleResolution:
   NodeNext`. Todos los imports llevan `.ts` o `.tsx`.
8. **`&&` y `;`.** Prohibidos. Un comando por linea.
9. **`git add .`.** Prohibido. Selectivo por fichero.
10. **Fuentes ajenas.** El repo usa `Instrument Sans`. No meter
    `Inter` ni otra.

### Menores

11. **`pnpm typecheck` corre el worker.** Filtrar errores.
12. **`contexts/` no existe.** No crearlo. El estado va en
    `hooks/useXxx.ts` dentro del workspace.
13. **`04-handoff-v2.md`** es parte del boilerplate. Crearlo al
    terminar cada workspace.
14. **Los 34 backend tienen `views.ts` vacio.** Si el workspace
    necesita una vista servida, hay que rellenarlo. Eso es otro
    frente (handoff de 214 fixes).

---

## 11. Checklist antes de escribir la primera linea

La IA no escribe codigo hasta tener todo esto:

- [ ] Arbol del frente (`tree apps/web/src/workspaces`).
- [ ] README, index.ts, docs del workspace objetivo.
- [ ] `registry.ts`, `WorkspaceShell.tsx`, `index.ts` de workspaces.
- [ ] `tailwind.config.js` y `index.css`.
- [ ] `App.tsx` y `main.tsx` si el workspace se monta.
- [ ] El `02-whatsapp` como referencia viva.
- [ ] El backend del workspace (`packages/workspaces/NN-nombre/`).
- [ ] Decidido el modo de trabajo (implementar / docs / verificar /
      corregir).
- [ ] Decidido donde se monta (opcion A, B o C).

---

## 12. Checklist antes de dar por terminado un workspace

- [ ] `pnpm --filter @openmuse/web exec tsc --noEmit` verde.
- [ ] `pnpm typecheck` verde (o errores solo del worker).
- [ ] El contenedor del workspace se ve en el navegador (si se monto).
- [ ] `index.ts` del workspace exporta el contenedor.
- [ ] `README.md` con mapa de componentes.
- [ ] `docs/01-ui-map.md`, `02-roadmap.md`, `03-spec.md` con
      contenido real.
- [ ] `docs/04-handoff-v2.md` para la siguiente IA.
- [ ] Paleta real del repo, sin invenciones.
- [ ] Sin dark mode.
- [ ] Sin fuentes ajenas.
- [ ] Imports con extension `.ts` / `.tsx`.
- [ ] `git status --short` limpio de ficheros no relacionados.

---

## 13. Como se encadena un workspace con el siguiente

Al terminar un workspace, antes de pasar al siguiente:

1. Actualizar `docs/04-handoff-v2.md` del workspace terminado, con:
   - Estado final.
   - Que quedo pendiente.
   - Que ficheros globales toco (si alguno).
2. Actualizar el `README.md` del workspace si cambio algo.
3. `git status --short` y `git add` selectivo por fichero.
4. `git commit` con mensaje `feat(web): workspace NN-nombre UI`.
5. Pasar al siguiente segun el orden recomendado:
   08-chatgpt, 09-airtable, 16-n8n, 33-langsmith, ...

---

## 14. Definicion de "workspace terminado"

Un workspace esta terminado cuando TODO esto es verdad:

- Compila sin errores propios.
- Se ve en el navegador o esta montado por la via decidida.
- Su README dice la verdad de lo que hay.
- Sus 4 docs (`01-ui-map`, `02-roadmap`, `03-spec`, `04-handoff-v2`)
  estan escritos.
- El `index.ts` exporta el contenedor.
- No hay ni una clase Tailwind inventada.
- No hay dark mode.
- No hay fuentes ajenas.
- No hay `&&`, ni `;`, ni `git add .` en su historia de patches.
- Su handoff v2 permite a otra IA continuar sin contexto previo.

---

FIN DEL DOC DE CONTINUACION.
