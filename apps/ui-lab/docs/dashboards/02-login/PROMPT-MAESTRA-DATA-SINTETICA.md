# Prompt maestra · data sintética · 02-login

Estado: propuesta para revisión; no registros materializados. Leer primero [contrato común del lote](../../agntia-demo/07-proyecciones-dashboards/00-CONTRATO-GENERACION-LOTE-01.md), [dataset](../../agntia-demo/03-compilacion-y-dataset/DATASET-SINTETICO.md), [registros propuestos](../../agntia-demo/06-diagnostico-copy-data-sintetica/01-COPY-Y-REGISTROS-NUEVOS-PROPUESTOS.md) y [componentes reales](./componentes-reales/README.md).

## Mandato de producto
Quiero una simulación de acceso que permita probar la experiencia de entrada sin mezclar OAuth real, contraseñas ni permisos de producción con los datos de la empresa ficticia.
### Proyección y registros
- LoginProvider: google y github según Login.tsx; id, label, availability, actionKind, reason. La disponibilidad real se consulta al sistema; el fixture no afirma configuración efectiva.
- DemoIdentity: human-founder-demo, nombre visible Fundador de AgntiaPro, tenantId agntia-demo, businessId business-agntiapro, role owner, email propuesto founder@agntiapro.example. Nunca incluir contraseña, token, cookie o secreto real.
- DemoSessionScenario: anonymous, entering_demo, demo_authenticated, cancelled, expired, error. Distinguir sesión local de autenticación real. El adaptador actual usa interfaz/demo:interfaz; registrar incompatibilidad y no modificarlo desde UX.
- PasswordFormScenario: vacío, email inválido, credenciales rechazadas, pendiente, error genérico. Valores de prueba efímeros introducidos por test; no persistir contraseña ni registrarla en evidencias.
- RedirectScenario: destino permitido, proveedor no disponible, retorno cancelado y error. No generar URLs OAuth falsas ni ejecutar redirects desde fixture.
### Recorrido causal
Visitante de Landing → acceso → elige entorno demo → identidad ficticia owner → entrada a shell demo → salida limpia. Alternativa: OAuth real permanece separado, sin que el fixture lo intercepte fuera del laboratorio.
### Densidad
Una identidad owner, dos proveedores, seis estados de sesión y cinco estados de formulario. No inventar cuentas de otros clientes para llenar la pantalla. Si se necesita rol empleado para QA, solicitar actor al catálogo central y usar escenario separado.
### Aceptación
No hay secretos ni PII real; sesión demo no autoriza API real; errores no revelan existencia de cuentas; salir elimina únicamente estado demo; ningún cambio de tenant real. El ID canónico es el objetivo documental, no una migración ya ejecutada.

## Entrega exigida al futuro generador
Proponer schema tipado y mapeo a props existentes; manifest de registros con IDs y fuente; escenarios positivos y negativos; proyección pura con tests de referencias, determinismo y aislamiento; informe de campos no soportados. Guardar datos ejecutables únicamente en la fuente central futura apps/ui-lab/agntia-demo/, no en esta carpeta. No implementar backend, cambiar código activo ni desplegar sin autorización.


## Anexo de contraste con código real · revisión 2
Baseline 21364ef55320ffb46fdcfd65a02802d593f9285b. Lectura focalizada de snapshots y contratos activos; no certifica auditoría exhaustiva de todos los imports transitivos ni QA visual. Esta sección prevalece sobre cualquier descripción anterior incompatible.

| Componente | Contrato exacto y escenarios |
|---|---|
| Login | onLogin(email,password), onEnterDemo opcional, error nullable; busy, demoBusy, showPassword; no introducir registro o recuperación como capacidad existente |
| OAuth | enlaces /api/auth/oauth/google/start y /api/auth/oauth/github/start; separar navegación real de fixture |
| useAuth | AuthState isAuthenticated, mode sample/live/null, user nullable; booting, error; restauración via currentSession/cachedUser/me; 401 vuelve a login |
| api/auth.ts | AuthUser id,email,name,role admin/user,tenantId opcional,active opcional,setup{sopIds,allowedTools,greeting},createdAt opcional; LoginResponse token,mode,user |
| demo/tenant.ts | interfaz y token marcador demo:interfaz actuales; migración a agntia-demo pendiente |
| BrandMark | sin datos de sesión; marca estática |

Escenarios obligatorios: arranque sin sesión, sesión cacheada válida, me rechazado, 401, login credenciales fallido, éxito demo sample, salida. Owner empresarial no es valor válido de AuthUser.role: mapear explícitamente a admin en propuesta demo, sin conceder permisos reales. No persistir contraseñas de test. El token marcador actual no es credencial real pero no reutilizarlo como autorización de producción.
