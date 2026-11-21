# Progreso Freebuff

## Fase 0. Reconocimiento

- Base `de924e09b145348c3aed64f85fb03a8a7687e3aa`, sobre main `3023637`. Árbol inicial limpio. Respecto de main, la base añade únicamente sitio estático y documentación de compliance.
- Ramas fuera de main al auditar: fix móvil `18ee1c1` (+22), baseline móvil `a61978e` (+23), UX multimodal `b0ac38b` (+30), cognition `add8798` (+1), conversación universal `ebf2206` (+9), scaffold avatar `f530eee` (+11/-65). El runtime cognition `685ef3a` sí es ancestro de main. Revisar solapamientos en App, SidebarChat, hojas móviles, CSS, threads y voz antes de integrar. Fast LLM tenant-aware en main (`c028225`); las pruebas históricas de Anam/ElevenLabs (`54b8d54`) no demuestran una superficie React operativa.
- Vercel publica apps/site en agntiapro.com y Fly sirve app/API en www.agntiapro.com según deploy y smoke existentes. GET público de landing 200 y privacidad 404 al inicio. Vite solo aproxima /api local por proxy. Los borradores se verifican en servidor estático local.
- AppShell controla rail/drawer desde App; SettingsMenu maneja Escape y backdrop con capas CSS; el chat móvil está en App y puede abrir Ajustes. Integrar privacidad con el ciclo de Ajustes, evitando cambios al composer, rutas y autenticación.
- OAuth login separado del conector. Cookie técnica om_oauth_binding, 600 s, HttpOnly, SameSite=Lax, ruta /api/auth/oauth. Sesión/perfil/tema/thread y estado rail en localStorage. No aparecen tags publicitarios en la landing o entrada React; analytics interno es una API de métricas tenant. Ver inventario para límites de alcance.
- Persistencia: records (owner, kind, id), tenant-membership, credenciales cifradas, state OAuth y stores cognition/voz en SQL. TenantPrincipal valida el contexto y el middleware instala el scope. RLS opcional legacy no sustituye el scope. El Store ofrece insertIfAbsent y comparación/actualización atómicas. El coordinador de voz conserva receipts y digests. La cadena de auditoría conserva vínculos de actor/owner.
- Proveedores observables en código: Google, GitHub, Fly/Vercel, Postgres (Neon en scripts), modelos configurables y WhatsApp; la presencia histórica de Anam/ElevenLabs no verifica uso, región ni contratos. Backups, RAG, eventos, memoria y terceros requieren inventario de purga antes de ejecutar supresión.

## Fase 1. Sitio público
Se añadió el índice de confianza y se estructuraron los borradores existentes con metadatos de versión y estado, navegación relativa y foco visible. El contacto se conserva como contacto general de la landing. La versión publicada queda sujeta a la aprobación jurídica y al gate de la fase 7.

## Fase 2. Login y Ajustes
Navegación legal visible en la tarjeta de login y Ajustes. Origen canónico de Vercel con override validado para pruebas. Diálogo nativo con Escape, backdrop y scroll independiente, integrado como transición de Ajustes sin cambiar AppView, drawer o composer.

## Fase 3. Cookies y almacenamiento
Inventario por clave en inventario/COOKIES-STORAGE.md y detalle técnico en el borrador informativo. El código inspeccionado carece de etiquetas opcionales en web y app, por lo que no se añade CMP. El navegador e infraestructura externa se verifican por separado.

## Fase 4. Derechos y conservación
Solicitud personal persistida en el Store por tenant y cuenta, validación estricta, deduplicación atómica y listado en Ajustes. CLI de operador con transiciones de estado atómicas. La revisión humana precede a cualquier actuación. Inventario de retención con dependencias de Postgres, RAG, eventos, auditoría, backups y proveedores.

## Fase 5. Gobernanza y conexiones
Consulta de gobernanza restringida a la membership vigente con tenant.admin (owner en la matriz actual). Inventario de controles pendientes y enlace a políticas. El componente Google se comparte con Mi perfil y muestra permisos, atribución disponible, consecuencias y desconexión por API existente. WhatsApp muestra el proveedor y flujo de datos en su vista existente. Se desactiva agregación de scopes previos en la solicitud OAuth de conector. Los scopes amplios de escritura se mantienen por compatibilidad hasta validar el inventario de capacidades.

## Fase 6. Transparencia IA
Aviso contextual accesible en chat completo, dock y sheet, con enlace a información recuperable. El compositor distingue dictado de conversación de voz. Inventario de voz, avatar, medios sintéticos, RRHH y supervisión. Los avisos hablados de telefonía y la etiqueta Anam quedan pendientes de verificar en canales operativos y ramas correspondientes.

## Fase 7. Integración y QA
Gate estático para metadatos, placeholders, noindex y enlaces locales. El modo release impide publicar los borradores desde el flujo de despliegue existente y el comando de release. Se añaden pruebas HTTP de identidad activa, idempotencia y permisos, y Playwright para escritorio/móvil. La matriz y el handoff recogen resultados y bloqueos.
