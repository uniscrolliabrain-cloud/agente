# C02 W9 — Auditoría y notificaciones reconstruibles

Se sustituye la entrega live-only de audit/notifications en tenants V2 por KernelReceiptProjector. Efectos, inbox y cursor se confirman en una transacción fijada; un fallo revierte las escrituras y deja el evento para retry durable. Reutiliza funciones y formatos existentes y conserva read=true durante replay.

El worker tiene carril independiente de Slow/Fast, cursor/lease/fence persistentes y namespace tenant:owner. Valida tenant del journal contra la lease. Las suscripciones anteriores omiten tenants migrados; conservan compatibilidad para el resto. Requiere worker V2 independiente o embebido, como las otras proyecciones; el timer no define la garantía.

Verificación: 3/3 PASS, 0 fail/skip/cancel/todo, 8.003067 s: fallo entre auditoría/notificación con rollback de efecto/cursor; reinicio/retry; dos empresas con mismos owner/eventId; replay conservando lectura; dos conexiones Postgres concurrentes; exclusión del callback legacy. Primer intento: aserción de bigint número/string corregida normalizando Number. TypeScript raíz+worker PASS.

Cierra P1-05 del checkpoint para estas dos proyecciones en tenants opt-in. Thought/turn indices, subscriber de cognición y métricas requieren todavía evaluación independiente. C02 sigue EN CURSO por migración transversal y restore operacional. Sin shared RLS activada, empresas reales, merge ni despliegue.
