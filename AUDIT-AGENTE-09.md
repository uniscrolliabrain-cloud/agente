# Auditoría del agente 9

## Localización y arranque

- [x] Revisar la raíz Git de la campaña.
- [x] Enumerar ramas y worktrees registrados.
- [x] Identificar la convención de carpetas hermanas `wt-r01-aNN`.
- [x] Registrar que el primer inventario carece de un worktree A09.
- [x] Identificar la ruta, la rama y el commit base de A09.
- [x] Leer AGENTS.md y la ficha del encargo, si existen.
- [x] Registrar entregable, criterios de aceptación y dependencias.
- [x] Mover esta auditoría a la carpeta A09 y anotar la hora de arranque.

## Stepper del sprint · 30 minutos

- [x] 00–02 · Registrar alcance y estado Git.
- [x] 02–04 · Localizar archivos, consumidores y puntos de entrada.
- [ ] 04–06 · Identificar comandos de validación y reproducir el estado base.
- [x] 06–08 · Desglosar cambios por archivo con una comprobación por cambio.
- [x] 08–12 · Ejecutar el primer cambio y revisar el diff.
- [x] 12–16 · Ejecutar el siguiente cambio y comprobar su integración.
- [x] 16–20 · Completar el entregable y registrar evidencias parciales.
- [x] 20–23 · Ejecutar comprobaciones focalizadas.
- [ ] 23–26 · Revisar fallos, corregir los recuperables y repetir pruebas.
- [x] 26–28 · Revisar el alcance del diff y el estado Git.
- [ ] 28–30 · Registrar resultados, pendientes y hora de cierre.

## Bitácora

- Preparación · La raíz está en master sin commits. El primer inventario mostró worktrees A01, A02, A03, A04 y A06. Auditoría provisional en la raíz mientras se localizan A09 y su ficha. El cronómetro de ejecución queda pendiente.
- Preparación · Confirmado R01/A09 en docs/operacion/SPRINTS-10-AGENTES-10-RONDAS.md: cubrir .com, Google, Places y Vapi en scripts/secrets-check.ts, con salida 0 y sin filas duplicadas. El segundo inventario sigue sin mostrar A09. Base común observada: 0c8fe81.

### Matriz de trazabilidad R01/A09

- [x] .com · Contrastar PUBLIC_API_URL y ALLOWED_ORIGINS existentes con PUBLIC_SITE_URL y VITE_API_URL en DEPLOY.md.
- [x] Google · Confirmar el par OAuth y contrastar GOOGLE_REDIRECT_URI con el callback derivado descrito en INVENTARIO-CONEXIONES-Y-GUIA-COPILOTO.md.
- [x] Places · Confirmar GOOGLE_MAPS_API_KEY en apps/server/src/leads-routes.ts.
- [x] Vapi · Comparar la lista actual con CUENTAS.md. VAPI_WEBHOOK_SECRET figura como variable prevista en la documentación.
- [x] Probar el comando público en sample y registrar su salida.
- [x] Comprobar que el filtro de grupos y las obligaciones de live conservan su comportamiento.
- [ ] Cerrar con estado Git, resultados y duración observada.
- 15:57:29 · Inicio de ejecución en sprint/r01-a09-secrets-check, base 0c8fe81.
- Implementación · Añadidas PUBLIC_SITE_URL, VITE_API_URL y VAPI_WEBHOOK_SECRET como opcionales. Google OAuth conserva sus dos entradas y el callback derivado. Places conserva GOOGLE_MAPS_API_KEY con una descripción explícita.
- Validación sample con Node · salida 0, 45 filas, 0 duplicados, 0 nombres esperados ausentes.
- git diff --check · salida 0.
- 16:02:52 · Validaciones directas: filtro salida 0, core presente False; live bootstrap salida 1. Cambios locales: scripts/secrets-check.ts y esta auditoría.

- Validación del comando público · pnpm secrets:check --mode=sample salió con 0.
- Comprobación de filtro · Node --only=google,vapi,leads salió con 0. Grupo core presente: False.
- Comprobación live del grupo bootstrap · salida 1.

- Comando de paquete · pnpm secrets:check --mode=sample, código 0.
