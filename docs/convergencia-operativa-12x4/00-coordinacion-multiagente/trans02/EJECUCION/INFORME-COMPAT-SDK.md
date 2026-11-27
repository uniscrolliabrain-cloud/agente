# Compatibilidad con el streaming real de CopilotKit

Código `9e132ebb`. Con cliente OpenAI-chat (incluido OpenRouter), BuiltInAgent emite TEXT_MESSAGE_CHUNK. El filtro anterior solo aceptaba START/CONTENT/END, perdiendo la respuesta real. PublicTextStream expande chunks a ese contrato mínimo, valida identidad de mensaje/rol/delta antes de cambiar estado y descarta metadata, reasoning, tools y eventos privados. El agregado de texto usa exactamente el contenido público emitido. Stream vacío rechaza PROVIDER_EMPTY_RESPONSE, sin éxito/ACK inventados.

Suite 5/5 PASS, cero SKIP: SDK real con SSE simulado, texto visible y stream vacío, campos privados/no-texto, rol/delta inválidos, runtime/recibos existentes y revocación durante Fast. Typecheck raíz exit 0. Logs /tmp/trans02-provider-chunks-{final,complete-tsc}.log. No prueba de red/proveedor real; no nuevos permisos ni segundo runtime. Legacy atiende chunks en Trans01 3dcdfa64.
