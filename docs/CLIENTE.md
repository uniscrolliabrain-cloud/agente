# Guia del cliente

## Primer acceso

1. Recibe un email con la URL de tu workspace y tu contrasena temporal.
2. Entra y cambia la contrasena desde Mi perfil.
3. Conecta Google desde Mi perfil si vas a usar email o calendario.

## Chat

El chat es tu asistente. Pregunta lo que quieras o pide que ejecute un SOP.
Los terminos "capabilities", "workflows", "SOPs", "kernel" no aparecen nunca.

## Tareas

Cada cosa que el asistente hace en background es una tarea. Las ves en Tareas.
Estados:
- En curso: trabajando ahora.
- Necesita tu OK: esperando aprobacion (enviar email, crear evento, etc.).
- Necesita datos: te falta darle un dato.
- Completada: terminada.
- Con error: algo fallo.

## Aprobaciones

Antes de enviar un email o crear un evento, aparece una revision. Aprueba o
deniega. La accion no se ejecuta hasta que apruebes.

## Documentos

Sube PDFs, texto u Office desde el chat o desde Documentos. Los documentos
alimentan la busqueda semantica del asistente.

## Lo que sabe de tu negocio

Todo lo que el asistente aprende de tu negocio va aqui. Puedes editarlo o
borrarlo. Si algo es incorrecto, cambialo o borralo.

## Proyectos

Agrupaciones tematicas (un cliente, un producto, un proceso). Cada proyecto
tiene bloques editables y enlaces a memorias y artefactos.

## Centro de control

Dashboard operativo. Cuantas tareas en curso, cuantas esperan tu OK, cuantas
terminadas. Estado del sistema.

## Equipo

Si eres admin, puedes crear usuarios y asignarles SOPs. Cada usuario ve solo lo
suyo.

## Privacidad

- Un deployment por cliente. Tus datos no comparten servidor con otros.
- Las acciones externas requieren tu aprobacion explicita.
- Los documentos se guardan cifrados en disco.
- Los tokens de Google se cifran con AES-256-GCM.

## Soporte

Tu proveedor tiene un email de soporte. Los problemas que no se resuelven en
5 minutos se escalan automaticamente.