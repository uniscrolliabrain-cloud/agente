# Integración OpenRouter / DeepSeek / Meta Muse — checkpoint

**Código local validado; conexiones reales sin verificar; Meta pendiente de contrato.** Gate completo sobre `12a36277d817e9245eb8de308696883b33ceda2a`, limpio antes/después: 10/10 comprobaciones PASS; tests 1.171, PASS 1.141, FAIL 0, SKIP 25, TODO 5. Typecheck raíz/worker y siete auditorías pasan, cero contratos huérfanos. Env saneado y fixtures/dobles; las omisiones/TODO no son PASS. Comandos, SHA de logs y manifest en EVIDENCIA-OPENROUTER-MUSE.json; originales locales /tmp/trans00-provider-final-gate/gate. C15 mantiene NOT_CERTIFIED/NO_GO del programa completo.

| Uso | Configuración adaptada | Límite actual |
|---|---|---|
| JEV | OPENROUTER_API_KEY; typesafe/jev-1.14; Decisions API de OpenRouter | Requiere política server-side de egress; clave/cuenta/inferencia real sin probar |
| Slow | OPEN_ROUTER_API_KEY; deepseek/deepseek-v3.2; cliente separado | Disponibilidad/saldo/latencia/coste real sin probar |
| Fast | MUSE_API_KEY para Meta directo | Falta documentación o URL base/modelo/protocolo y selección Contributor; no activado por tener clave |

Se leyeron docs oficiales OpenRouterTeam/docs 6b2906b9a76453c750faab9c8aa1cb0876ea62a7, especialmente guides/community/jev.mdx, jev-tutorial.mdx y el ejemplo DeepSeek de routing/routers/switchyard-router.mdx; SDK TypeScript 5f342ec8d9361124956f1de09ad4a10d8f794d28. La red bloqueó openrouter.ai, pero permitió recuperar su repositorio oficial. No se confunde JEV con un modelo de chat ni se usan aliases latest. El identificador canónico fechado devuelto queda en la evidencia.

La composición mantiene el mismo runtime/Slow/contexto y gate durable, con fuentes minimizadas, revocación, cuotas, recibos y cero resend de la misma operación. Se verificó también SDK real con SSE simulado: los chunks compactos se normalizan a eventos públicos mínimos y no se pierde texto ni se expone reasoning/metadata. Stream vacío falla explícitamente. Legacy y V2 usan clientes propios por perfil; embeddings de Google no heredan la clave OpenRouter. Informes Trans01/02 documentan reproducción y regresiones.

El workflow superpone únicamente valores GitHub no vacíos sobre Doppler y traduce SUPABASE_SECRET al nombre de servicio local, sin cambiar DSN/cifrado. Los dos nombres OpenRouter son cuentas separadas. Ambos scripts de import fueron ejecutados con dobles locales de Doppler/Fly; ningún workflow real fue disparado. Grafana distingue token API y Cloud, y Sentry distingue DSN de tokens administrativos; SDK/ingestión/exportación reales no acreditados. Mapa completo en trans04/EJECUCION/MAPA-CONECTORES-SOLICITADO.md. Google/WhatsApp/Resend/Vapi conservados, sin afirmar renovación.

Cambios e informes publicados en exec/Trans01, exec/Trans02, exec/Trans04 e integration/trans00-core. La documentación añadida después del gate no modifica código funcional; el SHA probado se conserva. Se mantienen campañas/README originales. Las seis campañas siguen INCOMPLETE y conservan pendientes internos y externos previos. Para cerrar este pedido de Fast queda pendiente la documentación de Muse solicitada al founder; no se pide el valor de MUSE_API_KEY.
