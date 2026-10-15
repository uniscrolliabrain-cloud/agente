# Workspaces · SOP, Skills, Pipelines y Boilerplate

Este documento explica como nace un workspace en el frontend, que piezas lo
componen, y cual es el proceso exacto (SOP) para crearlo desde cero.

Ubicacion: `apps/web/docs/workspace-blueprint.md`.

---

## 1. Vision general

Un workspace es una unidad funcional autocontenida dentro del frontend.
Cada workspace agrupa UI, datos, tipos y documentacion de un area concreta.
Se registra en un indice global y puede montarse de forma aislada o embeberse
en el shell de la app.

Piezas clave:

- SOP — proceso paso a paso para crear y cerrar un workspace.
- Skills — capacidades reutilizables (componentes, hooks, patrones de datos).
- Pipelines — el flujo de construccion desde el mockup hasta el registro.
- Boilerplate — la estructura minima obligatoria de un workspace.

---

## 2. Anatomia de un workspace

Estructura obligatoria (patron seguido por 02-whatsapp, 14-zendesk,
35-centro-mando):

    apps/web/src/workspaces/NN-nombre/
    ├── README.md              # descripcion, props, acciones, estado
    ├── index.ts               # export { default } from './<Componente>'
    ├── <Componente>.tsx       # raiz del workspace (PascalCase)
    ├── <componente>.css       # estilos scoped bajo una clase raiz
    ├── types.ts               # tipos de dominio del workspace
    ├── data.ts                # mocks y constantes de datos
    └── docs/
        ├── 01-ui-map.md       # mapa de bloques y clases CSS
        ├── 02-roadmap.md      # fases y pendientes
        └── 03-spec.md         # contrato de props, datos, acciones, a11y

Reglas de nomenclatura:

- Carpeta: NN-nombre con prefijo numerico de dos digitos.
- Componente raiz: PascalCase.tsx (p. ej. CentroMando.tsx).
- CSS: nombre.css scoped bajo una clase raiz (p. ej. .cm-root).
- Tipos: types.ts (no se reparte en varios archivos salvo necesidad real).
- Datos mock: data.ts.
- Exports publicos: solo desde index.ts.