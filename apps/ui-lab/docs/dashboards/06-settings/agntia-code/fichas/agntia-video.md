# Ficha · agntia-video

| Campo | Valor |
|---|---|
| Repo | `uniscrolliabrain-cloud/agntia-video` |
| Visibilidad | Público |
| Proyecto | Video |
| Superficies Agntia Code | Despliegues (local), Datos, Bitácora |
| Estado | PRODUCT_LOCAL |
| Verificado contra | `main@0af2c5bb442e3c9fc55d7fc6d9455b3d571a8ff7`, 2026-11-26 |
| Lenguaje | Python 3.11+ (FastAPI) + FFmpeg + paquete npm `@agntia/video` |
| Tamaño | 333 KB |
| Licencia | MIT |
| Issues abiertas | 0 |

## Propósito

Estudio de vídeo con agente: cargar material, cortar, limpiar voz, mezclar música, generar B-roll y exportar, con un agente que edita sobre el mismo proyecto sin pisar los retoques manuales.

## Qué declara que funciona hoy

- **Versión 0.4 (MVP)** para Windows y servidores Linux; funciona sin claves para cargar, editar cortes, previsualizar y exportar.
- DeepSeek y Gemini opcionales, configurables después; la app no incluye claves ni créditos y no simula respuestas si falta la clave.
- Modelo RNNoise local para limpiar voz, sin API.
- Detección de cambios del servidor y resolución de conflictos: si hay cambios en ambos lados, conserva los retoques y el guardado devuelve conflicto; no sobrescribe.
- Pruebas de API, contratos de IA y render real con FFmpeg en `tests/`.
- `docker compose up --build -d` y `python -m pytest -q` documentados.

## Qué no está verificado

- No hay despliegue en nube gestionado ni instancia de cliente.
- El propio README limita el alcance: el B-roll sustituye la imagen de un corte manteniendo el audio; no hay capas visuales, transiciones, doblaje ni avatares generados.
- No se ha ejecutado el render ni la suite en esta auditoría.

## Stack y ejecución (manifiesto real)

- Requisitos: Python 3.11+, Git y FFmpeg/ffprobe en `PATH`.
- `python3 -m venv .venv`, `python -m pip install -e '.[dev]'`, `python -m pytest -q`; también `docker compose up --build -d`.
- Paquete npm `@agntia/video` con scripts `build`, `test`, `typecheck` y bin `agntia`.
- Variables de entorno (solo nombres): `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `AGNTIA_DATA_DIR`, `AGNTIA_INBOX_DIR`, `AGNTIA_ACCESS_TOKEN`, `AGNTIA_MAX_UPLOAD_GB`.

## Datos e integraciones

Proyectos y material en `AGNTIA_DATA_DIR` / `AGNTIA_INBOX_DIR`; SQLite y archivos locales. DeepSeek y Gemini como proveedores opcionales de análisis, conversación y traducción; la app no verifica precios ni garantiza tarifas.

## Calidad

- MVP con pruebas de render real, contratos de IA y API, y límites escritos con precisión.
- Documentación de uso en Windows, edición al ritmo de beats, voz/MP3 y móvil.
- Licencia MIT.

## Límites y riesgos

- **Coste externo**: analizar, conversar o traducir consume créditos del proveedor; nunca llamar a las APIs al arrancar.
- Material audiovisual de clientes: `AGNTIA_MAX_UPLOAD_GB` y `AGNTIA_ACCESS_TOKEN` son controles mínimos; sin HTTPS público no debe exponerse.
- FFmpeg es dependencia de sistema, no de Python: un contenedor sin ffprobe falla en render.
- Historial de deshacer limitado a 70 pasos y a la sesión.

## Migración a Agntia Code

1. Alta como proyecto "Video" con `pip install -e '.[dev]'` y `python -m pytest -q`.
2. Superficies: Despliegues local/contenedor, Datos (proyectos y material) y Bitácora.
3. Entornos: las ocho variables; las claves de IA, vacías por defecto.
4. Mostrar en la ficha que no hay capas, transiciones ni avatares: evita promesas que el MVP no cumple.
