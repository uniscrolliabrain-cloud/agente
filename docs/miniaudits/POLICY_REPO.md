# Policy del repo durante la campana de fixes

> v1 - 2026-10-04 - Estado: active
> Que NO se puede hacer mientras la campana de 25 bloques esta en marcha.

## 1. Archivos compartidos

| Archivo | Bloques que lo tocan |
|---|---|
| apps/server/src/app.ts | 02, 07, 09, 13 |
| apps/server/src/engine/service.ts | 03, 04, 05, 07, 08, 09, 12 |
| apps/server/src/engine/worker.ts | 03, 05 |
| apps/server/src/engine/conversation.ts | 03, 09, 11 |
| apps/server/src/engine/model.ts | 03, 10 |
| apps/server/src/kernel/kernel.ts | 09, 10, 12 |
| apps/server/src/db.ts | 07, 08, 12 |
| packages/domain/src/index.ts | 06, 08 |
| packages/domain/src/views.ts | 13, 14 |
| package.json | 01, 02 |

## 2. Archivos intocables sin justificacion

- apps/server/src/db.ts (motor durable).
- apps/server/src/kernel/audit/store-store.ts (hash chain).
- packages/domain/src/* (contratos).
- clientes/* (datos de clientes).
- apps/worker/* y apps/computer/* (sandboxes).

## 3. Prohibiciones absolutas

- No anadir dependencias nuevas sin justificar.
- No cambiar contratos Zod sin actualizar tests.
- No borrar codigo huerfano sin marcarlo PENDING durante 1 release.
- No mergear a main sin typecheck y test verdes.
- No cambiar packages/domain sin avisar a bloques 04-06.
- No subir .bak-fase0*, artifacts/, backups/, .openmuse/ al repo.
- No usar console.log directo en codigo de servidor.
- No hardcodear timeouts, modelos, paths, keys.
- No dejar catch {} vacios.
- No reutilizar marcas de idempotencia.
- No saltar fases: bloque A antes que B cuando hay dependencia.
- No anadir features que no esten en el roadmap.

## 4. Reglas de idempotencia y verificacion

- Cada fix idempotente. Aplicar dos veces no duplica codigo.
- Cada fix se verifica con Select-String de su marca.
- Cada bloque con tabla 15/15.
- Cada cambio TS con pnpm typecheck.

## 5. Reglas de anclas y edicion

- Anclas cortas y unicas. Maximo 10 lineas.
- Preservar line endings.
- UTF-8 sin BOM siempre.
- No usar -replace con regex sobre bloques largos.

## 6. Reglas de PowerShell

- No usar nombres de funcion de 1-2 letras.
- No usar here-strings de mas de 40 lineas.
- No usar Write-Host con -f fuera de parentesis.
- No usar exit dentro de bloques pegados.

## 7. Reglas de docs

- Cada doc empieza con: > vN - YYYY-MM-DD - Estado: <state>.
- Cada miniaudit/roadmap con marca audited-deep cuando se profundice.
- No duplicar docs.

## 8. Reglas de git

- Un bloque, un commit.
- Mensaje: feat(bloque-NN): descripcion.
- No force-push a main.
- No binarios grandes (>10 MB).
- No .env ni secretos.

## 9. Orden topologico de bloques

1. 01 (Tests).
2. 02, 08 (Observabilidad, Bus).
3. 03, 05, 06 (Resiliencia, Motor, Aprobaciones).
4. 04, 07 (Multi-usuario, Multi-tenant).
5. 09, 10, 11, 12 (Kernel, LLMs, Chat, Contexto).
6. 13, 14, 15 (UI servida, Templates, Frontend).
7. 16, 17 (Auth, Seguridad).
8. 18, 19 (Deploy, Backups).
9. 20, 21, 22, 23 (Sandboxes, Canales).
10. 24 (Business OS).
11. 25 (Docs).

## 10. Reglas de rollback

git revert <commit-del-bloque>. Comprobar que las marcas ya no aparecen.
Documentar en fixes.md como reverted.

## 11. Referencias

- docs/audits/PROTOCOLO_FIXES.md
- docs/audits/00-coherencia/miniaudit.md
