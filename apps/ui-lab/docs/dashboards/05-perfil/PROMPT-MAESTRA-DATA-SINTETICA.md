# Prompt maestra · data sintética · 05-perfil

Estado: propuesta para revisión; no registros materializados. Leer primero [contrato común del lote](../../agntia-demo/07-proyecciones-dashboards/00-CONTRATO-GENERACION-LOTE-01.md), [dataset](../../agntia-demo/03-compilacion-y-dataset/DATASET-SINTETICO.md), [registros propuestos](../../agntia-demo/06-diagnostico-copy-data-sintetica/01-COPY-Y-REGISTROS-NUEVOS-PROPUESTOS.md) y [componentes reales](./componentes-reales/README.md).

## Mandato de producto
Quiero que el perfil represente a la persona que está usando AgntiaPro, no una ficha de agente ni un perfil comercial de cliente. El owner demo es el mismo que aparece en equipo, sesión, aprobaciones y navegación.
### Proyección y registros
- ActorProfile: human-founder-demo, Fundador de AgntiaPro, founder@agntiapro.example (propuesto), human, owner, tenantId agntia-demo, businessId business-agntiapro. Avatar mediante recurso autorizado o iniciales; no foto personal del founder.
- AuthUserProjection: adaptar los campos reales de AuthUser a ActorProfile. No agregar campos editables que no soporte updateMe. El email y rol se muestran según contrato, no se cambian desde un fixture arbitrario.
- ProfileEditScenario: nombre original, borrador, vacío, guardando, guardado, error de campo, error general, cancelado. El cambio demo se mantiene en store local compartido para que Equipo y TopBar no contradigan el perfil; reset restaura baseline.
- PasswordChangeScenario: contraseña actual requerida, mínimo 8 caracteres según componente, confirmación no coincide, error de servidor, éxito simulado. No guardar valores ni hashes; solo estados y resultados ficticios.
- GoogleConnectionScenario: unknown/loading, disconnected, read, write, connecting, disconnecting, error. Derivar shape exacto de GoogleStatus y API google; no inventar scopes, tokens ni cuenta conectada. Un permiso simulado no concede acceso real.
### Densidad
Un owner principal, variantes de edición y conexión; actores de QA adicionales solo si existen en catálogo central y con permisos coherentes. No duplicar LAIA ni convertir agente-ana en owner.
### Recorrido
Owner abre perfil → revisa identidad → cambia nombre en demo → recibe confirmación local → TopBar y Equipo muestran el mismo nombre → reset. Alternativa: revisa conexión Google simulada y cancela sin cambios.
### Aceptación
Validaciones del componente conservadas; cambios no llegan a producción; rol no editable sin contrato; credenciales nunca en fixtures, logs ni capturas; estado de Google explícitamente simulado y no usado para ejecutar acciones.

## Entrega exigida al futuro generador
Proponer schema tipado y mapeo a props existentes; manifest de registros con IDs y fuente; escenarios positivos y negativos; proyección pura con tests de referencias, determinismo y aislamiento; informe de campos no soportados. Guardar datos ejecutables únicamente en la fuente central futura apps/ui-lab/agntia-demo/, no en esta carpeta. No implementar backend, cambiar código activo ni desplegar sin autorización.


## Anexo de contraste con código real · revisión 2
Baseline 21364ef55320ffb46fdcfd65a02802d593f9285b. Lectura focalizada de snapshots y contratos activos; no certifica auditoría exhaustiva de todos los imports transitivos ni QA visual. Esta sección prevalece sobre cualquier descripción anterior incompatible.

| Componente / API | Contrato y escenarios |
|---|---|
| ProfileModal | user:AuthUser, onClose,onSaved; email visible, name editable; no editor de rol |
| updateMe | PATCH /api/auth/me con name opcional y currentPassword/newPassword opcionales; no confirmPassword en payload |
| Validación | name trim obligatorio; si newPassword, actual requerida, >=8 caracteres, confirmación igual; ApiError.fields y error general; saved y busy |
| GoogleStatus | connected,account nullable,provider google,scopes[],write,sample,configured |
| googleStatus | GET /api/google/status; fallo inicial deja null; no afirmar desconectado verificado cuando status desconocido |
| connectGoogle | POST capability read/write; resultado url nullable,connected opcional; url real redirige, null refresca status |
| disconnectGoogle | POST y refresco; solo botón visible si connected |
| RoleSelector | GET /api/agent/roles, id/name/active, filtra activos, sin rol undefined; pertenece a chat, no a edición de identidad |
| AuthUser | role admin/user; setup sopIds/allowedTools/greeting; owner es rol empresarial distinto |

Fixtures mínimos Google: desconocido, sample desconectado, sample conectado lectura, sample conectado escritura, live no configurado (solo representación), error conectar/desconectar; scopes deben venir del contrato autorizado, no inventar permisos. Nunca activar OAuth desde preview. Probar actualización de nombre y callback onSaved; sincronización con otras vistas es requisito propuesto, no prueba de implementación. Contraseñas efímeras y nunca en logs.
