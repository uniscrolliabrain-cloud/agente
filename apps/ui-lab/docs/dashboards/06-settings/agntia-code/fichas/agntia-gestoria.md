# Ficha · agntia-gestoria

| Campo | Valor |
|---|---|
| Repo | `uniscrolliabrain-cloud/agntia-gestoria` |
| Visibilidad | Público |
| Proyecto | Gestoría |
| Superficies Agntia Code | Despliegues (local), Datos, Bitácora |
| Estado | PRODUCT_LOCAL |
| Verificado contra | `main@ea8e1b536b66ae501ddb1ce3f3be41a4f184f503`, 2026-11-26 |
| Lenguaje | Python 3.11+ (FastAPI) + cliente TypeScript |
| Tamaño | 933 KB |
| Licencia | MIT |
| Issues abiertas | 1 |

## Propósito

Aplicación de gestoría para despachos pequeños: renta anual, IVA, pagos de IRPF, retenciones, sociedades, laboral, representación y conservación de datos, con aprobación humana e importaciones no verificadas marcadas como tales.

## Qué declara que funciona hoy

- Producto local ejecutable: `pip install .` y `agntia-gestoria`, servidor en `http://127.0.0.1:8010`.
- SQLite y documentos en `GESTORIA_DATA_DIR`; sesiones de navegador opacas, caducan a las 8 horas y se revocan al cerrar sesión.
- Implementación opt-in de conexiones, importaciones no verificadas, evidencias, conflictos, contactos y facturas borrador con aprobación humana.
- Cliente TypeScript publicable (`pnpm add ./ruta/Agntia-gestoria/typescript`) y adaptador Odoo documentado como handoff.
- Tests con `python -m unittest discover -s tests -v` (recuento no declarado en el README).

## Qué no está verificado

- No hay despliegue en nube ni instancia de cliente; el README habla de uso local o servidor propio.
- Conectores y motores pendientes según `docs/product-scope.md`.
- No se ha ejecutado la suite en esta auditoría.

## Stack y ejecución (manifiesto real)

- `python -m venv .venv`, `pip install .` (o `pip install -e '.[dev]'`), `agntia-gestoria`.
- Windows: `.venv\Scripts\activate`; Linux: `source .venv/bin/activate`.
- Variables de entorno (solo nombres): `GESTORIA_DATA_DIR`, `GESTORIA_OWNER_TOKEN`, `GESTORIA_ACTORS_JSON`, `GESTORIA_MAX_UPLOAD_MB`, `GESTORIA_ALLOW_LOCAL_OWNER`, `GESTORIA_PUBLIC_ORIGIN`.

## Datos e integraciones

SQLite + documentos locales; copias de seguridad responsabilidad del operador. Odoo como integración opt-in. Dependencias: FastAPI, Uvicorn, reportlab, python-pptx, httpx, cryptography.

## Calidad

- Producto real y acotado, con tests y una issue abierta.
- Documentación de alcance que separa lo implementado de los motores pendientes.
- Licencia MIT, lo que facilita reutilización.

## Límites y riesgos

- **Datos fiscales reales**: `GESTORIA_DATA_DIR` contiene información sensible; nunca debe incluirse en el repo ni en una demo pública.
- `GESTORIA_OWNER_TOKEN` debe ser aleatorio de 16+ caracteres; para demo local existe `GESTORIA_ALLOW_LOCAL_OWNER=true`, que no debe usarse en producción.
- Sin HTTPS propio: exige proxy y `GESTORIA_PUBLIC_ORIGIN` correcto.
- Es un producto mono-despacho, no multitenant; no prometer multiempresa.

## Migración a Agntia Code

1. Alta como proyecto "Gestoría" con instalación `pip install .` y comando `agntia-gestoria`.
2. Superficies: Despliegues solo local (o servidor propio con HTTPS), Datos (SQLite) y Bitácora.
3. Entornos: las seis variables, con `GESTORIA_ALLOW_LOCAL_OWNER` desactivada fuera de demo.
4. Añadir copias de seguridad como requisito operativo visible en la ficha.
