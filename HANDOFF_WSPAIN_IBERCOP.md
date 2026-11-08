# Handoff: Ibercop / wspain

## Objetivo autorizado

Crear un worktree y una rama propios desde main e implementar un nuevo tenant con un vertical slice independiente en uniscrolliabrain-cloud/agente. El usuario pide este documento directamente en main. La implementación debe ir en su propia rama; no se ha solicitado desplegar ni fusionarla.

## Requisitos del usuario

- Tenant inicialmente llamado **ibercop**.
- Empresa/marca posteriormente indicada: **wspain**.
- Curso de inteligencia artificial y negocios para jóvenes y founders.
- Tribus cooperativas: comunidades de **150 founders**.
- Token de Solana llamado **PZT**.
- Comunidad Discord con bots e integraciones.
- Acceso exclusivo para personas con **pasaporte español**.
- Logo inspirado en la bandera española.

No se confirmó si wspain sustituye a ibercop o es su marca comercial. Propuesta reversible: identificador ibercop, marca wspain.

## Estado real

- Integración GitHub verificada con la cuenta uniscrolliabrain-cloud.
- Repo público localizado: https://github.com/uniscrolliabrain-cloud/agente ; rama por defecto main.
- El clon inicial falló por conexión al proxy del entorno, puerto 8080.
- Reintentos pendientes de autorización terminaron cancelados.
- **No hay clon, rama, worktree, implementación, migraciones ni pruebas realizados por este agente.**
- La arquitectura del proyecto no se ha inspeccionado: no asumir framework, rutas ni modelos.
- Consultar AGENTS.md aplicables al obtener el checkout. La consulta del archivo en la raíz de main devolvió 404.
- Se generó una propuesta de logo; no se incorporó al repo.
- Una escritura anterior de este handoff fue interrumpida. Una consulta posterior confirmó que el documento aún no existía.

## Logo

Propuesta raster con fondo transparente: w con tres figuras humanas, rojo y amarillo y texto wspain en minúsculas.

Archivo del entorno original:
`/workspace/generated_images/exec-cd8140ed-7a86-4570-bd8d-580d367840b0.png`

Comprobar disponibilidad: otro entorno puede no conservarlo. No está versionado, no es SVG y no se ha aprobado como identidad final. Incorporarlo o preparar activos adecuados cuando esté disponible.

## Próximos pasos

1. Obtener el checkout. La integración GitHub de ChatGPT no implica credenciales Git en el shell. Resolver red/permisos sin pedir tokens en el chat.
2. Leer instrucciones, README, arquitectura, manifiestos y patrones existentes de tenants/slices.
3. Preservar cambios ajenos y crear rama y worktree desde main. Sugerencia: `feat/ibercop-tenant` en un directorio hermano al checkout.
4. Identificar resolución del tenant, registro de slices, permisos, persistencia y pruebas.
5. Implementar Ibercop/wspain siguiendo esos patrones, con aislamiento de datos y configuración.
6. Añadir experiencia en español, marca y documentación.
7. Ejecutar los checks relevantes y pruebas de dominio y aislamiento.
8. Entregar rama, ruta del worktree, cambios, resultados y pendientes. No fusionar ni desplegar por iniciativa propia.

## Alcance propuesto de implementación

Esta sección propone cómo concretar los requisitos; no representa decisiones adicionales confirmadas.

### Tenant y formación

Registrar el tenant y su configuración. Aislar miembros, cursos, progreso, tribus y solicitudes entre tenants. Aplicar autorización en servidor.

Preparar programa/catálogo de IA y negocios, módulos, inscripción y progreso según los patrones del repo. Identificar el contenido inicial como borrador. No inventar precios, fechas, profesores o promesas de rentabilidad.

### Tribus

Modelar tribus, membresías y roles con los permisos existentes. Interpretación inicial sugerida: máximo de 150 founders por tribu; confirmar si el usuario pretende máximo, objetivo o tamaño de cohorte. Si se adopta un límite, protegerlo en servidor ante altas concurrentes. No asumir estructura jurídica ni gobernanza cooperativa concretas.

### Admisión por pasaporte español

Representar solicitud y estados de verificación/revisión y restringir acceso hasta su aprobación. Una casilla de autodeclaración no es verificación documental. Si no hay proveedor, dejar un flujo honesto de revisión pendiente.

Faltan proceso, responsable y tratamiento de datos. No almacenar imágenes o números de pasaporte por defecto. “Jóvenes” no define edad mínima ni autoriza asumir admisión de menores.

### Solana / PZT

Datos confirmados: Solana y nombre PZT. Faltan mint, red, wallets, utilidad y tokenomics. No inventar direcciones, saldos ni token desplegado. Preparar configuración/adaptadores si el alcance lo necesita. Si se consulta un token, validar mint y red.

No emitir tokens, mover fondos ni desplegar contratos sin instrucción explícita. Documentar integraciones desactivadas o pendientes.

### Discord y bots

Faltan servidor/guild ID, credenciales, permisos y funciones específicas. Evaluar invitación tras verificación, roles por tribu, bienvenida y avisos de cursos como propuestas.

Usar configuración por tenant y secretos fuera del código. Validar eventos/comandos e implementar idempotencia en altas y roles. Probar con dobles y mantener desactivada la integración sin configuración real; no simular que está activa.

## Decisiones pendientes

- Relación entre Ibercop y wspain.
- Contenido, modalidad, precios y alcance inicial del curso.
- Edad mínima.
- Significado exacto de 150 founders por tribu.
- Proceso de verificación de pasaporte y datos necesarios.
- Existencia del token, mint, red y utilidad de PZT.
- Servidor y comportamiento de bots Discord.
- Dominios/rutas y roles administrativos.

Avanzar con análisis, aislamiento y componentes independientes de estas respuestas. Consultar solo cuando una decisión bloquee trabajo dependiente.

## Criterios de aceptación propuestos

- Rama y worktree creados y reportados.
- Tenant integrado en los mecanismos reales del proyecto y slice independiente.
- Datos y permisos aislados de otros tenants, sin regresiones.
- Marca wspain y experiencia en español.
- Recorrido verificable de solicitud, elegibilidad, inscripción y membresía según el alcance implementado.
- Capacidad de tribus protegida si se adopta el máximo de 150.
- PZT/Discord con configuración clara y estado real visible.
- Pruebas de aislamiento, autorización, admisión y capacidad donde corresponda.
- Checks del proyecto ejecutados; resultados y límites documentados.
- README del slice con configuración, migraciones, uso local y pendientes externos.
- Sin despliegues, emisión de tokens ni activación de bots en producción no solicitados.

## Comunicación

El usuario reclamó avances tras esperas prolongadas de autorización. Comunicar bloqueos pronto; no confundir una solicitud pendiente con trabajo ejecutado. Informar con precisión qué está hecho y qué sigue pendiente.
