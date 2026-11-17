# Google, Microsoft y superficies embebidas

## Onboarding
Botón «Conectar Google Workspace» o «Conectar Microsoft 365» dentro de AgntiaPro. OAuth/OIDC autoriza cuenta y recursos necesarios; registrar tenant, usuario, proveedor, cuenta, scopes, fecha, autorizante y estado. La autenticación a AgntiaPro para el chat es independiente del consentimiento para consultar Gmail/Drive/Graph. Si hay varias cuentas o empresas, selección explícita.

## Google
Gmail API: leer, buscar, borradores, enviar, adjuntos, hilos, etiquetas, notificaciones (watch/PubSub). Drive API: buscar, metadatos, documentos, permisos; contexto del archivo abierto cuando el host lo exponga. Calendar API después. Google Workspace Add-ons pueden ofrecer paneles en aplicaciones soportadas, pero su UI y eventos son restringidos; no asumir chat React libre ni persistencia de una conexión streaming continua. Evaluar cards, acciones y llamadas HTTP compatibles. Una extensión de Chrome es alternativa para UI más rica, con políticas de tienda, permisos y soporte limitados al navegador.

## Microsoft
Microsoft Entra OAuth, Graph Mail/Files/Calendar; Outlook add-in con Office.js donde corresponda. Outlook Web/desktop pueden tener capacidades distintas. Para OneDrive/SharePoint usar APIs y superficies permitidas; no asumir que un add-in de Outlook aparece automáticamente en Word o Teams. Requiere instalación/despliegue según tenant y aprobación administrativa en algunos entornos.

## Permisos incrementales
Google gmail.readonly, gmail.compose, gmail.send, gmail.modify y Drive scopes granulares; Microsoft Graph Mail.Read, Mail.ReadWrite, Mail.Send, Files.Read y scopes pertinentes. Pedir solo lo necesario. Evitar scopes amplios como https://mail.google.com/ salvo necesidad justificada. Google scopes Gmail pueden ser restringidos y exigir verificación/evaluación de seguridad; Microsoft consentimientos varían por organización. Confirmar requisitos actuales antes de publicar.

## Flujo
Panel -> token de sesión AgntiaPro -> API chat -> harness -> adaptador de herramientas (MCP opcional) -> Gmail API / Graph -> resultado -> historial central -> panel. MCP no sincroniza historial ni instala el panel. Los refresh tokens quedan cifrados en backend, nunca en LLM ni frontend.

## Capacidad por host
Crear una matriz verificada de: soporte UI lateral, autenticación, contexto de recurso, acciones, eventos, streaming, distribución, límites de revisión y políticas. No prometer «en cualquier web» por defecto. Si no existe host embebible, abrir AgntiaPro en pestaña o extensión autorizada.
