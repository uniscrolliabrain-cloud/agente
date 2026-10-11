<!-- HANDOFF_IA_WORKSPACES_V1 -->
# Handoff para la IA que construye los 34 workspaces del frontend

> Autocontenido. No asume nada. Lo lee una IA nueva al empezar un chat
> limpio. Incluye: como escribir PowerShell en este repo, como pedir
> el arbol y el repomix sin peso, y todo lo que necesita saber del repo
> para no romperlo.

---

## 0. Contexto en una frase

En el repo `agente` hay 34 workspaces del frontend en
`apps/web/src/workspaces/NN-nombre/`, en estado scaffold. La IA
los implementa uno a uno siguiendo el pipeline que ya se aplico
al 02-whatsapp. Este doc es el manual de como trabajar sin romper
nada.

---

## 1. Entorno

- Repo: `C:\Users\Alfonso\Desktop\git hub repos\agente`
- Shell: PowerShell en Windows.
- Package manager: pnpm. Node >= 22.
- El humano ejecuta los comandos. La IA genera los bloques.
- Un patchset = un bloque PowerShell = un fichero. Nunca 18 ficheros en un script.

---

## 2. Reglas duras de PowerShell

### 2.1. Rutas con espacios

La ruta del repo tiene espacios. SIEMPRE entre comillas dobles:

```powershell
# MAL
cd C:\Users\Alfonso\Desktop\git hub repos\agente

# BIEN
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
```

### 2.2. Nunca && ni ; para encadenar

Un comando por linea. Si hay que encadenar, usar `if ($LASTEXITCODE -ne 0) { ... }`
explicito.

```powershell
# MAL
pnpm typecheck && pnpm test

# BIEN
pnpm typecheck
pnpm test
```

### 2.3. Nunca git add .

El working tree tiene frentes mezclados. `git add` selectivo, archivo por archivo.

```powershell
git add apps/web/src/workspaces/02-whatsapp/types.ts
git add apps/web/src/workspaces/02-whatsapp/components/
```

### 2.4. Heredoc: NO anidar

NO meter varios `@'...'@` en el mismo script. PowerShell los confunde y
revienta. Usar arrays de lineas:

```powershell
$lines = @(
  '// MARCA_V1',
  'export const x = 1;',
  ''
)
[System.IO.File]::WriteAllText(
  (Join-Path (Get-Location) $file),
  ($lines -join "`r`n"),
  (New-Object System.Text.UTF8Encoding $false)
)
```

### 2.5. UTF-8 sin BOM

Siempre `[System.IO.File]::WriteAllText(..., (New-Object System.Text.UTF8Encoding $false))`.
Nunca `Set-Content` ni `Out-File` sin `-Encoding utf8`.

### 2.6. Idempotencia por marca

Todo patchset empieza comprobando si el fichero ya tiene la marca:

```powershell
$file = "ruta/al/fichero"
$mark = "MARCA_V1"

if (Test-Path $file) {
  $content = Get-Content $file -Raw
  if ($content -match $mark) {
    Write-Host "SKIP: $mark ya existe" -ForegroundColor DarkGray
  } else {
    Write-Host "AVISO: $file existe sin la marca $mark. No sobreescribo." -ForegroundColor Yellow
  }
} else {
  # escribir el fichero
}
```

### 2.7. Backticks y escapes

El backtick es escape en PowerShell. Evitarlo en strings. Si hay que
meter un salto de linea en un string, usar `"`r`n"` (con backticks) pero
solo en joins, no dentro de lineas del array.

### 2.8. Variables de entorno

```powershell
$env:OPENMUSE_CLIENTS_DIR = "clientes"
pnpm dev
```

No usar `export` ni `set`.

### 2.9. Redirecciones

```powershell
pnpm typecheck 2>&1 | Out-File -Encoding utf8 typecheck.txt
```

`>` sobreescribe. `>>` anade.

---

## 3. Como pedir el arbol del repo

El arbol completo ya esta en el chat (o se pide con `tree`). Si hace
falta el arbol entero, este es el comando:

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
tree /F /A > arbol.txt
```

Si el arbol es enorme, mejor solo el trozo que interesa:

```powershell
tree "apps/web/src/workspaces" /F /A
```

---

## 4. Como pedir el repomix sin peso

El repo tiene un `repomix.config.json` que excluye `apps/web/**` por
defecto. Por eso cualquier repomix del frontend sale vacio si no se
le pasa `--include` correcto. Reglas duras:

1. Nunca empaquetar el repo entero.
2. Siempre `--include` acotado al frente que se esta tocando.
3. Siempre `--ignore` para node_modules, dist, .git, .env.
4. Un repomix por objetivo. No mezclar frentes.
5. Si el repomix ya existe en el chat, pedir solo el delta.

### 4.1. Comando base

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
npx repomix --style markdown --include "<globs>" --ignore "**/node_modules/**,**/dist/**,**/.git/**,**/.env*" --output repomix-<frente>.md
```

### 4.2. Repomix para un workspace concreto

```powershell
npx repomix --style markdown --include "apps/web/src/workspaces/NN-nombre/**,apps/web/tailwind.config.js,apps/web/src/index.css" --ignore "**/node_modules/**,**/dist/**,**/.git/**" --output repomix-ws-NN.md
```

### 4.3. Repomix de los ficheros globales del frontend

Necesario antes de tocar cualquier workspace, una sola vez:

```powershell
npx repomix --style markdown --include "apps/web/src/workspaces/registry.ts,apps/web/src/workspaces/WorkspaceShell.tsx,apps/web/src/workspaces/index.ts,apps/web/src/App.tsx,apps/web/src/main.tsx,apps/web/src/index.css,apps/web/tailwind.config.js,apps/web/package.json" --ignore "**/node_modules/**,**/dist/**,**/.git/**" --output repomix-web-globales.md
```

### 4.4. Repomix de un fichero suelto

Si el repomix grande pesa demasiado, pedir ficheros uno a uno:

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"
Get-Content "apps/web/src/workspaces/WorkspaceShell.tsx"
```

Esto es lo mas eficiente para la IA. El humano pega el output.

### 4.5. Que NO pedir

- No pedir el repo entero.
- No pedir `apps/web/**` sin acotar.
- No pedir ficheros de `apps/server/`, `packages/`, `clientes/`, `docs/`
  salvo que el workspace lo requiera explicitamente.
- No pedir `node_modules`, `dist`, `.git`, `.env`, `artifacts`, `coverage`.

---

## 5. La paleta real del repo

El repo usa estos colores Tailwind (definidos en `apps/web/tailwind.config.js`):

- Fondos: `bg`, `bg-card`, `bg-soft`, `bg-softer`
- Bordes: `border`, `border-soft`, `border-strong`
- Texto: `text`, `text-2`, `text-3`, `text-4`
- Acento: `purple`, `purple-soft`
- Estado: `green`, `orange`, `warn`, `warn-border`, `warn-text`, `info`, `info-border`, `info-text`

NO usar `canvas`, `surface`, `line`, `ink`, `muted`, `accent`, `accentsoft`,
`online`. Esos colores NO existen en el repo.

Mapeo si se ven en algun fichero viejo:

| Inventada | Real |
|---|---|
| `bg-canvas` | `bg-bg-card` |
| `bg-surface` | `bg-bg-soft` |
| `border-line` | `border-border` |
| `text-ink` | `text-text` |
| `text-muted` | `text-text-2` |
| `bg-accent` | `bg-purple` |
| `text-accent` | `text-purple` |
| `border-accent` | `border-purple` |
| `bg-accentsoft` | `bg-purple-soft` |
| `bg-online` | `bg-green` |
| `text-canvas` | `text-white` (solo sobre fondo oscuro) |

---

## 6. Reglas de estilo del repo

- Fuente: `Instrument Sans`. No meter `Inter` ni otra.
- Dark mode: no existe. No meter `@media (prefers-color-scheme: dark)`
  ni `data-theme`.
- Radii: `rounded-card` (28px), `rounded-pill` (999px).
- Shadows: `shadow-card`, `shadow-soft`, `shadow-composer`.
- Imports con extension: `./types.ts`, `../api.ts`, `./Avatar.tsx`.
  Sin extension, `tsc` falla por `moduleResolution: NodeNext`.

---

## 7. Estructura de un workspace

Cada workspace vive en `apps/web/src/workspaces/NN-nombre/`:

```
NN-nombre/
├── README.md                    XXX_UI_MAP_V1
├── index.ts                     XXX_WORKSPACE_INDEX_V2
├── types.ts                     XXX_TYPES_V1
├── format.ts                    XXX_FORMAT_V1
├── <Nombre>Workspace.css        XXX_UI_CSS_V1
├── api.ts                       XXX_API_V1
├── hooks/
│   └── useXxx.ts                XXX_HOOK_V1
├── components/
│   ├── <Nombre>Workspace.tsx    XXX_WORKSPACE_V1
│   └── ...                      hijos semanticos
└── docs/
    ├── 01-ui-map.md
    ├── 02-roadmap.md
    ├── 03-spec.md
    └── 04-handoff-v2.md         XXX_HANDOFF_V2
```

---

## 8. Los 34 workspaces

| # | id | familia |
|---|---|---|
| 01 | gmail | comunicacion |
| 02 | whatsapp | comunicacion |
| 03 | hubspot | comunicacion |
| 04 | holded | finanzas |
| 05 | google-drive | documentos |
| 06 | google-calendar | trabajo |
| 07 | linear | trabajo |
| 08 | chatgpt | global |
| 09 | airtable | datos |
| 10 | perdoo | personas |
| 11 | holded-tesoreria | finanzas |
| 12 | odoo-purchase | finanzas |
| 13 | productive | trabajo |
| 14 | zendesk | comunicacion |
| 15 | docusign | documentos |
| 16 | n8n | trabajo |
| 17 | process-street | trabajo |
| 18 | factorial | personas |
| 19 | personio | personas |
| 20 | ramp | finanzas |
| 21 | stripe | finanzas |
| 22 | canva | documentos |
| 23 | buffer | comunicacion |
| 24 | shopify | finanzas |
| 25 | intercom | comunicacion |
| 26 | odoo-inventory | operaciones |
| 27 | maintainx | operaciones |
| 28 | odoo-manufacturing | operaciones |
| 29 | isms-online | gobierno |
| 30 | microsoft-entra | gobierno |
| 31 | suitedash | comunicacion |
| 32 | notion | documentos |
| 33 | langsmith | gobierno |
| 34 | trello | trabajo |

---

## 9. Flujo de una sesion nueva

Cuando el humano abre un chat limpio con una IA nueva:

1. El humano pega dos docs:
   - `apps/web/src/34-workspaces-pipeline.md`
   - `apps/web/src/HANDOFF-IA-WORKSPACES.md` (este)
2. El humano dice: "trabajamos el workspace NN-nombre".
3. La IA pide el repomix acotado al workspace, o los ficheros uno a uno.
4. La IA sigue el pipeline: auditoria, decisiones, doc, contratos,
   datos, componentes, correccion, montaje, handoff.
5. Cada fichero es un patchset. La IA lo da, el humano lo pega.
6. Al final de la fase, el humano corre `pnpm typecheck` y pega el
   resultado.
7. La IA ajusta si hay errores.
8. Siguiente workspace.

---

## 10. Lo que la IA debe pedir siempre antes de tocar

Antes de escribir un solo fichero del workspace NN, la IA debe ver:

- `apps/web/src/workspaces/NN-nombre/README.md`
- `apps/web/src/workspaces/NN-nombre/index.ts`
- `apps/web/src/workspaces/NN-nombre/docs/01-ui-map.md`
- `apps/web/src/workspaces/NN-nombre/docs/02-roadmap.md`
- `apps/web/src/workspaces/NN-nombre/docs/03-spec.md`

Y una vez por sesion (o si no se han visto en el chat):

- `apps/web/src/workspaces/registry.ts`
- `apps/web/src/workspaces/WorkspaceShell.tsx`
- `apps/web/tailwind.config.js`
- `apps/web/src/index.css`

Si el workspace necesita montarse:

- `apps/web/src/App.tsx`
- `apps/web/src/main.tsx`

---

## 11. Lo que la IA NO debe hacer

1. No inventar paletas.
2. No meter dark mode.
3. No meter fuentes ajenas.
4. No meter contexto global si el workspace es el unico consumidor.
5. No tocar `api/chat.ts` ni otros ficheros globales sin verlos antes.
6. No reescribir `tailwind.config.js`.
7. No meter componentes en `components/` del repo. Van dentro del workspace.
8. No crear `contexts/` si no existe.
9. No meter heredocs anidados en PowerShell.
10. No meter 18 ficheros en un solo script. Un patchset = un fichero.
11. No tocar `App.tsx` ni `main.tsx` a ciegas.
12. No montar el workspace hasta decidir donde.
13. No usar `&&` ni `;`.
14. No usar `git add .`.

---

## 12. Convencion de marcas

| Fichero | Marca |
|---|---|
| `README.md` | `XXX_UI_MAP_V1` |
| `index.ts` | `XXX_WORKSPACE_INDEX_V2` |
| `types.ts` | `XXX_TYPES_V1` |
| `format.ts` | `XXX_FORMAT_V1` |
| `<Nombre>Workspace.css` | `XXX_UI_CSS_V1` |
| `api.ts` | `XXX_API_V1` |
| `hooks/useXxx.ts` | `XXX_HOOK_V1` |
| `components/<Nombre>Workspace.tsx` | `XXX_WORKSPACE_V1` |
| `docs/04-handoff-v2.md` | `XXX_HANDOFF_V2` |
| `components/layout/AppRail.tsx` | `APP_RAIL_V1` (una sola vez) |

Donde `XXX` es el identificador del workspace en mayusculas: `CHAT`,
`GMAIL`, `HUBSPOT`, `HOLDDED`, `TRELLO`, etc.

---

## 13. Definicion de terminado por workspace

- [ ] `pnpm typecheck` verde.
- [ ] El contenedor del workspace se ve en el navegador.
- [ ] `index.ts` del workspace exporta el contenedor.
- [ ] `docs/01-ui-map.md`, `02-roadmap.md`, `03-spec.md` con contenido real.
- [ ] `README.md` con mapa de componentes.
- [ ] `docs/04-handoff-v2.md` para la siguiente IA.
- [ ] `git status --short` limpio de ficheros no relacionados.

---

## 14. Ejemplo de patchset correcto

```powershell
cd "C:\Users\Alfonso\Desktop\git hub repos\agente"

$file = "apps/web/src/workspaces/02-whatsapp/types.ts"
$mark = "CHAT_UI_TYPES_V1"

if (Test-Path $file) {
  $content = Get-Content $file -Raw
  if ($content -match $mark) {
    Write-Host "SKIP: $mark ya existe" -ForegroundColor DarkGray
  } else {
    Write-Host "AVISO: $file existe sin la marca $mark. No sobreescribo." -ForegroundColor Yellow
  }
} else {
  $lines = @(
    '// CHAT_UI_TYPES_V1',
    '',
    'export type ChatRole = "owner" | "employee" | "client" | "agent" | "system"',
    ''
  )
  [System.IO.File]::WriteAllText(
    (Join-Path (Get-Location) $file),
    ($lines -join "`r`n"),
    (New-Object System.Text.UTF8Encoding $false)
  )
  Write-Host "OK: $file [$mark]" -ForegroundColor Green
}
```

---

FIN DEL HANDOFF.
