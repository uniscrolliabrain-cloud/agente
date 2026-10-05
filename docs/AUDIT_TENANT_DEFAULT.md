# Auditoria de default hardcodeado

> Generado por scripts/audits/tenant-default.ts el 2026-10-05T11:23:31.300Z

- Ficheros revisados: **324**
- Ocurrencias totales: **66**
- Permitidas: **64**
- Prohibidas: **2**

## Prohibidas

| Fichero | Linea | Snippet |
|---|---|---|
| apps\server\src\engine\events\bus.ts | 109 | .get<{ disabled: string[] }>(owner, "notification-prefs", "default") |
| packages\domain\src\views.ts | 20 | kind: z.enum(["primary", "default", "danger"]).default("default"), |