# 00 - Coherencia del repo y disciplina de fixes

> v1 - 2026-10-04 - Estado: audited-deep
> Fuente: leer el repo como un todo, no modulo a modulo.

## Ontologia

Marcas de idempotencia, contratos Zod, adapters, constantes declaradas, archivos huerfanos, codigo muerto, dependencias entre bloques, docs vs realidad.

## Estado real

Cada miniaudit 01-25 declara 3-6 huecos. La auditoria profunda encuentra 3-5x mas. Los miniaudits estan reescritos con 20 huecos profundos cada uno. La coherencia horizontal (entre bloques) no esta auditada.

## Evidencia

- Bloques 01-09: aplicados y verificados.
- Fixes con anclas que no encontraban el punto: detectados en 04-13, 05-10/11/12, 06-09/10.
- Marcas repetidas: ENGINE_TENANT_V1 x4, KERNEL_NONFATAL_V1 x8.
- Constantes declaradas y no usadas: MAX_CHILD_DEPTH, TenantConfig.fastIdleMs.
- Adapters huerfanos: DatabaseTenantResolver, DatabaseTenantConfigResolver.

## Huecos declarados

- Sin protocolo de fixes.
- Sin policy de que no tocar.
- Sin auditoria de coherencia horizontal.
- Sin verificacion de marcas.
- Sin verificacion de huerfanos.

## Huecos profundos (auditoria extendida)

1. Marcas repetidas en el mismo archivo.
2. Marcas huerfanas.
3. Contratos Zod declarados sin aplicar.
4. Constantes declaradas y no usadas.
5. Adapters construidos y no inyectados.
6. Codigo cromos sin uso.
7. Funciones exportadas sin consumidor.
8. Rutas sin cliente.
9. Config declarada sin lectura.
10. Timeouts hardcodeados.
11. console.log directo.
12. catch {} vacios.
13. TODO sin issue-link.
14. Docs sin cabecera.
15. Fix sin test.
16. Bloque sin verificacion 15/15.
17. Rama sin merge tras 30 dias.
18. package.json sin script de coherencia.
19. Sin informe de coherencia.
20. Sin umbral de aceptable.

## Interrelacion

Transversal a los 25 bloques. Depende de todos. Todos dependen de este.

## Riesgos

El repo se desalinea bloque a bloque. Los docs mienten. Los huerfanos crecen.

## Tipo de fixes

Protocolo de fixes. Policy del repo. Auditoria de coherencia horizontal.
