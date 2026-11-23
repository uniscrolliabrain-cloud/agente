# Generador reutilizable de imágenes editoriales · AgntiaPro

**Acceso desde cualquier chat:** indicar `uniscrolliabrain-cloud/agente`, workflow `.github/workflows/generate-editorial-images.yml`, script `tools/image-pipeline/generate.py` y carpeta de jobs `tools/image-pipeline/jobs/`. Un agente con acceso a GitHub puede crear otro JSON de job y lanzar el workflow si tiene permisos. El generador no está limitado a Formación: admite destinos bajo `assets/generated/` para otras superficies y bajo `apps/ui-lab/public/formation/images/` para Formación.

## Ejecutar
1. En GitHub, ir a **Actions → Generate editorial images (manual) → Run workflow**.
2. `manifest`: `tools/image-pipeline/jobs/formacion-pilot.json`.
3. Ejecutar primero con `dry_run=true`: valida configuración **sin consumir API**.
4. Crear secreto de Actions `OPENROUTER_API_KEY` con tu clave de OpenRouter (el saldo se consume por cada generación). Nunca pegarla en el chat ni en archivos del repo. No exponer la clave en JSON ni logs.
5. Elegir `model` (por defecto `openai/gpt-image-2`; verificar disponibilidad y precio en OpenRouter) y repetir con `dry_run=false` para generar 3 WebP y un manifiesto. El workflow crea una rama y **solicita una pull request**, sin hacer merge ni desplegar.

**Requisitos de repo:** Actions habilitadas, permisos de lectura/escritura para `GITHUB_TOKEN` y autorización para que Actions cree PRs. Si la política bloquea PRs, el job fallará en ese paso; los assets de la rama pueden revisarse, pero no se integrarán automáticamente.

## Nuevos destinos desde otros chats
Crear `tools/image-pipeline/jobs/mi-proyecto.json` con:
```json
{
  "version": 1,
  "outputDir": "assets/generated/mi-proyecto",
  "images": [
    {
      "id": "portada-01",
      "size": "1536x1024",
      "alt": "Descripción accesible",
      "prompt": "Prompt editorial de al menos veinte caracteres, sin texto incrustado"
    }
  ]
}
```
Máximo 12 imágenes por ejecución. Los nombres de archivo derivan del ID, nunca de texto no confiable. Solo se escriben imágenes y manifiesto en rutas permitidas. Para admitir otro destino del repositorio, modificar la allowlist `ALLOWED` del script y el `git add` del workflow tras revisión; no se permiten rutas arbitrarias por seguridad.

## Calidad, costes y control
El workflow utiliza la **Image API de OpenRouter**, endpoint `POST https://openrouter.ai/api/v1/images`, y la clave `OPENROUTER_API_KEY`. Por defecto solicita `openai/gpt-image-2` (modelo configurable en el workflow); la facturación es con el saldo de OpenRouter. El parámetro `size` del manifiesto se traduce a `aspect_ratio` 1:1, 3:2 o 2:3; el proveedor determina los píxeles efectivos. Consultar modelos y precios actuales en https://openrouter.ai/api/v1/images/models y https://openrouter.ai/collections/image-models. **El dry run solo valida JSON y rutas; no prueba conexión, saldo ni disponibilidad del modelo.** Produce WebP optimizados. Los resultados son **propuestas visuales**; revisar en PR el contenido, la coherencia con Landing/Studio, licencias y posibles errores antes de fusionar. No genera vídeos ni publicaciones. El manifiesto marca `review-required`.

## Diagnóstico
- Sin secreto `OPENROUTER_API_KEY`: error antes de generar.
- Error 400/403: verificar modelo, acceso y payload.
- Sin PR: revisar permiso `Allow GitHub Actions to create and approve pull requests`.
- Si el repositorio tiene branch protection, usar PR; nunca forzar push a main.
- Este pipeline no convierte imágenes ya generadas en ChatGPT en archivos del repo: crea imágenes nuevas desde la API.

## Estado de integración OpenRouter
Adaptado en main el 2026-11-23; **no ejecutado en GitHub Actions ni probado contra la API con una clave real**. Comenzar con el piloto de 3 imágenes o reducir temporalmente el job a una para limitar costes. No lanzar generación de pago sin decisión expresa. La creación de PR depende de los permisos del repositorio.
