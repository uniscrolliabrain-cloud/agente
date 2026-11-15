# Dependencias y orden

C00 → C01 → C02 → C03 → C04.
C03+C04 → C06; C05 separado y bloqueado por ontología.
C02+C03+C04 → C07 → C08 (proveedor opcional).
C02+C07 → C09; C04+C06+C09 → C10 → C11 → C12 → C13.
C01+C02+C10+C12 → C14; C00–C14 → C15.

Capas: domain schemas no importan servidor; engine cognition implementa proyecciones no autoridad; kernel/policy/SOP conserva ejecución. Fast no usa cola Slow ni clasificador externo. Cada persistencia V2 debe tener tenant explícito, transacción real y política en lectura.
