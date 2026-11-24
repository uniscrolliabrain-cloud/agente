# Auditoría inicial

## Repositorio y SHAs

- `main` remoto de partida: `3acd03d2c98653dbb965ab867ec81e5ca973bf98`.
- Base local de campaña: `3acd03d` + merge del trabajo de Chat UX V2 (`8b1072e`).
- Integración Login V3: `303cbd6`.
- Integración Legal V1 + consentimiento: `aeef4e4`.
- Landing preservada + redirects + banner: `cc57524`.
- Rama publicada: `feat/dogfooding-v1`.
- SHA desplegado anteriormente: **no verificable sin acceso a Fly/Vercel**. El sitio
  público declara `last-modified: 2026-11-22` y el servidor de la app responde
  `Fly/9bb2ac9a88 (2026-11-23)`.

## Arquitectura real

| Dominio | Proveedor | Qué sirve |
|---|---|---|
| `agntiapro.com` | Vercel | landing estática + seis documentos legales `.html` |
| `www.agntiapro.com` | Fly (`agntiapro-api`) | panel `apps/web/dist` + `/api/*` en el mismo origen |

`apps/site` es lo que sube el job `vercel` de `.github/workflows/deploy.yml`.
El panel se sirve desde el contenedor Fly; un push a `main` no lo publica: el workflow
`Deploy` se dispara con tags `v*` o `workflow_dispatch`.

## Hallazgos

1. **Landing divergente.** El `apps/site` de `main` (3.693 bytes, página oscura antigua)
   no coincide con el sitio vivo (5.608 bytes, `release/landing-legal-20261122`). Se
   restauró el snapshot vivo antes de cualquier deploy.
2. **Legal duplicado.** Las seis páginas legales existen como HTML estático con textos
   aprobados del 2026-11-21. Legal V1 en UI Lab era un esquema sin texto. La promoción
   usa los textos publicados, no borradores.
3. **Login V3 era una maqueta.** Sus botones OAuth y el formulario solo mostraban avisos.
   Se sustituyeron por las rutas reales `/api/auth/oauth/{google,github}/start` y por
   `auth.login` / `auth.loginDemo`, conservando `useAuth` y la restauración de sesión.
4. **Superficies operativas aún no promovidas.** `chat-transversal-v3`,
   `command-center-editorial`, `apps-launcher` y `chat-ux-v2` siguen siendo piezas de UI
   Lab. No se declaran integradas.
5. **Credenciales.** El sandbox no tiene `FLY_API_TOKEN`, `VERCEL_TOKEN` ni sesión de
   `gh`. El deploy se lanza con el workflow existente a través de la integración de
   GitHub, que sí está autorizada.

## Componentes inspeccionados

- `apps/web/src/{App.tsx,main.tsx,vite.config.ts}`, `components/{Login,ChatPanel,ChatInput,SidebarChat,CommandCenterView}.tsx`.
- `hooks/{useAuth,useChat,useThreads,useWorkspaces}.ts`, `api/{auth,chat,client}.ts`.
- `apps/ui-lab/src/{login-v3,legal,chat-transversal-v3,command-center-editorial,apps-launcher,chat-ux-v2}`.
- Documentación de las siete campañas y `19-general`.
