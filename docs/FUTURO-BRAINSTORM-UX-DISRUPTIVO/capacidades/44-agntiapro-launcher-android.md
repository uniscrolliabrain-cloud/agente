# 44 — AgntiaPro Launcher: entorno operativo agéntico sobre Android

> FUTURO / BRAINSTORM. Idea del founder, 24 de noviembre de 2026. No autoriza implementación ni despliegue.

## Experiencia
Al comenzar la jornada el usuario activa AgntiaPro y el móvil entero adquiere una experiencia empresarial: escritorio propio, LAIA como interfaz conversacional, equipo humano y agentes, agenda, centro de mando, workspaces, comunicaciones y aplicaciones Android. Al terminar recupera su entorno personal. No es una ROM ni un nuevo kernel: es una superficie operativa sobre Android, reversible y voluntaria.

## Diseño UX
Home calmada, branding por tenant, tarjetas de misión, menú vivo por intención, continuidad de conversación y bottom sheets. LAIA accesible por texto, voz y vídeo cuando el usuario lo solicita; Marcos y demás agentes visibles mediante estado real del runtime. Cajón de aplicaciones, búsqueda, accesos directos, notificaciones profesionales y aprobaciones. Evitar vigilancia, ruido y duplicar interfaces aprobadas. Mantener navegación y salida de emergencia.

## Stack candidato
Launcher HOME nativo Kotlin/Jetpack Compose; reutilizar cliente React mediante Capacitor para workspaces complejos. Android RoleManager, LauncherApps, Intents, App Links, widgets y notificaciones con permisos explícitos. Work Profile opcional con provisionamiento administrado. Sin root, sin firmware propio, sin prometer control de System UI o cambio silencioso de launcher.

## Wiring e invariantes
Fast/LAIA conversa; Slow/JEV propone; kernel autoriza; SOPs ejecutan. El launcher no adquiere autoridad empresarial ni copia las cinco memorias. ViewEnvelope/ViewSpec y UI Commands tipados, catálogo nativo certificado y fallback web. Branding por tokens, tenant/actor, revisión, TTL, ACK, idempotencia, audit receipts, fail-closed. Eventos semánticos correlacionados, sin registrar actividad personal por defecto. Revocación y logout eliminan datos locales sensibles.

## Convergencia
01 menú vivo, 03 conversación persistente, 07 misiones, 11 continuidad multidispositivo, 14 hábitos/SOPs, 20 espacios persistentes, 21 computación ambiental, 25 computer use híbrido (solo con autorización), 28 profundidad cognitiva, 31 periferia de atención, 32 componentes polimórficos, 35 gestos, 40 branding y 43 interoperabilidad declarativa.

## Validación
Prototipo ACME con feature flag; inicio y fin de jornada, selección y recuperación de HOME, permisos denegados, reinicio, offline, aislamiento tenant, revocación, accesibilidad, batería y latencia. Comparar contra APK convencional. No alterar producción. Auditar código y ramas antes de elegir paths o dependencias.

## Arquitectura complementaria
[Diseño técnico Android](https://github.com/uniscrolliabrain-cloud/agente/blob/docs/future-android-private-beta/docs/futuro/android-private-beta/LAUNCHER-AGNTIAPRO.md).


## Evolución del founder: tres modos, un mismo sistema (2026-11-25)
1. **App convencional:** Agntia como aplicación Android normal, sin sustituir HOME.
2. **AgntiaPro:** launcher empresarial durante la jornada, LAIA, equipo, workspaces, comunicaciones y centro de mando.
3. **AgntiaGo:** launcher personal y familiar, inspirado conceptualmente en asistentes personales multimodales como Muse de Meta (referencia del founder, no equivalencia técnica verificada). Compras, presupuestos domésticos, agenda familiar, viajes, ocio, alimentación, documentos, trámites y hogar.

AgntiaGo reutiliza kernel, runtime, Cognition, motor SOP, contratos, observabilidad y renderer; cambia catálogo de dominio, agentes, memorias, branding y permisos. No crear otro motor. Separar contexto personal, familiar y empresarial con scopes/tenants independientes, miembros y roles; no transferir memorias ni datos entre ellos sin autorización explícita. Compras, pagos y acciones externas requieren política y aprobación según riesgo; no conceder acceso familiar implícito.

El rol HOME de Android es independiente del modo de producto: una vez elegido el launcher, alternar Pro/Go dentro de él sin cambiar el rol; abrir la app convencional desde cualquier HOME, y ofrecer ajustes del sistema para restaurar launcher externo. La transición de dominio cancela o invalida comandos pendientes de UI, limpia caché visible y revalida sesión y permisos. Las tareas remotas continúan según su propia política, no por el modo visual. Notificaciones y conversaciones separadas por scope. Prototipar selector explícito, salida segura y pruebas de aislamiento, cambio de modo, cuentas familiares, revocación y compras. Packaging de una APK frente a módulos separados pendiente de ADR. No implementar todavía.
