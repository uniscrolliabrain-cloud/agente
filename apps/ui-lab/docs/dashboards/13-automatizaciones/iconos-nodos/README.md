# Producción y aceptación visual — nodos V1

## Dirección
Conservar el lenguaje de Apps y Landing, adaptado a nodos circulares tipo Make. El bitmap es un objeto individual cuadrado, recortado por CSS en círculo; los puertos, conexiones, estados, nombres, badges y animaciones son UI independiente. No dibujar conectores dentro de las imágenes. Mantener el significado por silueta, no solo color. Los 14 tipos son una propuesta UX sintética, no contratos de ejecución.

## Pipeline real
- `tools/image-pipeline/generate.py` y `.github/workflows/generate-editorial-images.yml`.
- Modelo por defecto openai/gpt-image-2, una petición por imagen, máximo 12 por job, prompt 20–3000 caracteres.
- Lote piloto: `tools/image-pipeline/jobs/automatizaciones-nodos-piloto.json` (3).
- Lote restante: `tools/image-pipeline/jobs/automatizaciones-nodos-resto.json` (11).
- Directorios separados bajo `assets/generated/automation-nodes/` porque el generador sobrescribe assets-manifest.json en cada ejecución y solo permite prefijos aprobados.
- Ejecutar manualmente desde Actions, rama main, manifest indicado, dry_run=true primero; después false para generación real. Revisar piloto antes del segundo lote. No tocar generate-now.json ni modificar allowlist. El workflow existente abre rama/PR de assets para revisión; no fusionar sin aprobación.
- Tras aprobación, preparar derivados WebP 320/128 px y copiar al directorio público de UI Lab dedicado, con rutas BASE_URL. No realizado todavía.

## Gate artístico
Revisar cada original por separado y en una cuadrícula de prueba a 48, 64 y 96 px, sobre canvas marfil y lavanda. Comprobar dimensiones cuadradas, encuadre circular sin recortes, silueta reconocible, consistencia de cámara, escala, luz, sombras, esmalte y porcelana. Comparar con los iconos reales de Apps. Revisar especialmente webhook/API, tarea/aprobación y reloj/espera para evitar confusiones. Rechazar textos, logos, marcas, mosaicos, brillo excesivo, ornamentos, fondos inconsistentes o sombras cortadas. Regenerar únicamente el ID rechazado con su prompt completo. Estados de ejecución mediante anillo externo y texto accesible; puertos y aristas renderizados por la interfaz.

## Estado
14 prompts y dos manifiestos preparados. Sin generación API, sin imágenes verificadas, sin cambios funcionales ni despliegue solicitado. Mockup founder pendiente. Conocimiento V6 validado provisionalmente por el founder; prioridad UX actual Tareas y Automatizaciones.
