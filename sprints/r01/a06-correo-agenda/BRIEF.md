# A06 · Correo y agenda

**Carril:** C6 · **Rama:** `sprint/r01-a06-correo-agenda` · **Superficie:** `sprints/r01/a06-correo-agenda/`

## Estado medido sobre `0c8fe81`

- `apps/server/src/google-auth.ts` pide scopes de **lectura y escritura**: `gmail.readonly` + `gmail.send` + `gmail.modify` + `calendar` + `calendar.events`. El comentario de la línea 131 explica que los de escritura se añaden solo si ya estaban concedidos — compruébalo tú, es la diferencia entre "pedimos permiso para enviar" y "podemos enviar".
- La cabecera de `clientes/agntia/sops.ts` declara la regla: *"Todo lo que manda algo a un tercero termina en `prepare_email` o `prepare_event`: son propuestas que requieren aprobación, nunca envíos automáticos."*
- No existe endpoint de envío de correo ni de creación de evento: el envío no está cableado, y eso aquí es una **decisión de producto**, no un olvido.

## La pregunta que decide el carril

¿Se puede demostrar con un test que **no** se envía nada sin aprobación? Una regla escrita en un comentario no es una garantía; un test que la rompe, sí.

## Preguntas

1. ¿`prepare_email` / `prepare_event` están registrados como herramientas? ¿Con qué nombre exacto y en qué fichero?
2. ¿Qué produce la herramienta: fila en store, propuesta en el hilo, ambas?
3. ¿Existe un camino (SOP, capability, tool) que llame a `gmail.send` o `calendar.events.insert` sin aprobación? Búscalo, no lo asumas.
4. Si el usuario aprueba dos veces la misma propuesta, ¿salen dos correos o dos eventos?
5. Los scopes de escritura: ¿se piden siempre o solo con `include_granted_scopes`?

## Entregable del sprint

`sprints/r01/a06-correo-agenda/aprobacion.test.ts` que pruebe la cadena completa con dobles: propuesta → sin aprobación **0** envíos → aprobación → **1** envío → segunda aprobación → sigue **1**. Y `ENVIO.md` con el mapa de quién puede llamar a qué.

## Gate

```bash
node --import tsx --test --test-timeout=30000 sprints/r01/a06-correo-agenda/*.test.ts
node --import tsx tests/google.test.ts
node --import tsx tests/sop-contract.test.ts
```

## Trampa

Confundir "no hay endpoint" con "no se puede enviar". Un SOP con `allowedTools` mal declarado o un `llm_generate` que produce JSON con instrucciones de envío es un camino igual de real. Documenta el que encuentres.
