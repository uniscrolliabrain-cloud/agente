# Agntia Code — documentación UX y de producto

Tercer clon del demo: plataforma de IA coding, vibe coding y bitácora de proyectos conectada a GitHub, Vercel y Cloudflare. Se abre desde Ajustes en UI Lab mediante `codeArea`.

Estado: **propuesta de producto**. El clon de [CodeApp.tsx](../../../../src/code-v1/CodeApp.tsx) es andamiaje de interfaz con datos locales; no hay backend, ni llamadas a GitHub/Vercel/Cloudflare, ni ejecución real de código. Todo lo que sigue describe lo que cada superficie **debería** poder hacer y cómo debería comportarse cuando se conecte, no funcionalidad acreditada.

## Las 18 superficies

| ID real | Nombre visible | Grupo | Composición demo | Carpeta |
|---|---|---|---|---|
| estudio | Estudio de código | Construir | home + prompt | [00-estudio](./00-estudio/README.md) |
| proyectos | Proyectos | Construir | cards | [01-proyectos](./01-proyectos/README.md) |
| chats | Chats de construcción | Construir | lista + composer | [02-chats](./02-chats/README.md) |
| agente | Agente de código | Construir | panel de control | [03-agente](./03-agente/README.md) |
| editor | Editor | Construir | árbol + código | [04-editor](./04-editor/README.md) |
| terminal | Terminal | Construir | consola | [05-terminal](./05-terminal/README.md) |
| repositorios | Repositorios | Integrar | cards + tabla | [06-repositorios](./06-repositorios/README.md) |
| ramas | Ramas y Pull Requests | Integrar | tabla + flujo | [07-ramas](./07-ramas/README.md) |
| revisiones | Revisiones | Integrar | diff + checklist | [08-revisiones](./08-revisiones/README.md) |
| despliegues | Despliegues | Publicar | pipeline + historial | [09-despliegues](./09-despliegues/README.md) |
| infraestructura | Infraestructura | Publicar | canvas de recursos | [10-infraestructura](./10-infraestructura/README.md) |
| dominios | Dominios y DNS | Publicar | tabla + registros | [11-dominios](./11-dominios/README.md) |
| datos | Datos | Publicar | SQL + tablas | [12-datos](./12-datos/README.md) |
| entornos | Entornos y secretos | Publicar | matriz + bóveda | [13-entornos](./13-entornos/README.md) |
| pruebas | Pruebas y calidad | Aprender | cobertura + ejecuciones | [14-pruebas](./14-pruebas/README.md) |
| observabilidad | Observabilidad | Aprender | logs + métricas | [15-observabilidad](./15-observabilidad/README.md) |
| academia | Academia | Aprender | rutas + lecciones | [16-academia](./16-academia/README.md) |
| bitacora | Bitácora | Aprender | timeline + notas | [17-bitacora](./17-bitacora/README.md) |

## Contrato documental de cada carpeta

Cada carpeta contiene tres documentos:

- `README.md`: qué es la superficie, qué muestra el clon hoy y qué no está implementado.
- `CAPACIDADES-FUTURAS.md`: catálogo extenso de lo que imagino que hará, por fases, con reglas de producto y no-objetivos.
- `FUNCIONAMIENTO.md`: flujo paso a paso, entidades y campos, estados, permisos, errores, rendimiento, móvil y criterios de aceptación.

## Reglas transversales que aplican a las 18 superficies

1. **Multi-tenant.** Todo recurso pertenece a un workspace con `tenantId`; nunca se acepta un identificador de tenant enviado por el cliente.
2. **Roles.** `owner`, `builder`, `reviewer` y `viewer` (cliente). Ver y comentar no es lo mismo que proponer, y proponer no es lo mismo que publicar.
3. **La demo no publica.** Cualquier acción externa (push, deploy, DNS, secreto) muestra un aviso explícito de simulación; jamás se afirma éxito real.
4. **Idempotencia.** Las acciones con efecto externo llevan clave de idempotencia y dejan recibo consultable; el resultado ambiguo se reconcilia antes de reintentar.
5. **Trazabilidad.** Cada propuesta guarda autor, procedencia (chat, editor, agente), fecha lógica, revisión y evidencia.
6. **Secretos.** Nunca viajan al navegador ni se muestran completos; se inyectan en ejecución y se auditan sin revelar valor.
7. **Accesibilidad y móvil.** 360 px como ancho mínimo real, navegación por teclado, foco visible, contraste AA y estados vacíos/error siempre escritos.
8. **Editorial.** Voz de producto AgntiaPro, español de España, sin promesas de disponibilidad ni cifras inventadas presentadas como reales.

## Lo que este conjunto de documentos no es

No es un inventario de endpoints, ni un compromiso de calendario, ni una auditoría del clon. Los nombres de recursos y campos son orientativos y necesitan diseño técnico, contrato de API y pruebas reales antes de implementarse.
