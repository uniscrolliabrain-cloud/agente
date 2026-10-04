# Auditoria de default hardcodeado

> Generado por scripts/audits/tenant-default.ts el 2026-10-04T11:50:26.559Z

- Ficheros revisados: **303**
- Ocurrencias totales: **65**
- Permitidas: **63**
- Prohibidas: **2**

## Prohibidas

| Fichero | Linea | Snippet |
|---|---|---|
| apps\server\src\engine\events\bus.ts | 105 | .get<{ disabled: string[] }>(owner, "notification-prefs", "default") |
| packages\domain\src\views.ts | 20 | kind: z.enum(["primary", "default", "danger"]).default("default"), |