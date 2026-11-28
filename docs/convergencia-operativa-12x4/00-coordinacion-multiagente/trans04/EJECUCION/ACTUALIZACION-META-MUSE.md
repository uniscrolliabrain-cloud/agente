# Actualización — contrato Muse localizado

Código `4804cd0e`. Supera el estado pendiente de Muse del mapa anterior, que se conserva como evidencia histórica. Meta Model API usa https://api.meta.ai/v1, protocolo compatible con Chat Completions y modelo muse-spark-1.3-contributor para el modo solicitado. MUSE_API_KEY sigue viniendo de Doppler; no se convierte en una clave de OpenRouter ni se inventa un binding GitHub que el founder no indicó.

Fuente oficial recuperada: https://github.com/meta-models/meta-model-cookbook/tree/281239ed357edbb1ecdb9e7e055d57bad51b1075, README y 04_muse_code/11_mcp_security_tooling/README.md. Portal: https://dev.meta.ai/docs. El HTML del portal está bloqueado por egress en el entorno; su cookbook oficial fue accesible y su licencia atribuye Meta Platforms, Inc. Se usa documentación, no se ejecutan recetas externas.

Preflight reconoce provider meta con los defaults documentados y rechaza redirigir su clave a otro host. CLI de conexiones describe el modelo/directo sin dar por probada una inferencia. Suite de preflight/mapeos 14/14 PASS, cero SKIP; typecheck raíz PASS. Logs /tmp/trans04-muse-{preflight-tests,tsc}.log. Cuentas, saldo, tarifas vigentes y disponibilidad real del modelo siguen sin verificarse. No se hicieron cambios remotos de secretos ni despliegue.
