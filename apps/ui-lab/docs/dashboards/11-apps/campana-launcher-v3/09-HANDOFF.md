# Handoff — Launcher V3

## Qué está entregado

| Entrega | Ruta |
|---|---|
| Preview registrada | `/?view=apps-launcher-v3` (id `apps-launcher-v3`) |
| Código | `apps/ui-lab/src/apps-launcher/` |
| Clon documental con hashes | `campana-launcher-v3/componentes-finales/` |
| Iconos | `11-apps/iconos/final/` (PNG 1024, WebP 512, manifiesto) |
| Iconos de la app | `apps/ui-lab/src/apps-launcher/icons/` (WebP 320) |
| Prompts | `11-apps/iconos/prompts-definitivos.json` |
| Capturas | `11-apps/qa/capturas/` |
| QA | `11-apps/qa/qa-resultados.json` y `08-QA.md` |
| Artifact | `11-apps/artifact/` + paso en `.github/workflows/ui-lab.yml` |
| Documentación | `11-apps/campana-launcher-v3/` (00–09) |

## Qué puede hacer el founder ahora

1. Abrir `/?view=apps-launcher-v3` en UI Lab.
2. Recorrer reposo → escritorio → cajón → carpeta → app → recientes.
3. Probar ratón, teclado y táctil (tablet/portátil con pantalla táctil).
4. Descargar el artifact `apps-launcher-v3-chromebook` desde GitHub Actions y abrirlo con
   `bash iniciar.sh` en un Chromebook.
5. Auditar la colección de 35 iconos en `iconos/final/contact-sheet.png` y aprobar o pedir ajustes.

## Qué no está hecho y por qué

| Pendiente | Motivo | Siguiente paso sugerido |
|---|---|---|
| Aprobación estética de iconos | Es competencia exclusiva del founder | Revisar hoja de contacto y pedir regeneraciones por `id` |
| Regeneración con GPT Image del pipeline | Sin `OPEN_ROUTER_API_KEY` en este entorno | Ejecutar `generate-editorial-images.yml` con un job que apunte a `iconos/` |
| Integración de los 35 workspaces reales | La campaña prohíbe reinventarlos o conectarlos | Abrir el workspace real desde la app correspondiente en producción |
| Login o desbloqueo biométrico | La prompt prohíbe simular autenticación | Mantener el login de AgntiaPro |
| Algoritmo de apps frecuentes | Requiere especificación y permisos propios | Campaña específica de metadashboard |
| Ejecución del workflow de artifact | No hay ejecución de CI desde este entorno | Lanzar `UI Lab` en Actions y descargar el artifact |

## Decisiones que conviene conocer antes de continuar

- **Launcher, no marketplace**: nada redirige a servicios externos; las apps son herramientas de la
  empresa y su superficie es una demostración identificada.
- **Nombres visibles ≠ identificadores**: el catálogo conserva `01-gmail`… `35-centro-mando`; lo que
  se muestra es «Correo», «Conversaciones», «Clientes»…
- **Una app, una superficie**: cualquier app abre la misma superficie de demostración parametrizada
  por categoría. Si en el futuro se monta un workspace real, el punto de extensión es
  `AppTransition` (sustituir el cuerpo por el componente del workspace cuando exista contrato).
- **Modalidad de entrada**: no usar `@media (max-width)` para decidir hover/touch.
- **Motion**: cualquier animación nueva debe respetar `alp-reduced` y `prefers-reduced-motion`.

## Riesgos conocidos

- `backdrop-filter` en superficies translúcidas: en equipos muy modestos puede costar; el diseño
  funciona sin él (fondo opaco de respaldo en `.alp-root`).
- `:has()` requiere Chrome 105+/Safari 15.4+; en navegadores antiguos el launcher conserva altura
  `100dvh` y aparecería el scroll de 26 px del marco, sin romper la vista.
- Favoritos y recientes persisten en `localStorage`; en modo privado la demo funciona sin memoria.

## Estado de publicación

Nada desplegado. Producción intacta. `main` contiene el código y la documentación; el artifact se
publica por CI cuando se lance el workflow.
