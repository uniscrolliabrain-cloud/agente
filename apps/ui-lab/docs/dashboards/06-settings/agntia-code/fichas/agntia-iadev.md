# Ficha · agntia-iadev

| Campo | Valor |
|---|---|
| Repo | `uniscrolliabrain-cloud/agntia-iadev` |
| Visibilidad | Público |
| Proyecto | IA Dev / Knowledge |
| Superficies Agntia Code | Academia, Datos, Observabilidad, Bitácora |
| Estado | SIN_CLASIFICAR |
| Verificado contra | `main@67b6671b0aff8b40e2710535cde0ea6601f337cf`, 2026-11-26 |
| Lenguaje | Python 3.11+ |
| Tamaño | 1 458 KB (1,26 MB son un volcado de chat) |
| Licencia | sin declarar |
| Issues abiertas | 0 |

## Propósito

Motor de conocimiento determinista para el currículo de IA Dev: ingesta, navegación y contratos de adaptador LLM. Según `README-KNOWLEDGE-ENGINE.md`, es **scaffolding ejecutable, no sistema RAG terminado**.

## Qué declara que funciona hoy

- Paquete `agntia-iadev-knowledge` 0.1.0, sin dependencias obligatorias, con extras `api` (FastAPI/Uvicorn) y `dev` (pytest/httpx); consola `iadev`.
- Estructura: `curriculum/` (introducción, software con IA, ocho etapas, bonus, challenge, prácticas), `docs/01-taxonomia/`, `src/iadev/` (parser, SQLite FTS5, catálogo, API, protocolo de proveedor), `schemas/`, `integrations/` y `tests/`.
- El README advierte: repo público, no exponer la API ni enviar contenido a un LLM externo sin revisar privacidad y control de acceso.

## Qué no está verificado

- El `README.md` raíz tiene **14 bytes** (`# agntia-iadev`): no hay estado, comandos ni límites en la puerta de entrada.
- No se ha ejecutado `pytest` ni el CLI; no hay cifra de tests ni de cobertura.
- Conectores de `integrations/`: el documento los declara pendientes.

## Stack y ejecución

- `pip install -e '.[dev]'` y `pytest` (configurado en `pyproject.toml`, `testpaths = ["tests"]`).
- CLI: `iadev`.
- Variables de entorno (solo nombres): `IADEV_SOURCE`, `IADEV_DB`, `IADEV_MANIFEST`, `IADEV_PROVIDER`, `IADEV_API_KEY`, `IADEV_MODEL`.

## Datos e integraciones

SQLite con búsqueda FTS5 como almacén local; manifiesto de ingesta y fuente canónica en la raíz. Proveedor LLM por contrato, sin integración verificada. También contiene `typescript/`, presumiblemente consumidor o SDK, no revisado.

## Calidad

- Hay `tests/` y configuración de pytest, pero sin resultado reproducible en esta auditoría.
- Documentación de arquitectura y operaciones dentro de `docs/`.
- El archivo `ChatGPT-Auditar aprendizaje en repositorios-20261119-1135.md` (1,26 MB) domina el repo y no es documentación de producto.

## Límites y riesgos

- Es el repo con peor relación señal/ruido de la cuenta: entrada vacía, volcado enorme y estado indeterminado.
- Riesgo de privacidad explícito por parte del propio repo: currículo y contenido no deben enviarse a terceros sin control.
- Sin licencia: impide reutilización clara del currículo.

## Migración a Agntia Code

1. Antes de importar: mover el volcado de 1,26 MB fuera de `main` (o a un archivo comprimido) y escribir un README real.
2. Alta como proyecto "IA Dev / Knowledge" con comando `pip install -e '.[dev]'` y `pytest`.
3. Superficies: Academia (currículo), Datos (SQLite/FTS5), Observabilidad (API local), Bitácora.
4. No clasificar hasta que exista una ejecución de tests fechada y un README con estado.
