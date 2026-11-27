# Trans02 — correspondencia del registro de ontología

Código `346440b2`. Se reproducían dos fallos: devolver una definición aprobada almacenada bajo otro nombre/versión solicitado, y consultar la autoridad con una fila que no cumplía el contrato. `runtime` ahora parsea el contrato estricto y exige coincidencia entre clave persistida, identidad y versión antes de verificar el mismo recibo existente. No cambia aprobación, vocabulario ni ejes.

Regresiones 2/2 FAIL antes; suite focalizada 5/5 PASS después, cero SKIP, incluidas aprobación revocable y producción Slow sin falsa certeza. Typecheck raíz exit 0. Ejecución en worktree previa al commit; logs `/tmp/trans02-ontology-registry-{red,green,tsc}.log`. No acredita calidad semántica ni cierra la campaña.
