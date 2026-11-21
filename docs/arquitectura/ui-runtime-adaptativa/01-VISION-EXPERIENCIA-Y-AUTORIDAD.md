# 01 — Experiencia generativa, pero autoridad determinista

## Qué percibe el usuario
«LAIA, muéstrame los clientes con facturas pendientes y prepara un seguimiento». LAIA conversa; se abre el workspace apropiado, aparece un dashboard o tabla contextual, se selecciona un cliente y se prepara un borrador. Para el usuario, sus agentes parecen manejar la aplicación. Esto es una metáfora de interfaz, no una delegación de autoridad al modelo.

## Qué sucede realmente
1. Un evento del chat, voz o vídeo entra por el contrato conversacional.
2. El runtime resuelve identidad autenticada, tenant, sesión, hilo y contexto semántico de la UI.
3. El sistema de atención y contexto recupera únicamente evidencias pertinentes. El Fast LLM recibe un número limitado de tarjetas de pocos tokens, con metadata y confianza; no todo el estado.
4. Fast responde de inmediato y/o expresa intención. El kernel valida capabilities, permisos, revisión del contexto y targets.
5. Slow LLM puede analizar asíncronamente, con evidencias y presupuestos propios; JEV clasifica bajo contratos y políticas, no concede permisos. La salida del análisis se proyecta en grafo/memorias/tarjetas.
6. El runtime resuelve datos y elige un ViewSpec/template codificado; entrega comandos UI tipados, o ejecuta un SOP autorizado si se trata de negocio.
7. Frontend aplica el comando si target, revisión, permisos y estado coinciden, y devuelve ACK/rechazo.
8. Los eventos y recibos actualizan las proyecciones; una microtarjeta posterior puede informar a LAIA del resultado.

## Separación estricta
- **Fast/LAIA**: conversación, continuidad narrativa, respuesta de baja latencia; puede desconocer workspaces no relevantes.
- **Slow**: razonamiento diferido y propuestas basadas en evidencia; nunca sustituye la validación del kernel.
- **JEV**: clasificación/ontología semántica cuando está configurado y autorizado; no es el ejecutor ni debe suponerse siempre activo.
- **Kernel**: identidad, invariantes, permisos, trazabilidad, recibos y límites.
- **Runtime/SOPs**: consulta, composición de vistas, ejecución determinista, acciones con aprobaciones.
- **Grafo multicapa y memorias**: conocimiento duradero, relaciones, atención, proyecciones y revocaciones.
- **Frontend**: componentes/templates programados; aplica UI commands válidos y emite eventos semánticos.
- **Branding**: configuración visual del tenant; no altera el workflow.
- **Personalización**: reglas de UX implementadas; no sustituye decisiones empresariales.

## Ejemplos de experiencia
- «Abre el Centro de Mando»: resolución del workspace autorizado y navegación, sin slow necesario.
- «Pon las tareas urgentes arriba»: ordenación programada y guardado de preferencia individual, sin cambiar el orden global de la empresa.
- «Rellena los datos de esta propuesta»: runtime prepara draft con procedencia por campo; UI presenta borrador editable; guardar/enviar requiere acción separada.
- «Muéstrame una comparación de ventas»: consulta validada, ViewSpec dashboard/table, componentes programados; no generación libre de JSX.
- «Cambia los colores de nuestra marca»: cambio en workspace Branding con validación, publicación y refresh de templates; no CSS inventado por LLM.

## Límites de experiencia
La aplicación no debe afirmar que se guardó, envió o aprobó algo hasta recibir confirmación del backend. El chat no debe describir acciones que no hayan sucedido. Los estados pending/confirmed/failed y sus recibos deben existir aunque el usuario solo vea una narración fluida. Nunca ejecutar código arbitrario recibido del LLM.
