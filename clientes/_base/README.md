# Catalogo canonico de agentes

Este directorio contiene el **catalogo base** de los 16 personajes que puede tener un cliente.
Los `clientes/<nombre>/agentes.json` se copian de aqui y se ajustan.

## Estructura de cada rol

- `id`: identificador estable. No cambia entre clientes.
- `name`: nombre del personaje (Alex, Leo, Sofia...). Lo que ve el dueno.
- `tone`: `warm` | `concise` | `thoughtful`. Como habla.
- `avatar`: `sky` | `sand` | `lilac`. Color del avatar en la UI.
- `greeting`: primer mensaje al abrir el chat con este rol.
- `roi`: que le ahorra al dueno. Gancho de venta.
- `objetivo`: descripcion del personaje en una frase.
- `sops`: SOPs que este rol puede ejecutar.
- `active`: si el cliente lo tiene contratado o no.
- `memories`: las 4 memorias vivas del rol.

## Las 4 memorias

Cada rol tiene **4 memorias**, semanticamente distintas:

- `identidad`: como habla, como se dirige al dueno, que evita.
- `dominio`: hechos tecnicos de su oficio (plazos, formatos, reglas).
- `preferencias`: como le gusta al dueno que trabaje.
- `historial`: aprendizajes de ejecuciones previas. Empieza vacio, lo llena `LearningService`.

## Como se usa

1. Al provisionar un cliente, `scripts/provision-client.ts` lee `clientes/<nombre>/agentes.json`.
2. Los roles se guardan en `records` con `kind = "agent-roles"`.
3. Las 4 memorias de cada rol se materializan como `AgentMemory` con `roleId` y se guardan en `kind = "memories"`.
4. Cuando un usuario habla con un rol, `ConversationAgent` lee el rol, inyecta `tone` y las 4 memorias en el prompt.

## Para el repo de redes

El endpoint `GET /api/agent/roles/public` expone solo el canon publico del personaje:
`id`, `name`, `tone`, `avatar`, `objetivo`, `roi`, `identidad`.
El repo de redes lee de ahi y nunca inventa un personaje distinto.
