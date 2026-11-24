# Generación de iconos (C06)

## Infraestructura

El repositorio ya tiene un pipeline de imágenes en `tools/image-pipeline/` (job JSON + `generate.py`)
y el workflow manual `.github/workflows/generate-editorial-images.yml`, que usa OpenRouter
(`openai/gpt-image-2`) con el secreto `OPEN_ROUTER_API_KEY` y abre una PR con los resultados.

En este entorno **no hay claves** (`OPEN_ROUTER_API_KEY`, `OPENAI_API_KEY` ausentes) y el workflow
abre ramas/PRs, algo que esta campaña prohíbe. Por tanto:

- Los 35 iconos se generaron **individualmente** con la herramienta de imagen del entorno, aplicando
  la dirección artística aprobada en cada prompt.
- El pipeline OpenRouter queda intacto y documentado para regeneraciones futuras con el secreto del
  repositorio.

## Dirección artística de los prompts

Base común (idéntica en los 35, con el sujeto al final):

> Create a single premium three-dimensional enterprise application icon for AgntiaPro… warm ivory
> ceramic with a satin finish, sophisticated violet enamel, restrained champagne-gold metallic
> accents, seamless soft lavender studio background (#F0ECFC)… luxury industrial product photography…
> distinctive silhouette, centered, generous negative space. Square composition, high resolution, no
> typography, no labels, no external logos, no watermarks, no interface elements, no additional icons.
> Subject: …

Cada prompt añade una metáfora propia (sobre sellado, burbujas superpuestas, constelación de esferas,
factura con sello, carpetas apiladas, calendario, tarjetas con check, estrella facetada, rejilla de
registros, diana, monedas, bolsa, barras ascendentes, auriculares, plumín, engranajes, escalones con
check, tres figuras, busto, recibo enrollado, tarjeta con chip, paleta, tarjetas con ondas, escaparate,
salvavidas, cajas, llave inglesa, línea de producción, escudo, llave, portal en arco, libro abierto,
dial, columnas de tablero y consola de mando).

Los prompts definitivos están en `iconos/prompts-definitivos.json` y repetidos por app en
`iconos/final/manifiesto.json`.

### Relación con `iconos/generacion-v3.json`

Ese manifiesto (incorporado a `main` durante la campaña) fija los sujetos por app y una base de
estudio con **fondo marfil #FCFAF6**. La dirección aprobada por el founder y las cinco muestras de
referencia usan **fondo lavanda #F0ECFC**, que es lo que pide la prompt de esta campaña; los 35
renders siguen esa base. Los sujetos son equivalentes (sobre, bocadillos, factura con sello, carpetas,
calendario, planos de trabajo, diana, monedas, engranajes, escudo, llave, portal, libro, dial,
columnas, consola…). Si el founder prefiere marfil, `generacion-v3.json` es la vía de regeneración
sin reescribir la app: basta cambiar los archivos de `iconos/final/` y volver a lanzar `build-icons.py`.

Los 35 SVG tipográficos de `iconos/*.svg` se conservan como referencia histórica y **no** son el
acabado entregado.

## Archivos

| Ruta | Contenido | Tamaño |
|---|---|---|
| `iconos/original/<id>.jpg` | Entrega directa del generador (1024×1024) | 1,4 MB total |
| `iconos/final/png/<id>.png` | Original PNG 1024×1024 sin metadatos | 7,3 MB |
| `iconos/final/webp/<id>.webp` | Optimizado 512×512, calidad 88 | 335 kB |
| `apps/ui-lab/src/apps-launcher/icons/<id>.webp` | Icono de la app 320×320, calidad 84 | 133 kB |
| `iconos/final/manifiesto.json` | id, nombre, prompt, rutas, dimensiones y SHA-256 | — |
| `iconos/final/contact-sheet.png` | Hoja de revisión 7×5 para auditoría visual | — |

## Pipeline reproducible

```bash
python3 apps/ui-lab/docs/dashboards/11-apps/iconos/build-icons.py
```

Lee los originales, valida 1024×1024, escribe PNG, WebP 512, WebP 320 y el manifiesto con hashes.
Falla de forma explícita si falta un original o el tamaño no es el esperado.

## Identificadores y catálogo

Los 35 `id` coinciden con el inventario real de workspaces de `11-apps/README.md` y con
`prototipo/catalogo.json` (`01-gmail` … `35-centro-mando`). Contraste realizado antes de generar.

## Estado de aprobación

- **Técnico:** 35/35 archivos presentes, 1024×1024, sin texto ni logotipos, sin cuadrículas
  recortadas, carga correcta en la app (35/35 `img.naturalWidth > 0` en el cajón). Legibilidad
  comprobada a 48 px generando una tira de miniaturas (`iconos/final/tira-48px.png`).
- **Estético:** **pendiente de la auditoría del founder.** No se declara aprobado.
