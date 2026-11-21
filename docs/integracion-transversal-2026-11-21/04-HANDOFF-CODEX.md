# Instrucción ejecutable para Codex

Actúa como ingeniero integrador principal de `uniscrolliabrain-cloud/agente`. Tu objetivo es **reconciliar todo el trabajo existente sin perder código útil ni romper producción**, siguiendo `docs/integracion-transversal-2026-11-21/README.md` y campañas C00-C10.

### Primer mensaje y primeras acciones
1. Informa HEAD de main, rama activa, git status, remotos, worktrees y versión desplegada si accesible.
2. Lee todos los documentos de este directorio y los informes actuales de Cognition V2, chat móvil, Anam/ElevenLabs, despliegue y universal conversation. Trata docs antiguos como hipótesis.
3. Recorre **todas** las ramas y commits accesibles, desde los más recientes, y completa matriz con evidencia; nunca deduzcas de un nombre que la rama está obsoleta.
4. Identifica exactamente qué commits del chat móvil están desplegados antes de plantear merge.
5. Produce plan por patches y conflictos, con archivos precisos y dependencias. Solicita confirmación antes de cualquier merge/deploy/borrado.

### Reglas de operación
- Mantén `main` intacto durante auditoría y preparación; trabaja en rama por campaña y PRs revisables.
- No sobrescribas `apps/web/src/App.tsx`, `useChat.ts`, `ChatInput.tsx`, `apps/server/src/app.ts` o `conversation.ts` con copias antiguas: son superficies de alto conflicto.
- Si una rama ya está contenida en main, registra ALREADY-IN-MAIN y no la fusiones de nuevo.
- Si una rama divergente tiene código aprovechable, extrae commits/patches mínimos o reimplementa sobre HEAD actual; no merges ciegos.
- Preserva deny-by-default, tenant scope, kernel, Cognition V2, auditoría, aprobación, RLS y separación fast/slow.
- No actives APIs de voz/video ni agentes con acciones empresariales si no hay contrato real, permisos y tests.
- No cambies configuración de secretos o deploy sin verificar CI y la procedencia del SHA de producción.
- No declares 'todo integrado' mientras existan branches sin clasificar o gates fallidos.

### Reporte obligatorio por campaña
`CXX-REPORT.md`: fecha, base/head SHA, fuentes leídas, inventario de commits, decisiones por archivo, patches aplicados, pruebas y resultados exactos, riesgos, rollback, estado GO/NO_GO, próximos pasos. Actualiza `BRANCH-MATRIX.md`, `PATCH-LEDGER.md` y `LEGACY-REGISTER.md`. Reporta también en chat, con enlaces a commits/PR.

### Criterio de terminado
Solo cuando todas las ramas tengan clasificación verificable, los patches aprobados estén integrados, el chat móvil no haya regresado, Cognition/tenant/kernel mantengan gates, los canales multimodales compartan conversación, los tests relevantes pasen y producción tenga procedencia SHA conocida. Limpieza destructiva de ramas es una decisión separada del fundador.

### Contexto de auditoría previo (verificar de nuevo)
Main `3023637`; rama móvil +22/-0; voz +11/-65; C00-C15 en main; W4/W5/W6 divergentes. 30 commits revisados individualmente de una muestra de 100; **queda trabajo arqueológico pendiente**. No atribuyas a estas cifras vigencia futura sin reconsultar.
