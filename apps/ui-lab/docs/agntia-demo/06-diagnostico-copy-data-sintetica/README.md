# Propuesta de datos sintéticos — revisión antes de aplicar

**Solo documentación en `main`.** No se han generado fixtures ejecutables, no se ha cambiado código, no se ha accedido a DB ni se han realizado migraciones.

## Documentos de revisión (orden)
1. [00 — Diagnóstico: datos antiguos frente a AgntiaPro](./00-DIAGNOSTICO-COPY-ANTIGUO-VS-NUEVO.md): inventario de fuentes reales y divergencias.
2. [01 — Copy y registros nuevos propuestos](./01-COPY-Y-REGISTROS-NUEVOS-PROPUESTOS.md): identidades, ocho empresas ficticias, ejemplos enlazados, copy por pantalla y metas.
3. [02 — Simulación de integración y gates](./02-SIMULACION-PASOS-INTEGRACION-Y-GATES.md): rutas propuestas, secuencia técnica, controles, rollback y decisiones.

## Prioridad de fuentes
[CEO operativo](../01-kick-off/RESPUESTA-CEO-OPERATIVO-VERBATIM.md) → [founder](../02-vision-founder/RESPUESTA-FOUNDER-VERBATIM.md) → [instrucciones literales](../03-instrucciones-founder-raw/) → [plantillas](../04-plantilla-derivada/) → propuesta de dataset. En conflictos prevalece la voz del founder; la landing existente mantiene el mensaje comercial.

## Alcance de esta revisión
Se ha leído código de fixtures, router, Studio, UI Lab y seed ACME, junto con fuentes del negocio. **No** se ha ejecutado una auditoría runtime exhaustiva ni inspeccionado la DB. La matriz completa de todos los consumidores es el primer gate de implementación.

## Puntos no cerrados
Horizonte seis meses vs 90 días; cartera de ocho vs ocho contratos facturables; nombres ficticios; colaboradores humanos; fase 2 sin definición; alcance preciso de alpha; autorización de staging. Ninguno se impone como decisión aprobada.
