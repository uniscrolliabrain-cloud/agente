# Historias de usuario y UX

## Historia principal
09:15 Gmail: «Laia, revisa el correo de Pedro y prepara una respuesta». LAIA responde: borrador listo, falta presupuesto. 09:22 Drive: «Busca el presupuesto de Pedro y añádelo». LAIA localiza el archivo autorizado y prepara adjunto. 11:40 AgntiaPro: «¿En qué quedamos con Pedro?». LAIA contesta desde el mismo hilo y solicita aprobación para enviar. En AgntiaPro aparecen los mensajes anteriores con insignias discretas de origen Gmail y Drive.

## Estados
- Primera conexión: inicio de sesión AgntiaPro, elección empresa, OAuth Google/Microsoft con consentimiento incremental, instalación de superficie, comprobación de conexión.
- Primera apertura: resolver hilo activo desde backend; si no existe, crear uno; mostrar historial paginado.
- Nueva pestaña o aplicación: reutilizar hilo activo; suscribirse a eventos y reconciliar.
- Nuevo chat: crear hilo y actualizar puntero activo; propagar cambio a demás clientes. Mantener hilos anteriores.
- Seleccionar hilo antiguo: opción «ver aquí» o «convertir en conversación activa en todas partes»; evitar cambio global accidental.
- Usuario offline: mostrar estado y borrador local; no asegurar entrega hasta ACK servidor; reintento idempotente.
- Mensaje largo/stream: emitir estado de procesamiento y respuesta progresiva; persistir estados y cierre de turno en servidor.
- Dos interfaces abiertas: mostrar nuevos mensajes en ambas; no reemplazar todo el historial.
- Varias empresas: selector explícito, cambio de contexto seguro, historial independiente.
- Múltiples personas: cada persona tiene su hilo personal por defecto, con hilos compartidos solo mediante autorización explícita.
- Cuenta desconectada: chat sigue existiendo; herramientas de esa cuenta quedan inhabilitadas.

## UX mínima
Cabecera LAIA + empresa + título del hilo; botón Nuevo chat; selector de historial; burbujas y marcador discreto «desde Gmail/Drive»; campo escribir; streaming; aprobación; errores recuperables. No repetir foto de LAIA en cada respuesta. Interfaz adaptable a capacidades reales de cada host.

## No objetivos iniciales
Registrar como chat cada correo leído o documento editado sin intervención de LAIA; permitir que contenido externo mande órdenes al harness; replicar los 34 workspaces completos dentro de Gmail.
