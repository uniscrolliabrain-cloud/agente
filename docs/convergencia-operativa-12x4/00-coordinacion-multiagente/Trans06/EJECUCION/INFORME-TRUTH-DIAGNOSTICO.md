# Trans06 — incoherencias de ranking empresarial reproducidas

En el método real TruthResolver.resolve, blob `f2744f767f1dde82e6d348d9c2c6a1138823fd56`, tres experimentos sintéticos confirman: (1) una observación de 2099 con reliability 0.01 gana a una actual con 0.9 porque freshness puede exceder 1; (2) un candidato de otro field puede devolver su valor etiquetado como el field solicitado; (3) fecha inválida produce score NaN y puede ganar por orden de entrada. Ver EVIDENCIA-TRUTH-DIAGNOSTICO.json.

La fecha futura ya estaba señalada en el diseño P4; aquí se aporta reproducción, no se cuenta como hallazgo nuevo. La fecha inválida no cumple truthCandidateSchema: su exposición depende de validación de entrada en cada caller. No se acredita explotación HTTP ni modificación de negocio. Caller directo encontrado BusinessTruth.resolveField; hace falta revisar sus entradas y persistencia. Ranking no es evidencia ni autoriza verified_fact o efectos.

Sin cambios funcionales en este incremento. TruthResolver pertenece a Trans01: pendiente validación coherente de field/forma/fecha, reloj acotado y regresiones allí. No se cambian pesos, ontología ni se crea otro motor. Se conserva todo lo anterior.
