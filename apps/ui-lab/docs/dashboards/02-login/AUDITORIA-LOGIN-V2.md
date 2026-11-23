# Auditoría Login V2

El login actual en `apps/web/src/components/Login.tsx` contiene OAuth Google/GitHub, contraseña opcional, error y `onEnterDemo`. La propuesta adjunta plantea una nueva composición editorial, LAIA sin cuenta e invitaciones.

**Cambios de criterio:** preservar OAuth real y acceso sandbox; no fingir autenticación, conversación ni alta en invitaciones; validar la promesa de 30 minutos y el régimen de invitaciones; reutilizar branding y componentes existentes; separar la documentación del desarrollo. No se ha auditado el backend completo ni ejecutado tests.

[Prompt V2](./PROMPT-MAESTRA-LOGIN-V2.md)
