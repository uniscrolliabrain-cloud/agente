# AgntiaPro Launcher — arquitectura futura

Estado: propuesta documental, no implementar todavía. Complementa la APK privada existente; no sustituye su plan.

## 1. Alternativas
A: APK Capacitor convencional, baseline. B: HOME nativo más cliente Capacitor reutilizado, candidato preferido. C: launcher administrado con Work Profile/DPC, fase posterior. No ROM, root ni duplicación de runtime. Evaluar launcher en APK separada frente a módulo integrado mediante ADR.

## 2. Activación y jornada
Registrar Activity con ACTION_MAIN, CATEGORY_HOME y CATEGORY_DEFAULT. Solicitar ROLE_HOME mediante RoleManager cuando esté disponible, con confirmación del usuario; fallback a ajustes de aplicaciones predeterminadas. El sistema no garantiza alternancia silenciosa ni restauración programática del launcher anterior. Ofrecer modo personal dentro del launcher (sin mostrar datos laborales) y acceso explícito a ajustes para restaurar HOME original. Estados ilustrativos PERSONAL, ACTIVATING, WORK_ACTIVE, PAUSED, EXITING; separar estado de jornada del rol HOME. Horario propone transición, nunca fuerza cambio. Tras reinicio recuperar preferencias no sensibles y revalidar sesión.

## 3. Superficies
Home Compose con LAIA, tareas, aprobaciones, equipo, agenda, comunicaciones y accesos a workspaces. Abrir vistas React existentes mediante navegación interna o App Links validados. LauncherApps para aplicaciones visibles y perfiles autorizados; no asumir visibilidad universal. Back, gestos, teclado, safe areas, widgets y accesibilidad. Overlay opcional solo con permiso especial y justificación; no es requisito del MVP. Micrófono/cámara únicamente en interacción autorizada; no prometer escucha permanente ni captura de llamadas.

## 4. Contratos y autoridad
Backend remoto único. Adaptar ViewEnvelope/ViewSpec a componentes nativos allowlisted; nunca ejecutar código arbitrario del LLM. Validar schemaVersion, tenant, actor, expectedRevision, TTL, permisos y comandos. Mutaciones por SOP/approval; ACK y receipts correlacionados. Fast conversa, Slow/JEV propone, kernel dispone. Caché offline de mínimo alcance, lectura marcada como stale; no ejecutar acciones sensibles offline. OAuth por navegador del sistema/PKCE según proveedor; Android Keystore para material criptográfico, tokens protegidos y revocables; no secretos de servidor en APK. Push con payload mínimo, revalidación al abrir.

## 5. Privacidad y perfiles
Work Profile requiere provisionamiento compatible y controlador de políticas; no se crea por instalar un launcher corriente. Pausa de perfil según capacidades y control del usuario/administrador. NotificationListener opcional con consentimiento específico, filtros y exclusión de datos personales; no enviar notificaciones indiscriminadamente al backend. AccessibilityService no requerido, no usarlo para eludir permisos. Separar cuentas, archivos y tenants; limpiar caché al logout/cambio de tenant. Mantener acceso a llamadas de emergencia y ajustes. Sin control de barra de estado, lockscreen ni otras apps fuera de APIs autorizadas.

## 6. Campañas futuras
L0 auditoría de APK, UI móvil, auth, contratos, SDK y ramas; ADR de packaging y permisos.
L1 spike HOME Compose aislado con apps y salida segura; pruebas físicas de selección/restauración.
L2 sesión, branding, navegación y reutilización React; feature flag ACME.
L3 tarjetas tipadas, eventos, push y aprobaciones; pruebas de autorización y stale.
L4 jornada personal/profesional, revocación y continuidad; Work Profile como spike separado.
L5 voz/vídeo y comunicaciones bajo permisos; medir audio focus, batería y latencia.
L6 QA, firma, CI manual, APK privada y rollback; sin merge/deploy sin aprobación.

## 7. Certificación
Pruebas unitarias de estados, contract tests TS/Kotlin, instrumentación Android y dispositivos físicos (varios fabricantes/versiones), permisos revocados, proceso muerto, reboot, offline, token expirado, tenant cruzado, intents maliciosos, notificaciones sensibles, accesibilidad, emergencia, salida y desinstalación. Medir arranque, batería, p95 y éxito de tareas frente a APK normal. No declarar compatibilidad sin evidencia.

## 8. Referencias a verificar antes de implementar
- https://developer.android.com/reference/android/app/role/RoleManager
- https://developer.android.com/reference/android/content/pm/LauncherApps
- https://developer.android.com/work/managed-profiles
- https://developer.android.com/training/package-visibility
- https://developer.android.com/reference/android/service/notification/NotificationListenerService
- https://capacitorjs.com/docs

No se han auditado aún los contratos reales ni versiones SDK. Paths y tipos definitivos quedan pendientes de L0.


## Evolución del founder: tres modos, un mismo sistema (2026-11-25)
1. **App convencional:** Agntia como aplicación Android normal, sin sustituir HOME.
2. **AgntiaPro:** launcher empresarial durante la jornada, LAIA, equipo, workspaces, comunicaciones y centro de mando.
3. **AgntiaGo:** launcher personal y familiar, inspirado conceptualmente en asistentes personales multimodales como Muse de Meta (referencia del founder, no equivalencia técnica verificada). Compras, presupuestos domésticos, agenda familiar, viajes, ocio, alimentación, documentos, trámites y hogar.

AgntiaGo reutiliza kernel, runtime, Cognition, motor SOP, contratos, observabilidad y renderer; cambia catálogo de dominio, agentes, memorias, branding y permisos. No crear otro motor. Separar contexto personal, familiar y empresarial con scopes/tenants independientes, miembros y roles; no transferir memorias ni datos entre ellos sin autorización explícita. Compras, pagos y acciones externas requieren política y aprobación según riesgo; no conceder acceso familiar implícito.

El rol HOME de Android es independiente del modo de producto: una vez elegido el launcher, alternar Pro/Go dentro de él sin cambiar el rol; abrir la app convencional desde cualquier HOME, y ofrecer ajustes del sistema para restaurar launcher externo. La transición de dominio cancela o invalida comandos pendientes de UI, limpia caché visible y revalida sesión y permisos. Las tareas remotas continúan según su propia política, no por el modo visual. Notificaciones y conversaciones separadas por scope. Prototipar selector explícito, salida segura y pruebas de aislamiento, cambio de modo, cuentas familiares, revocación y compras. Packaging de una APK frente a módulos separados pendiente de ADR. No implementar todavía.
