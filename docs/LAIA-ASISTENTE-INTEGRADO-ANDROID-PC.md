# LAIA — Asistente Integrado Android PC

**Proyecto:** AgntiaPro  
**Estado:** propuesta de arquitectura, pendiente de implementación y validación en dispositivos  
**Fecha:** 26 de noviembre de 2026

## 1. Objetivo

Ofrecer una única LAIA empresarial accesible desde web/PC, APK Android y asistente digital predeterminado de Android. Todas las entradas se conectan al mismo runtime, identidad, permisos, memoria, tareas, eventos y auditoría de AgntiaPro. El usuario podrá comenzar una operación por voz con auriculares y continuarla desde el PC, sin duplicar el agente.

## 2. Experiencia de usuario

- Web/PC: chat, voz, tareas, aprobaciones y resultados sincronizados.
- APK Android: conversación de voz y texto; continuidad de tareas; audio por auriculares cuando corresponda.
- Asistente Android: selección voluntaria de LAIA como asistente predeterminado; invocación mediante gestos/botones soportados por el dispositivo; sesión de voz sin abrir manualmente la interfaz principal.
- «Oye Laia»: objetivo adicional de activación local. No prometer escucha permanente ni activación con pantalla apagada hasta probar restricciones de Android, permisos y hardware.
- Futuras entradas: WhatsApp, llamadas, Telegram y videoconferencias mediante adaptadores independientes.

## 3. Arquitectura lógica

```text
Web/PC ──────────────┐
APK Android ─────────┼──> Channel Gateway + Auth + Tenant/Workspace
Asistente Android ───┘                 │
                              Conversation / Fast LLM
                                      │
                           Cognition / Slow LLM
                                      │
                         Policy + Approval + SOP Runtime
                                      │
                         Tools / Integrations / Workers
                                      │
                  Events + Tasks + Memory + Audit + Notifications
```

El cliente móvil no ejecuta autónomamente acciones empresariales críticas: envía intenciones autenticadas. El backend valida identidad, tenancy, permisos, política y aprobaciones. El LLM propone; el kernel dispone.

## 4. Integración Android

- Implementar integración de asistente con `VoiceInteractionService` y sesiones compatibles con la versión del sistema; configurar la app para ser seleccionable como asistente predeterminado.
- La selección del asistente **no garantiza** detección de hotword personalizada ni acceso continuo al micrófono. Investigar disponibilidad real de APIs de hotword y restricciones por fabricante.
- Para «Oye Laia», evaluar detector local (por ejemplo, openWakeWord o solución comercial licenciada) y un servicio en primer plano de tipo micrófono cuando sea legal y técnicamente permitido. Validar permisos, notificación visible, inicio del servicio desde segundo plano y políticas de batería.
- No prometer reactivación después de «Forzar detención» ni apertura automática de actividades desde segundo plano.
- Gestionar audio focus, interrupciones, llamadas, Bluetooth/cascos, ruta de entrada/salida y controles de privacidad. El enrutamiento Bluetooth puede variar según dispositivo.
- Mostrar estado de escucha y permitir desactivar el wake word y borrar sesiones locales.

## 5. Integración PC

Fase inicial: experiencia web existente, con micrófono cuando la página está activa y permisos concedidos. El navegador no equivale a un asistente de sistema que escuche permanentemente con la web cerrada.

Fase posterior opcional: cliente de escritorio nativo con activación global y permisos específicos de Windows/macOS/Linux, según plataforma. No confundir esta capacidad futura con la entrega inicial.

## 6. Contratos de sincronización

Cada mensaje/acción debe incluir identificadores de `tenantId`, `workspaceId`, `userId`, `conversationId`, `sessionId`, `channel`, `correlationId` y `idempotencyKey` cuando corresponda.

- Conversaciones: historial y visibilidad por usuario/rol; continuidad explícita entre dispositivos.
- Memoria: memorias personales y empresariales separadas, con permisos, procedencia y retención.
- Tareas: estado persistente del servidor, recuperación y notificaciones entre canales.
- Eventos: registro append-only de solicitudes, decisiones, aprobaciones, ejecuciones y resultados, sin duplicar operaciones al reintentar.
- Concurrencia: resolver mensajes simultáneos y versiones de estado; no asumir que dos sesiones activas son una sola conversación.
- Offline: cola local limitada de acciones no críticas; ninguna ejecución privilegiada sin autorización del servidor.

## 7. Seguridad y privacidad

- Autenticación por usuario/dispositivo; tokens de corta vida y revocación.
- Aislamiento estricto entre empresas; RLS y autorización de recursos en backend.
- Consentimiento explícito para micrófono y escucha local; indicador visible; evitar almacenar audio crudo por defecto.
- Separar telemetría técnica de contenido empresarial. El operador de AgntiaPro puede observar salud, costes y fallos, no acceder indiscriminadamente a conversaciones de clientes.
- Acciones sensibles requieren políticas y aprobación; auditoría, cifrado en tránsito y reposo, retención y borrado.
- No incluir secretos de proveedores en la APK ni en el repositorio.

## 8. Voz y proveedores

Pipeline orientativo: detección local → captura/STT → conversación y herramientas del runtime → TTS (ElevenLabs u otro proveedor) → audio por ruta activa. Medir latencia extremo a extremo, interrupciones, coste por minuto y fallback cuando falle un proveedor. Anam, si se utiliza para avatar, es una capa de presentación opcional, no el núcleo de sincronización.

## 9. Plan de implementación

1. **Contrato multicanal:** verificar entidades, identidad, eventos, memoria, tareas y APIs existentes; diseñar adaptador sin duplicar lógica.
2. **APK voz básica:** login, sesión de audio, auriculares, permisos, continuidad con web.
3. **Asistente predeterminado:** integrar APIs Android, invocación por gesto/botón y pruebas de compatibilidad.
4. **Wake word opt-in:** prototipo local «Oye Laia», servicio y pruebas de pantalla apagada/batería, sin garantía previa.
5. **PC:** continuidad web; decidir si hace falta cliente nativo.
6. **Hardening:** observabilidad, permisos, pruebas multiempresa, reintentos, privacidad y costes.

## 10. Criterios de aceptación

- El mismo usuario inicia una tarea en Android y consulta el mismo identificador y estado desde web/PC.
- Una empresa nunca ve conversaciones, memoria ni tareas de otra.
- Una acción repetida por reconexión no se ejecuta dos veces.
- Las aprobaciones bloquean operaciones sensibles desde todos los canales.
- LAIA puede invocarse como asistente predeterminado en al menos un dispositivo Android compatible.
- Las pruebas documentan qué funciona con auriculares, pantalla apagada, aplicación fuera de primer plano y tras forzar detención.
- La escucha continua es opcional, revocable y muestra indicadores de privacidad.
- Se registran métricas de latencia, errores y costes sin filtrar contenido privado.

## 11. Costes y riesgos

Las APIs de integración de Android no requieren una licencia por instalación. Los costes dependen del desarrollo, licencias del detector si aplican, STT/TTS, tokens LLM, infraestructura y distribución. No fijar un coste por cliente ni una estimación de calendario sin pruebas de uso y compatibilidad.

**Riesgos principales:** restricciones de Android por versión/fabricante, batería, wake word con pantalla apagada, permisos del micrófono, rutas Bluetooth, seguridad multi-tenant y diferencias entre navegador y aplicación nativa.

## 12. Decisiones pendientes

- Framework y empaquetado de la APK.
- Dispositivos Android mínimos de referencia y versión mínima.
- Política de sesiones compartidas y separación de memoria personal/empresarial.
- STT/TTS por defecto y presupuesto de latencia/coste.
- Necesidad real de cliente PC nativo frente a web.
- Matriz de compatibilidad y publicación privada o Play Store.

**Regla arquitectónica:** una LAIA, múltiples interfaces; una fuente de verdad en el runtime central; políticas, auditoría y privacidad transversales.
