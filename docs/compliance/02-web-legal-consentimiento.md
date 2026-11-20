# Campaña 02 — Web legal, cookies y consentimiento

## Dependencia
Inventarios de campaña 01 y datos societarios aportados por fundador. Textos definitivos sujetos a revisión jurídica.

## Fases
1. **Auditoría de rutas**: inspeccionar router web y sitio público real, enlaces footer, auth, onboarding, accesibilidad, móvil, idiomas; no crear rutas duplicadas.
2. **Páginas**: aviso legal (LSSI, identidad/contacto), política de privacidad (arts. 13/14 RGPD), política de cookies, términos SaaS y borrador DPA; versiones fechadas, enlaces estables, contacto y responsable.
3. **Consentimiento**: solo si hay cookies/SDK no exentos, CMP que bloquee categorías opcionales hasta opt-in, rechazar/aceptar con facilidad comparable, granularidad, cambiar decisión y registro minimizado; no bloquear cookies técnicas necesarias.
4. **Integración Google**: páginas públicas accesibles sin login, dominio verificado, enlaces desde pantalla OAuth/Google Cloud Console, branding, explicación de scopes, minimización y políticas de uso/retención de datos de Google. La verificación de Google la hace el fundador.
5. **UX**: footer y enlaces visibles en landing, login y app; texto entendible, móvil, teclado y lector de pantalla; evitar dark patterns.
6. **Pruebas**: Playwright sin consentimiento, rechazo, aceptación, revocación, persistencia, modo incógnito y varios navegadores; comprobar network requests y cookies reales.

## Superficies candidatas
`apps/web/src/**`, rutas de autenticación y middleware de cookies; determinar paths exactos tras auditoría. Evitar introducir trackers innecesarios.

## Entregables
Páginas y componentes en código si la campaña se ejecuta; `reports/CAMPANA-02-REPORTE.md`, evidencias de navegación, tabla de consentimientos, lista de acciones Google Console.

## Aceptación
Páginas públicas enlazadas y funcionales; ninguna cookie opcional antes de permiso; rechazo y revocación operativos; copy legal aprobado antes de publicación. No presentar borradores como asesoramiento jurídico definitivo.
