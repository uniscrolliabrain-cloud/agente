# Instrucciones operativas para agentes — UI Lab

> Documento complementario. No sustituye la guía de branding, el inventario de interfaces, las especificaciones UX ni la documentación técnica existente.

## Alcance del encargo

El trabajo principal del agente es **crear, mejorar o modificar la interfaz UX/UI solicitada** respetando el branding vigente de AgntiaPro y las instrucciones concretas del encargo. No convertir esta política de demo en el eje de la propuesta de diseño ni limitar la exploración visual por la situación actual del backend.

## Datos y comportamiento demo

- Utilizar **`agntia-demo`** como nombre del tenant/empresa ficticia de referencia, en lugar de ACME, para nuevas interfaces y fixtures.
- Usar datos inventados, coherentes entre vistas, de personas, agentes, clientes, proyectos, documentos, operaciones, conversaciones y eventos según corresponda.
- Los flujos e interacciones pueden simularse localmente. No presentar como operativa real una acción simulada.
- **No es necesario conectar el backend, proveedores externos ni datos de producción** para completar un encargo UX/UI.
- No modificar producción, introducir secretos ni activar acciones reales como efecto colateral del trabajo de laboratorio.

## Secuencia obligatoria: crear primero, auditar después

**Fase 1 — Creación UX/UI libre:** diseñar, construir, iterar y cerrar la experiencia visual y las interacciones demo con datos ficticios de `agntia-demo`. **No auditar previamente el backend ni consultar su arquitectura como condicionante del diseño.** El resultado imaginado por el fundador y el branding mandan en esta fase.

**Fase 2 — Auditoría ligera posterior:** **solo después de haber terminado la propuesta UX/UI demo**, revisar brevemente las superficies relevantes del código vivo de AgntiaPro: componentes, rutas, contratos, runtime, eventos, SOPs y herramientas existentes que podrían servir para conectarla en el futuro. La auditoría no debe retroactivamente recortar ni rediseñar la interfaz para adaptarla a las limitaciones actuales. No emprender una auditoría transversal profunda ni implementar infraestructura adicional salvo instrucción expresa.

**Fase 3 — Reporte de integración futura:** documentar los hallazgos y proponer el posible encaje técnico, sin ejecutar la integración.

## Reporte de entrega

Dejar un reporte asociado a la interfaz o cambio realizado con:

1. Qué se creó o modificó y dónde; capturas o enlace de preview si existen.
2. Qué funciona en demo y qué es simulado, con los fixtures de `agntia-demo` utilizados.
3. Resultado de la auditoría ligera **realizada después de cerrar la demo**: archivos y contratos existentes examinados, diferenciando hechos observados de hipótesis.
4. **Propuesta de integración futura**, sin ejecutarla: componentes reutilizables, datos y contratos requeridos, endpoints/adaptadores, pequeños runtimes, eventos y trazabilidad, conexiones con chat conversacional/slow-LLM y SOPs cuando proceda.
5. Riesgos, dependencias, puntos aún desconocidos y pruebas efectuadas.

**Criterio de cierre:** el resultado UX/UI en demo puede considerarse terminado aunque la integración productiva quede pendiente. Auditar ligeramente y proponer la conexión es obligatorio; implementarla no lo es.
