# Datos y flujos

| Flujo | Datos y ubicación observada | Límite |
|---|---|---|
| Cuenta y OAuth | Identidad y sesión en users/auth/oauth-login y records; perfil y Bearer en localStorage | Finalidades, base, plazos y canal de identidad por aprobar |
| Tenant, miembros e invitados | TenantService y TenantScopedStore, membership y roles de empresa separados de roles de plataforma | Sin jerarquía de tenants asumida |
| Chat, archivos y memoria | threads, files, RAG, cognición y modelo de tenant | Revisar clasificación de prompts y adjuntos y procedencia de memorias derivadas |
| Google Workspace | Credencial cifrada, correo, contactos operativos, agenda, archivos y datos de terceros | Datos externos no se eliminan automáticamente al desconectar |
| Leads/WhatsApp | leads-routes, whatsapp-routes, webhooks y records operativos | El contacto puede no tener cuenta. Identificar quién actúa como responsable y quién como encargado por finalidad y contrato |
| Voz | Web Speech en compositor, Vapi en voice-routes, receipts en coordinator | Auditar transcripción remota y llamadas antes de afirmar plazos o no grabación |
| Derechos | `privacy-request`, actor autenticado, tenant/owner, tipo, ID y estado | No almacena texto libre ni resultados de exportación |
