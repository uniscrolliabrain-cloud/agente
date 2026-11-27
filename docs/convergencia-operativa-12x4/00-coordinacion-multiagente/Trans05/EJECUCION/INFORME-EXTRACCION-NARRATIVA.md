# Trans05 — validación pura de extracción narrativa

Código `48e9a8bc`, alcance P10.2/P10.3. El borrador se valida frente al manifiesto y referencias que entrega un adaptador autorizado: tenant/sección/roles/idioma, permiso de extracción, revisión exacta, SHA-256 UTF8 de la fuente, segmento original y citas con offsets UTF16 válidos. Comparte digest con el segmentador existente, sin normalizar ni inventar páginas o timestamps.

Rechaza fuente alterada incluso con digest de segmento recalculado, referencias/hechos/recibos no anclados, publicación o autoridad añadida por el modelo, origen incorrecto de briefing, caducidad y exceso del presupuesto JSON completo. No recorta cláusulas. Fuente y segmentos tienen límites; memoria auxiliar constante para validar Unicode. Coste por validación lineal en la fuente recibida, no evidencia de escalabilidad del pipeline completo.

Salida exclusivamente draft con procedencia; las condiciones de recibo son datos, no se evalúan ni afirman efectos. No prueba verdad de una paráfrasis, significado legal del permiso ni frescura de ACL: el adaptador debe resolverlos y revalidarlos antes de uso. No nuevo provider, storage, publicación, serving, revisión automática ni activación de extracción desde Fast.

Validación local previa a commit: 11/11 PASS, cero SKIP (cinco nuevas y seis primitivas existentes); typecheck raíz/worker exit 0; audit de contratos sin huérfanos/allowlist. Logs `/tmp/trans05-narrative-extraction{,-tsc,-worker-tsc,-contract-audit}.log`. Módulo nuevo sin red-control anterior: no se cuenta como bug reproducido. Persistencia, variante Slow, revisión/publicación, matching, revocación y evaluación integral permanecen abiertos.
