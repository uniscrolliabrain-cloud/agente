# Proveedores separados — cambio solicitado

Código `3b3db980` y `e7c155d4`. Slow selecciona OpenRouter + deepseek/deepseek-v3.2 mediante OPEN_ROUTER_API_KEY; un SLOW_LLM_* explícito conserva precedencia. La clave nueva OPENROUTER_API_KEY queda reservada a JEV y deja de convertirse en OPENAI_API_KEY o fallback de chat. No son aliases. Modelo DeepSeek documentado en OpenRouterTeam/docs, guides/routing/routers/switchyard-router.mdx, SHA 6b2906b9a76453c750faab9c8aa1cb0876ea62a7; disponibilidad/cuenta en vivo no verificadas.

Clientes separados por perfil en runtime V2 y cadenas legacy: endpoint/clave/modelo viajan juntos, sin mutar globals entre peticiones. Embeddings de Google no heredan la clave de Slow OpenRouter. Se conserva la precedencia explícita de perfiles y claves de roles.

Fast reconoce MUSE_API_KEY únicamente con un perfil compatible que declare explícitamente endpoint/modelo/protocolo. La clave sola no se envía a Google, OpenRouter ni a la API antigua de Llama. Meta directo y Contributor siguen pendientes de URL/documentación de Muse solicitada al founder; no se inventa modelo, URL ni flag ni se afirma modo activado. .env.example refleja el estado.

createApp recibe jevEgressPolicies desde bootstrap confiable y monta la fábrica JEV en el runtime existente. Ningún HTTP/modelo crea esa política; sin política no hay autorización automática por presencia de clave. Prueba real de composición local: createApp→Slow→JEV simulado→gate durable→proyección propuesta, sin certeza o efecto inventados.

Validación focalizada local: suite de perfiles/cadenas/kernel 19/19 PASS; suite app/perfiles/cadenas/routing 15/15 PASS, solapadas y no sumables. Typecheck raíz/worker exit 0 durante el incremento; raíz repetido tras montaje final. Logs /tmp/trans01-{llm-profiles-tests,provider-app-tests,provider-app-complete-tsc,llm-profiles-worker-tsc}.log. Pruebas con fuentes y transportes sintéticos; sin lectura de valores GitHub/Doppler ni llamada pagada, despliegue o cambio Supabase.
