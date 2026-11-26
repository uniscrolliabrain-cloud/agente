# Trans02 · Fast puede recibir contexto anterior al cursor declarado

El contexto preparado debe indicar qué estado de la proyección observó Fast. El selector lee los candidatos y, más tarde, consulta el cursor que guarda junto al snapshot.

**Evidencia.** Al publicar una segunda card entre ambas lecturas, la caché devolvió solo la primera con watermark 2. Una lectura en frío, también con watermark 2, devolvió ambas. En un ensayo independiente, ampliar el presupuesto de 64 a 4000 bytes devolvió cero referencias en caliente y dos en frío. Ambos resultados se reprodujeron en PGlite y PostgreSQL.

**Impacto.** Fast puede omitir información ya disponible mientras el cursor aparenta estar al día. La corrección de una referencia ya seleccionada sí invalidó el snapshot. Además, el wiring canónico aún permite a Fast proponer solicitudes tipadas, mientras el README general asigna la propuesta a Slow. Esa segunda discrepancia es documental.

[Código examinado](https://github.com/uniscrolliabrain-cloud/agente/blob/45e93a13186d7bba1b1109c559467f898fe56e2f/apps/server/src/engine/cognition/v2/context.ts#L68) · [Evidencia del ensayo](https://github.com/uniscrolliabrain-cloud/agente/blob/45e93a13186d7bba1b1109c559467f898fe56e2f/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/trans02/ASTRA-AUDIT-V1/EXPERIMENTO-CURSOR-Y-PRESUPUESTO.md) · [README general](https://github.com/uniscrolliabrain-cloud/agente/blob/19e78b055948796865d2af815e7219eae78d646e/README.md) · [Wiring canónico](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/WIRING-INTELIGENCIA-DISTRIBUIDA.md)
