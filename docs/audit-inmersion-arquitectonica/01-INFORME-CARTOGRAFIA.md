# Auditoría 01 — Cartografía integral
## Alcance y autoridad
Baseline padre main ce032d9083ea8ee5332730d973709c442aa523a0; integración 9650aac71abcceef308681ab49a381d20e7584ff; canónica 8672f8c1035067e77de76080aabbe8d4c8030fe5. Complementos 01-cartografia, 01b y 01c. Inventario de los 18 repos, árboles completos del padre en tres refs y de 17 hijos en main. README de cada hijo inspeccionado (extractos iniciales, no todos completos). SHA de hijos abajo es SHA de árbol devuelto por API, no necesariamente commit. No pruebas nuevas.
## Mapa de repos especializados
| Repo | Árbol SHA | archivos / TS / Python / MD | estado documentado y contraste |
|---|---|---|---|
| video |0af2c5bb442e3c9fc55d7fc6d9455b3d571a8ff7|96/6/11/58|MVP Python FFmpeg + SDK TS, 16 tools; no integración padre acreditada|
| gestoria |ea8e1b536b66ae501ddb1ce3f3be41a4f184f503|458/12/117/247|servicio Python SQLite, SDK Hono, roles y expedientes; integración padre pendiente de contraste|
| ciberseguridad |424c8e23c73fca45a005d1f5b065678d2cda02ca|819/4/301/360|FastAPI SDK TS; README reporta 196 tests y laboratorio posterior separado; NO GO producción; tarball en padre|
| formacion |9c0b7ede0011245edf4ee41f54e38413136fca3d|179/0/0/174|documentación, 42 campañas no iniciadas|
| redes |7940e97ee857580d686b2047fc371dc9820d2450|282/55/0/194|instalador ensayado en clon, dos verticales locales; no proveedor real|
| clientes |8472ea9a5f5b94d753d5a9cafeeeae5d00f8db9d|348/93/0/235|skeleton, 114 tests y dos verticales PG reportados; sin instalación padre|
| marketing |a13ecfa5267b2b9c992d7223815040977a272b1b|332/49/1/204|23 DONE,15 PARTIAL,4 BLOCKED; PG16 y outbox reportados; persistencia producto parcial|
| ventas |dc5d2f38f7f99422b5c82e3b1718862207b5827f|297/83/0/184|README dice documentation only main pero árbol contiene código; verificar vigencia y ramas, no asumir certificación|
| branding |534dc9e515b08e1102dedba3b80ecf18e101d54c|261/49/0/180|131 tests reportados, vertical HTTP, siete tarballs; sin PG/Supabase reales|
| finanzas |193faf1690d2741134e31b18895d3431a1a79445|216/21/0/175|C01–05 scaffold, 41 tests reportados, catálogo vacío|
| legal |5fb797631371d34a2521dbb45b7f042776efd210|289/94/0/180|221 tests reportados,16 implemented,24 partial,2 stubbed; RLS PGlite|
| seguros |82ef41a61fa41215c5b3be3cd6e3ec11fd04a8f0|253/42/0/177|README documentation only contradice árbol TS; investigar|
| diseño |f976a56376cf6d740090b06eea0e7b56705f22e8|154/0/0/153|documental|
| comunicación |439b5942c0e69f19a8663651daefa44267ad9c76|156/0/0/155|documental|
| iadev |67b6671b0aff8b40e2710535cde0ea6601f337cf|1562/5/12/1534|motor conocimiento y currículo; README raíz vacío de contenido técnico; revisar README-KNOWLEDGE-ENGINE|
| acme |8637e8925dd57351e9e93af8dae79aa3b2163314|11/0/0/11|productor sintético conceptual, no tenant ni runtime|
| iamotion |28db56fdb9bf522582bf484debee1bba7d29feba|418/0/0/4|biblioteca activos y workflow; fase 1 factoría, fase 2 inteligencia futura; corrige inventario anterior tamaño cero|
## Modelo de arquitectura
Padre gobierna identidades, políticas, mandatos, aprobaciones, memoria y efectos. Hijos pueden ser servicios independientes con SDK server-only y portales propios; identidad canónica/twins y AuthorityMap por encargo son diseño recurrente, no contrato universal certificado. Duplicación de capacidad es legítima si autoridad y efecto único están resueltos. No confundir librería instalada, servicio accesible, proveedor habilitado y capacidad gobernada. Los repos de activos, conocimiento y datos no son departamentos ejecutores equivalentes.
## PMV: tres universos y una identidad lógica
Leídos README demo, auditoría 00 y arquitectura 01 de 05-campana-unificacion-tenants, README UI Lab. Contraste directo main: apps/web/src/demo/tenant.ts exporta DEMO_TOKEN demo:interfaz; api/client.ts apiFetch retorna demoRequest antes de fetch real; apps/ui-lab/src/FullAppPreview.tsx monta App real con sesión sample e impide origen agntiapro.com; apps/server/src/db-tenant.ts TenantScopedStore compone tenant:owner. Por tanto UI real reutilizada no implica ejecución real. Auditoría previa identifica ACME persistente de construcción y Studio simulador local; verificar sus símbolos en Audit 04/05. Arquitectura propuesta separa SyntheticProvider sin red de TenantApiProvider persistente con dataset canónico compartido. No migrar ACME por renombrado. Repo acme declara explícitamente mismo contrato de ingesta, seed/run/scenario, reloj virtual no aplicable a leases/tokens. El PMV necesita paridad de circuito, no paridad de catálogo.
## Superficies y dependencias
packages/workspaces contiene módulos numerados con manifests, contratos, docs y tests. 01-gmail/workspace.json y 02-whatsapp/workspace.json declaran scaffold aunque sus capacidades pueden existir en rutas independientes del padre. No deducir que Gmail/WhatsApp no funcionan del status del workspace. Integrations contiene google, google-maps, meta-whatsapp, resend, vapi, vault, pdf y stubs gmb/social/stripe/whatsapp. Backends openbot.ts. UI Lab README distingue 27 previews, 34 Apps, identificador 35 Centro Mando; vistas legacy retiradas del demo pero aún montadas en producción según README. Formación 12 lecciones demo frente a 120 planeadas. Pages y Vercel separados, no certificación de despliegue.
## Riesgos de lectura
1. README ventas/seguros desfasado respecto a presencia de código; presencia no acredita ejecución.
2. Canonical y Trans originales sobre base antigua; ejecución acumulativa y gate no certificante (01c).
3. Identidad demo, owner real y cliente comercial requieren tres evidencias distintas.
4. Status scaffold de workspace no equivale a status capability.
5. db-tenant.ts scan fallback global si query por prefijo falla; hipótesis de riesgo de aislamiento a verificar con consumidores y rama integrada, no vulnerabilidad confirmada.
6. Whitepapers mezclan épocas; README actual y evidencia por SHA prevalecen para estado, fuentes founder para intención.
## Métricas cartográficas, no madurez funcional
17/17 hijos inventariados por árbol; 17/17 README inspeccionados; 12/17 tienen TS o Python (70,6%); 5/17 sin TS/Python (29,4%, incluye activos IAMotion). Estos porcentajes miden presencia de extensiones, no producto. 0/17 certificados independientemente en este turno; no significa cero en producción. No sumar tests de repos o fases heterogéneas. 15% global del founder permanece referencia. Porcentajes por etapa se calcularán sobre unidades taxonómicas en 07/08.
## Cierre de alcance
Cartografía de primer nivel completada; no lectura exhaustiva de 17 repos ni todas sus ramas. Auditorías 02–07 profundizan por dominio, 08 sintetiza. No modificar código ni ejecutar proveedores. Las afirmaciones de tests de hijos son documentales y no reejecutadas. La auditoría 01 queda cerrada como inventario de primer nivel, no certificación integral.
