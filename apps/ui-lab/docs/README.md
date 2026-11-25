# UI Lab — documentación

Ubicación canónica de la documentación de UI Lab y de la simulación empresarial de AgntiaPro. Aquí
solo hay documentación: **el código vive en [`apps/ui-lab/src/`](../src/) y no se copia nunca a
este árbol**. Esta carpeta está versionada en `main` junto al laboratorio.

## Por dónde empezar

| Quiero… | Ir a |
|---|---|
| Ver componentes y workspaces reales, sin backend | https://uniscrolliabrain-cloud.github.io/agente/ (GitHub Pages, datos sintéticos) |
| Leer o tocar el código | [`apps/ui-lab/src/`](../src/) y [`apps/ui-lab/README.md`](../README.md) |
| Saber cómo se publica | [`apps/ui-lab/README.md`](../README.md#publicación-pages-primero-vercel-aparte) |
| Revisar una superficie concreta (landing, login, chat, apps…) | [`dashboards/`](./dashboards/README.md) |
| Entender las campañas y la simulación de empresa | [`agntia-demo/`](./agntia-demo/README.md) |
| Operar el laboratorio (builds, clone, entrega) | [`AGENT-DEMO-WORKFLOW.md`](./AGENT-DEMO-WORKFLOW.md) · [`FULL-APP-CLONE.md`](./FULL-APP-CLONE.md) · [`IMPLEMENTATION.md`](./IMPLEMENTATION.md) · [`AUTO-PREVIEW.md`](./AUTO-PREVIEW.md) |

## Mapa del directorio

```
docs/
├─ dashboards/      20 superficies en el orden aprobado por el founder (01-landing … 20-formacion)
│                   + agntia-demo/ kickoffs, visión, plantillas y datos sintéticos
│                   + las cuatro guías de operación de esta carpeta
```

Cada carpeta de `dashboards/` contiene su `README.md` con el estado de esa superficie, los prompts
maestros, las campañas ejecutadas, los handoffs, el QA y sus capturas. `dashboards/README.md` es el
índice de los veinte.

## Reglas

- **Una sola fuente de verdad por cosa**: el código en `src/`, la guía de marca en
  [`dashboards/19-general/galeria-branding/GUIA-MAESTRA-BRANDING-UX-V2.md`](./dashboards/19-general/galeria-branding/GUIA-MAESTRA-BRANDING-UX-V2.md)
  y el índice de superficies en [`dashboards/README.md`](./dashboards/README.md). No se duplican.
- Los documentos originales del founder y del CEO se conservan íntegros, sin reescritura.
- `legacy/` dentro de cada superficie es archivo histórico: se lee, no se actualiza.
- Los planes, datasets sintéticos y capturas se distinguen del código implementado y de datos reales.
- No mezclar campañas documentales con despliegues, cambios de kernel ni migraciones de producción.
- Nada de binarios generados en el repo: los paquetes de entrega se descargan del run de Actions que
  los produjo.

## Consolidación del 25/11/2026

El árbol arrastraba copias que se habían separado de su fuente. Se consolidó sin perder contenido
( todo sigue en el historial de git):

- **5 clones `componentes-finales/`** (login, chat UX V2, chat transversal V3, centro de mando
  editorial, launcher V3): eran byte a byte idénticos a `apps/ui-lab/src/` —verificado con `diff -r`
  antes de retirarlos—. Se quedan las tablas de responsabilidades en los handoffs y el código en su
  módulo.
- **21 copias de `GUIA-MAESTRA-BRANDING-UX-V2.md`** reducidas a una, la de `galeria-branding`, con
  los enlaces de login, legal, chat y launcher reapuntados.
- **2 ZIP de entrega** (11,4 MB) fuera del repo; `LEEME.md` y `SHA256SUMS.txt` se conservan como
  registro y el paquete se descarga del run 336.
- `dashboards/README.md` conserva el orden aprobado; la clasificación por estado de cada superficie
  es la del founder y no se reescribe.
