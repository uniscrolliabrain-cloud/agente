# Auditoria de default hardcodeado

> Generado por scripts/audits/tenant-default.ts el 2026-10-18T13:01:41.194Z

- Ficheros revisados: **458**
- Ocurrencias totales: **76**
- Permitidas: **60**
- Prohibidas: **16**

## Prohibidas

| Fichero | Linea | Snippet |
|---|---|---|
| apps/server/src/admin-tenants.ts | 128 | id: "default", |
| apps/server/src/app.ts | 94 | bootstrapPersonas(personaRegistry, "default", clientsDir), |
| apps/server/src/app.ts | 95 | bootstrapPersonas(personaRegistry, "default", "clientes/_example"), |
| apps/server/src/app.ts | 234 | tenantScope: "default", |
| apps/server/src/app.ts | 247 | const ontologyPath = joinOntology(process.env.OPENMUSE_CLIENTS_DIR ?? "clientes", "default", "ontology.json"); |
| apps/server/src/engine/agents/personas/routes.ts | 30 | if (!deps.tenantService) return "default"; |
| apps/server/src/engine/agents/personas/routes.ts | 34 | return "default"; |
| apps/server/src/engine/build-applier.ts | 68 | target = schema.id ?? "default"; |
| apps/server/src/engine/events/bus.ts | 126 | .get<{ disabled: string[] }>(owner, "notification-prefs", "default") |
| apps/server/src/index.ts | 36 | const tenants = ["default", "_example"]; |
| apps/web/src/workspaces/14-zendesk/components/IconButton.tsx | 5 | type Variant = "default" \| "ghost" \| "primary"; |
| apps/web/src/workspaces/14-zendesk/components/IconButton.tsx | 23 | export default function IconButton({ variant = "default", size = "md", children, label, className = "", ...rest }: Props) { |
| packages/domain/src/views.ts | 20 | kind: z.enum(["primary", "default", "danger"]).default("default"), |
| scripts/migrate-tenant-membership.ts | 21 | if (row.id === "default") { skipped++; continue; } |
| scripts/migrate-tenant-membership.ts | 23 | const existing = await db.get("system", "tenant-membership", "default"); |
| scripts/migrate-tenant-membership.ts | 26 | id: "default", |