# Composición de proveedores en Cognition V2

Código `b197bd45`: CopilotInferenceProvider usa los mismos perfiles/clientes por lane que el kernel legacy; Slow recibe DeepSeek mediante OPEN_ROUTER_API_KEY y JEV utiliza su cuenta OPENROUTER_API_KEY. La fábrica JEV se compone con ContextServingFacade del runtime existente y políticas server-side por tenant. No segundo worker/cola/contexto ni default allow por tener clave. createApp monta ese puerto en el incremento Trans01 e7c155d4.

Prueba de composición: runtime→Slow→JEV Decisions simulado→autorización/recibo durable→proyección proposed, conserva hypothesis. Tenant sin política denegado; replay no repite intento facturable. Suite ampliada 19 pruebas: 18 PASS, cero FAIL, 1 SKIP PG; typecheck raíz/worker PASS. Logs /tmp/trans02-openrouter-{composition-tests,composition-complete-tsc}.log y /tmp/trans02-provider-composition-worker-tsc.log. Ejecución local, fixtures y dobles, no certificación de cuenta/API/coste real.

Meta directo usa el nombre MUSE_API_KEY indicado por el founder. No se ha verificado endpoint/modelo/protocolo de Muse ni cómo se selecciona Contributor; pendiente documentación solicitada. No se envía esa clave a endpoints deducidos ni a OpenRouter. El trabajo anterior y sus evidencias se conservan.
