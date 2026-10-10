# @openmuse/workspaces

Catalogo de los 34 workspaces de negocio del sistema.

## Que contiene

- 34 subcarpetas, una por workspace.
- Cada workspace tiene su propio README.md, workspace.json, docs/, src/ y tests/.
- El MANIFEST.yaml es el indice agregado del estado de los 34.

## Estructura

packages/workspaces/
  01-gmail/
    README.md
    workspace.json
    docs/
    src/
    tests/
  02-whatsapp/
    ...
  34-trello/
    ...
  MANIFEST.yaml
  README.md

## Estado

Todos los workspaces estan en scaffold. Se rellenaran cuando lleguen los mockups correspondientes.

## Reglas

1. Cada workspace tiene un propietario unico por operacion.
2. Ningun workspace importa implementaciones internas de otro.
3. Los eventos pasan por el bus existente.
4. Las vistas se resuelven por el resolver existente.
5. Nada se sobrescribe sin revision.

## Como trabajar en un workspace

1. Leer su README.md.
2. Leer sus docs/01-vision.md a docs/10-open-questions.md.
3. Leer el MANIFEST.yaml para saber su estado.
4. Aplicar cambios solo dentro de su carpeta.
5. Actualizar su estado en el MANIFEST.yaml al cerrar.