# Seis taxonomías transversales

Se aplican a los 18 dominios de la plantilla. No son una quinta capa: proporcionan vocabulario compartido y consistencia entre vistas.

## T1. Identidad y pertenencia
- ID canónico y tipo de entidad
- Tenant, empresa y workspace
- Propietario, autor, responsable
- Entidad relacionada

## T2. Relaciones semánticas
- Pertenece a
- Ejecuta
- Solicita
- Produce
- Depende de
- Supervisa
- Aprueba
- Referencia
- Atributos de cada relación: origen, destino, dirección, contexto y vigencia

## T3. Temporalidad
- Creación y actualización
- Vencimiento y duración
- Historial y secuencia
- Recurrencia
- Tiempo lógico de simulación frente a fecha real de edición

## T4. Estados y ciclos de vida
- Borrador, pendiente, activo, bloqueado, completado, cancelado, archivado
- Estados específicos por dominio cuando sean necesarios
- Transiciones permitidas, desencadenantes y responsables

## T5. Autoridad y procedencia
- Quién puede leer, proponer, modificar, ejecutar y aprobar
- Fuente y evidencia asociada a cada dato
- Autoría humana o agéntica
- Aprobación ficticia versus aprobación real
- Límites de autonomía y acceso

## T6. Estado de simulación
- Dato ficticio
- Evento simulado
- Resultado esperado
- Error deliberado
- Escenario de prueba
- Resultado observado en UI
- Marcador inequívoco de **no operativo / demo**

## Esquema lógico orientativo, no contrato de backend

`tenant_id → owner_id → empresa_id → entidad_id → relaciones → procesos → eventos → vistas`

Los enlaces son relaciones lógicas y **no** obligan a crear esas tablas, APIs o runtimes. Los IDs deben ser estables y reutilizados en las distintas fixtures; no duplicar identidades con nombres distintos.
