# Arquitectura visual, estados y gates

## Identidad
Reutilizar la estética de la landing AgntiaPro: marfil, superficies cálidas, violeta para acciones agénticas, tinta oscura, tipografías Fraunces/Manrope, bordes suaves y jerarquía editorial. Evitar saturación de tarjetas, fondos oscuros gratuitos y marcas visuales ajenas. Las variables locales actuales se consideran provisionales hasta reutilizar tokens compartidos.

## Árbol
```text
apps/ui-lab/src/comunicaciones/
  ComunicacionesWorkspace.tsx
  comunicaciones.css
  telefono/
    TelefonoWorkspace.tsx
    telefono.css
  docs/
    README.md
    01-WHATSAPP-BUSINESS.md
    02-TELEFONO-LLAMADAS-SMS.md
    03-SLACK.md
    04-ARQUITECTURA-Y-BRANDING.md
```

## Modelo funcional
Shell de canal (WhatsApp, Llamadas/SMS, Slack) → vista específica → acciones de demo. No acoplar el canal a un proveedor concreto: en producción el adaptador conecta proveedor y motor determinista; LAIA presenta y conversa; SOP executor aplica permisos y políticas. Toda escritura externa necesita aprobación, auditabilidad y controles tenant.

## Validación mínima
- `pnpm --filter @agente/ui-lab typecheck`
- `pnpm --filter @agente/ui-lab build`
- Smoke en UI Lab: tres pestañas, selección de llamada, aprobación y mejora, SMS, teclado, navegación móvil y retorno.
- Comprobar SHA de `version.json` en el despliegue y confirmar ausencia de conexiones reales.

## Publicación
Solo proyecto independiente de UI Lab; no desplegar ni modificar el servicio productivo. Un build verde no equivale a un despliegue ni a una prueba visual. Registrar cualquier limitación.
