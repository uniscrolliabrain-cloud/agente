# AgntiaPro — Android APK y beta privada (implementación futura)

Estado: **DOCUMENTACIÓN / NO IMPLEMENTAR TODAVÍA**. Rama `docs/future-android-private-beta`. Fecha: 2026-11-21.

## Objetivo
Reutilizar la interfaz móvil React/Vite/Tailwind existente de AgntiaPro para entregar una aplicación Android instalable, inicialmente para dogfooding privado, sin duplicar la UI ni alterar producción.

## Decisiones pendientes
- Comparar PWA instalable, Capacitor con assets React empaquetados y wrapper de web remota. Preferencia inicial: **Capacitor con assets empaquetados**, sujeto a auditoría real del repo.
- Mantener backend remoto existente; jamás empaquetar secretos del servidor en la APK.
- Definir applicationId permanente (candidato `com.agntiapro.app`), nombre, iconos, splash, deep links y estrategia de versiones.
- Decidir canal: APK privada (gratis), Play internal testing (hasta 100 testers) o closed testing. La cuenta Google Play cuesta **25 USD una vez**, sujeto a políticas vigentes.

## Antes de escribir código: auditoría obligatoria
1. Revisar main y ramas recientes, especialmente cambios de UX del chat móvil; identificar package.json, pnpm workspace, Vite config, rutas, build outputs, env vars, SPA fallback, service workers.
2. Revisar OAuth Google/Better Auth, cookies, redirect URI, PKCE, app links y políticas de Google para WebViews. No asumir que el login web funciona sin adaptación; preferir navegador del sistema/flujo nativo compatible.
3. Verificar chat bottom-sheet, teclado virtual, safe areas, gestos atrás, scroll, overlays y ocultación del botón flotante.
4. Verificar permisos y APIs: micrófono, grabación, voz ElevenLabs, videollamada Anam, cámara, WebRTC, audio focus, notificaciones, enlaces y descargas.
5. Auditar CSP, CORS, autenticación, sesión, multi-tenant, logout, almacenamiento seguro, separación de tenants y privacidad.
6. Validar SDK Android, JDK, Gradle, Capacitor y plugins en sus versiones actuales. No copiar comandos sin contrastarlos con el workspace.

## Plan de implementación futuro
### Campaña A — Diseño y ADR
Documentar arquitectura, inventario de componentes, decisiones y riesgos. Establecer criterios de aceptación y rollback.

### Campaña B — Scaffolding Android
Crear proyecto Android aislado dentro del monorepo (ruta definitiva tras auditoría). Instalar `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` con pnpm, configurar `webDir` según salida Vite, `appId`, navegación y permisos. Evitar modificar la app web de producción innecesariamente.

Ejemplo ilustrativo, **no ejecutar ciegamente**:
```bash
pnpm add @capacitor/core @capacitor/android
pnpm add -D @capacitor/cli
pnpm exec cap init AgntiaPro com.agntiapro.app
pnpm build
pnpm exec cap add android
pnpm exec cap sync android
cd android && ./gradlew assembleDebug
```
La ubicación de estos comandos depende de la estructura y configuración pnpm real. APK debug esperada en `android/app/build/outputs/apk/debug/app-debug.apk` relativa al proyecto Android.

### Campaña C — Integración nativa
Ajustar status/navigation bars, safe-area, teclado, hardware back, deep links, permisos runtime y sesiones OAuth. Pruebas físicas Android 14+ y distintas densidades de pantalla. Verificar Anam/ElevenLabs, chat y WebRTC con dispositivos reales.

### Campaña D — Distribución privada gratis
Crear APK debug para pruebas internas, descargar artefacto privado de GitHub Actions e instalar en dispositivo propio mediante gestor de archivos. Android puede pedir habilitar instalación desde esa fuente. Para terceros usar **release firmada**, no compartir debug builds. No subir keystore ni contraseñas al repo.

### Campaña E — CI/CD GitHub Actions
Workflow manual `workflow_dispatch` en rama Android, pnpm frozen-lockfile, build web, sync Capacitor, JDK/Android SDK, Gradle, tests, build APK y upload-artifact privado con retención limitada. Separar firma release mediante secrets protegidos; nunca publicar APK ni secretos sin aprobación. VersionCode incremental y procedencia verificable. No desplegar automáticamente a producción.

### Campaña F — Google Play opcional
Abrir Play Console (registro único aprox. USD 25; verificar precio/políticas al ejecutar), verificar identidad, configurar ficha, privacidad, Data safety, permisos, contenido y cuenta de prueba. Subir **AAB release firmado** a pruebas internas (hasta 100 testers), o beta cerrada. Cuentas personales nuevas pueden requerir 12 testers durante 14 días continuos para solicitar acceso a producción; no es requisito general para instalar una beta interna. Revisiones y plazos varían; confirmar requisitos vigentes.

### Campaña G — QA y handoff
Matriz: login/logout, cambio de tenant, refresh token, chat, teclado, bottom sheet, cámara, micrófono, audio, videollamada, notificaciones, offline/error, navegación atrás, permisos denegados, instalación y actualización de APK con firma consistente. Guardar reportes, logs redactados y capturas. No mergear ni desplegar sin aprobación explícita.

## Criterios de aceptación
- APK instalable con icono AgntiaPro y UI móvil sin regresiones.
- Login seguro, tenant aislado, chat y navegación operativos.
- Voz/vídeo verificados o limitaciones documentadas.
- Pipeline reproducible y artefacto descargable por el propietario.
- Producción web intacta; ninguna credencial embebida; release firmado cuando proceda.

## Handoff para Codex
Al reanudar: **audita el estado real de main y ramas antes de tocar código**. Convierte este documento en ADR + campañas granulares con paths concretos y tests. Trabaja en nueva rama de implementación desde main actualizado, no en esta rama documental. Reporta al finalizar cada campaña y solicita aprobación antes de merge/deploy.

## Referencias
- https://capacitorjs.com/docs
- https://developer.android.com/studio/build/building-cmdline
- https://developer.android.com/developer-verification
- https://support.google.com/googleplay/android-developer/
- https://docs.github.com/en/actions
