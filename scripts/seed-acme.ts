// SEED_ACME_V1 - E07: identidad, equipo, agentes y memorias del tenant `acme`.
//
// Escribe SIEMPRE dentro de `acme` y lo comprueba:
//   - cada `put` pasa por `TenantScopedStore`, cuyo resolutor exige que el
//     owner resuelva a `acme` (si no, lanza antes de escribir);
//   - después de cada escritura se comprueba la clave física `acme:<owner>`
//     en el store plano. Si no aparece, el seed falla.
//
// Idempotente por id: si la fila existe no se reescribe. Los usuarios se
// resuelven por email y las memberships por `addMembership` (idempotente).
//
// Uso: DATA_DIR=artifacts/demo/acme pnpm tsx scripts/seed-acme.ts

import { createHash } from "node:crypto";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { provisionWhatsAppConnection } from "../apps/server/src/engine/whatsapp-outbound.ts";
import { runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import { UserService } from "../apps/server/src/users.ts";
import type { Config } from "../apps/server/src/config.ts";
import type { AgentArtifact, AgentNotification, AgentRole, AgentTask, Project, ProjectBlock } from "../packages/domain/src/agent.ts";
import type { ActionProposal } from "../packages/domain/src/index.ts";
import { acmeLeadSchema } from "../packages/domain/src/acme-dataset.ts";

const TENANT_ID = "acme";
const ADMIN_EMAIL = "carlos@acme-obras.es";
const USER_PASSWORD = process.env.ACME_USER_PASSWORD ?? "acme-demo-2026";

const TEAM = [
  { email: "marta@acme-obras.es", name: "Marta Soler", role: "member" as const },
  { email: "javier@acme-obras.es", name: "Javier Gil", role: "member" as const },
  { email: "sofia@acme-obras.es", name: "Sofía Navarro", role: "member" as const },
];

const dataDir = `${process.env.DATA_DIR ?? "artifacts/demo/acme"}/postgres`;

const store: Store = await createStore({
  dataDir,
  databaseUrl: process.env.DATABASE_URL,
});
const users = new UserService(store);
const tenants = new TenantService(store, {} as Config);

// G3: el resolutor es la guarda. Si un owner no está en `acme`, no se escribe.
const scoped = new TenantScopedStore(store, async (owner) => {
  const resolution = await tenants.resolveStrict(owner);
  if (resolution.tenantId !== TENANT_ID) {
    throw new Error(
      `SEED_ACME_TENANT_GUARD: el owner ${owner} resuelve a "${resolution.tenantId}", no a "${TENANT_ID}"`,
    );
  }
  return resolution.tenantId;
});

/**
 * Escribe en el tenant y verifica la clave física `acme:<owner>`.
 *
 * `needsRewrite` existe para las filas que este mismo seed escribió antes de
 * ganar un campo obligatorio: sin él, la idempotencia dejaría para siempre una
 * fila con forma vieja y la verificación posterior fallaría (fue lo que pasó
 * con `clientId` en las tareas). Sólo reescribe sus propios ids.
 */
async function writeScoped<T extends { id: string }>(
  owner: string,
  kind: string,
  value: T,
  needsRewrite?: (existing: T) => boolean,
): Promise<"nuevo" | "existente" | "reparado"> {
  const existing = await scoped.get<T>(owner, kind, value.id);
  if (existing) {
    if (!needsRewrite?.(existing)) return "existente";
    await scoped.put(owner, kind, value);
    return "reparado";
  }
  await scoped.put(owner, kind, value);
  const raw = await store.get<T>(`${TENANT_ID}:${owner}`, kind, value.id);
  if (!raw) {
    throw new Error(`SEED_ACME_PREFIX_GUARD: ${kind}/${value.id} no está en ${TENANT_ID}:${owner}`);
  }
  return "nuevo";
}

function iso(offsetMs = 0): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

async function resolveAdminUserId(): Promise<string> {
  const registry = await store.get<{ adminUserId?: string }>(
    "system",
    "tenant-membership",
    TENANT_ID,
  );
  if (!registry?.adminUserId) {
    throw new Error("Falta el tenant acme: ejecuta antes scripts/provision-acme-tenant.ts (E06)");
  }
  const admin = await users.getById(registry.adminUserId);
  if (!admin) throw new Error(`El adminUserId ${registry.adminUserId} no existe en system/users`);
  return admin.id;
}

async function seedTeam(): Promise<{ id: string; email: string }[]> {
  const created: Array<{ id: string; email: string }> = [];
  for (const member of TEAM) {
    let user = await users.getByEmail(member.email);
    if (!user) {
      user = await users
        .create({
          email: member.email,
          name: member.name,
          password: USER_PASSWORD,
          role: "user",
          authProviderId: `acme:${member.email}`,
        })
        .catch(async (error) => {
          const again = await users.getByEmail(member.email);
          if (again) return again;
          throw error;
        });
      console.log(`+ usuario ${member.email} (${user.id})`);
    } else {
      console.log(`= usuario ${member.email} ya existe (${user.id})`);
    }
    const membership = await tenants.findMembership(user.id, TENANT_ID);
    if (!membership) {
      await tenants.addMembership(user.id, TENANT_ID, member.role);
      console.log(`+ membership ${member.email} -> ${TENANT_ID} (${member.role})`);
    }
    created.push({ id: user.id, email: user.email });
  }
  return created;
}

function buildRoles(): AgentRole[] {
  return [
    {
      id: "acme-obra",
      name: "Iván",
      tone: "concise",
      avatar: "sky",
      greeting: "¿Qué obra revisamos hoy?",
      roi: "Ninguna obra se queda sin parte diario.",
      objetivo: "Jefe de obra digital: controla avance, bloqueos y material en cada obra.",
      sops: ["parte-diario-obra", "revisar-bloqueos"],
      active: true,
      memories: [
        { kind: "identidad", text: "Directo y práctico. Habla de obra, no de teoría." },
        { kind: "dominio", text: "Toda obra tiene: avance, bloqueos, responsable y fecha de entrega." },
        { kind: "preferencias", text: "Avisa de un bloqueo el mismo día, nunca al cierre de semana." },
        { kind: "historial", text: "" },
      ],
    },
    {
      id: "acme-presupuestos",
      name: "Lucía",
      tone: "warm",
      avatar: "lilac",
      greeting: "¿Preparamos el presupuesto?",
      roi: "Presupuestos en 24 h, sin partidas olvidadas.",
      objetivo: "Presupuestista: mide, descompone partidas y detecta lo que falta antes de enviar.",
      sops: ["presupuesto-obra", "revision-partidas"],
      active: true,
      memories: [
        { kind: "identidad", text: "Ordenada y explícita con las partidas." },
        { kind: "dominio", text: "Presupuesto: capítulos, partidas, medición, precio unitario y total." },
        { kind: "preferencias", text: "Siempre tres escenarios: básico, recomendado y completo." },
        { kind: "historial", text: "" },
      ],
    },
    {
      id: "acme-soporte",
      name: "Rocío",
      tone: "warm",
      avatar: "sand",
      greeting: "¿Hay alguna incidencia post-obra?",
      roi: "Ninguna garantía se queda sin respuesta.",
      objetivo: "Soporte post-obra: recoge incidencias, prioriza por urgencia y cierra con visita.",
      sops: ["incidencia-post-obra", "cierre-garantia"],
      active: true,
      memories: [
        { kind: "identidad", text: "Cercana, nunca defensiva." },
        { kind: "dominio", text: "Incidencia: obra, cliente, urgencia, descripción y visita." },
        { kind: "preferencias", text: "Urgente = mismo día; alta = 48 h; media = semana." },
        { kind: "historial", text: "" },
      ],
    },
    {
      id: "acme-compras",
      name: "Bruno",
      tone: "concise",
      avatar: "sky",
      greeting: "¿Pedimos material?",
      roi: "Cero pedidos duplicados y cero roturas de stock.",
      objetivo: "Compras: cruza necesidades de obra con proveedores y precios acordados.",
      sops: ["pedido-material", "comparativa-proveedores"],
      active: true,
      memories: [
        { kind: "identidad", text: "Sobrio, con cifras delante." },
        { kind: "dominio", text: "Pedido: obra, material, cantidad, proveedor, precio y plazo." },
        { kind: "preferencias", text: "Comparar siempre dos proveedores antes de comprar." },
        { kind: "historial", text: "" },
      ],
    },
  ];
}

const MEMORIES = [
  {
    id: "acme-mem-1",
    text: "ACME Obras y Reformas trabaja en Canarias: Tenerife, Gran Canaria y La Palma.",
    category: "empresa",
    tags: ["ubicacion", "empresa"],
  },
  {
    id: "acme-mem-2",
    text: "Toda obra se entrega con parte diario firmado y dossier de fotos.",
    category: "proceso",
    tags: ["obra", "documentacion"],
  },
  {
    id: "acme-mem-3",
    text: "Los presupuestos se envían en 24 h laborables como máximo.",
    category: "proceso",
    tags: ["presupuestos", "plazos"],
  },
  {
    id: "acme-mem-4",
    text: "Los pedidos de material se hacen contra el presupuesto de la obra, nunca contra stock libre.",
    category: "proceso",
    tags: ["compras", "material"],
  },
  {
    id: "acme-mem-5",
    text: "El proveedor de confianza de estructura es Hormigones Atlántico.",
    category: "proveedor",
    tags: ["proveedores", "estructura"],
  },
  {
    id: "acme-mem-6",
    text: "Las incidencias urgentes post-obra se visitan el mismo día.",
    category: "soporte",
    tags: ["soporte", "urgente"],
  },
  {
    id: "acme-mem-7",
    text: "El tono con cliente particular es cercano y sin tecnicismos.",
    category: "preferencia",
    tags: ["tono", "clientes"],
  },
  {
    id: "acme-mem-8",
    text: "Ningún cobro se reclama sin revisar antes la certificación firmada.",
    category: "facturacion",
    tags: ["facturacion", "cobros"],
  },
];

async function main(): Promise<void> {
  const adminId = await resolveAdminUserId();
  console.log(`tenant ${TENANT_ID} · admin ${adminId}`);

  const team = await seedTeam();
  const owners: Record<string, string> = {
    [ADMIN_EMAIL]: adminId,
    ...Object.fromEntries(team.map((member) => [member.email, member.id])),
  };
  const business = await seedBusiness(adminId);
  const tasks = await seedTasks(adminId, owners);
  const projects = await seedProjects(adminId);
  const whatsapp = await seedWhatsApp(adminId);
  const knowledge = await seedKnowledge(adminId);
  const acciones = await seedActionsAndNotifications(adminId);

  // Roles y memorias: datos de empresa, bajo el owner del admin.
  let rolesNuevos = 0;
  for (const role of buildRoles()) {
    if ((await writeScoped(adminId, "agent-roles", role)) === "nuevo") rolesNuevos += 1;
  }
  let memoriasNuevas = 0;
  for (const memory of MEMORIES) {
    const record = {
      id: memory.id,
      text: memory.text,
      source: "You",
      category: memory.category,
      tags: memory.tags,
      createdAt: iso(-86_400_000),
    };
    if ((await writeScoped(adminId, "memories", record)) === "nuevo") memoriasNuevas += 1;
  }

  // Verificación de las etapas E07-E10.
  type TaskRow = AgentTask & { clientId?: string; amountEur?: number };
  type ProjectRow = Project & { progressPct?: number; checklistDone?: number; checklistTotal?: number };
  const roles = await scoped.list<AgentRole>(adminId, "agent-roles");
  const memorias = await scoped.list(adminId, "memories");
  const tareas = await scoped.list<TaskRow>(adminId, "tasks");
  const obras = await scoped.list<ProjectRow>(adminId, "projects");
  const artefactos = await scoped.list<AgentArtifact>(adminId, "agent-artifacts");
  const negocios = await scoped.list<Record<string, unknown>>(adminId, "business-records");
  const enDefault = await store.list(`default:${adminId}`, "agent-roles");
  const usuarios = await store.list("system", "users");

  const leads = negocios.filter((row) => row.type === "lead");
  const clientes = negocios.filter((row) => row.type === "client");
  const facturas = negocios.filter((row) => row.type === "invoice");
  const sumaFacturas = facturas.reduce((acc, row) => acc + Number(row.amountEur ?? 0), 0);
  const estados = [...new Set(tareas.map((t) => t.status))].sort();
  const ESTADOS_REQUERIDOS = [
    "failed",
    "paused",
    "queued",
    "running",
    "scheduled",
    "succeeded",
    "waiting_approval",
    "waiting_input",
  ];
  const ownersValidos = new Set(Object.values(owners));

  console.log("");
  console.log(`agentes    : ${roles.length} (nuevos ${rolesNuevos})`);
  console.log(`memorias   : ${memorias.length} (nuevas ${memoriasNuevas})`);
  console.log(`tareas     : ${tareas.length} (nuevas ${tasks.nuevas}, reparadas ${tasks.reparadas}) · estados ${estados.join(", ")}`);
  console.log(`obras      : ${obras.length} (${projects.nuevas} registros nuevos) · ${obras.map((o) => `${o.name.split(" ")[0]} ${o.progressPct}%`).join(", ")}`);
  console.log(`artefactos : ${artefactos.length}`);
  console.log(`negocio    : ${leads.length} leads, ${clientes.length} clientes, ${facturas.length} facturas (suma ${sumaFacturas})`);
  console.log(`equipo     : ${1 + team.length} usuarios (${[ADMIN_EMAIL, ...TEAM.map((m) => m.email)].join(", ")})`);
  console.log(`usuarios db: ${usuarios.length}`);
  console.log(`default:<admin> en agent-roles: ${enDefault.length}`);

  // E07
  if (roles.length !== 4) throw new Error(`se esperaban 4 agentes, hay ${roles.length}`);
  if (memorias.length !== 10) throw new Error(`se esperaban 10 memorias (8 + 2 de obra), hay ${memorias.length}`);
  if (enDefault.length !== 0) throw new Error(`fuga: default:${adminId} tiene ${enDefault.length} roles de acme`);
  // E08
  if (tareas.length !== 10) throw new Error(`se esperaban 10 tareas, hay ${tareas.length}`);
  for (const estado of ESTADOS_REQUERIDOS) {
    if (!estados.includes(estado)) throw new Error(`falta una tarea en estado ${estado}`);
  }
  const sinOwner = tareas.find((t) => !ownersValidos.has(String((t.state as { ownerId?: string }).ownerId ?? "")));
  if (sinOwner) throw new Error(`la tarea ${sinOwner.id} no tiene state.ownerId de un usuario de acme`);
  const sinCliente = tareas.find((t) => !t.clientId);
  if (sinCliente) throw new Error(`la tarea ${sinCliente.id} no tiene clientId`);
  const importeMal = tareas.find((t) => t.amountEur !== undefined && typeof t.amountEur !== "number");
  if (importeMal) throw new Error(`la tarea ${importeMal.id} tiene amountEur no numérico`);
  // E09
  if (obras.length !== 3) throw new Error(`se esperaban 3 obras, hay ${obras.length}`);
  for (const obra of obras) {
    const puntos = obra.blocks.filter((b) => b.type === "checklist");
    const hechos = puntos.filter((b) => b.checked).length;
    const esperado = Math.round((hechos / puntos.length) * 100);
    if (obra.checklistDone !== hechos || obra.checklistTotal !== puntos.length || obra.progressPct !== esperado) {
      throw new Error(
        `la obra ${obra.id} tiene un porcentaje incoherente: ${obra.checklistDone}/${obra.checklistTotal} vs ${obra.progressPct}%`,
      );
    }
  }
  if (memorias.filter((m) => (m as { category?: string }).category === "obra").length !== 2) {
    throw new Error("faltan las 2 memorias de obra");
  }
  if (artefactos.length !== 2) throw new Error(`se esperaban 2 artefactos, hay ${artefactos.length}`);
  // E10
  if (leads.length !== 4) throw new Error(`se esperaban 4 leads, hay ${leads.length}`);
  for (const lead of leads) acmeLeadSchema.parse(lead);
  if (clientes.length !== 3) throw new Error(`se esperaban 3 clientes, hay ${clientes.length}`);
  if (facturas.length !== 4) throw new Error(`se esperaban 4 facturas, hay ${facturas.length}`);
  if (facturas.some((f) => typeof f.amountEur !== "number")) {
    throw new Error("alguna factura tiene el importe como texto");
  }


  // E11-E13
  type ConexionWa = { instance: string; enabled: boolean; allowedRecipients: string[]; generation: string };
  type BorradorWa = { id: string; to: string; text: string; status: string; connectionGeneration: string };
  type BandejaWa = { id: string; accountId: string; from: string; text: string; status: string };
  type Documento = { id: string; name: string; url: string; mimeType: string };
  type Fuente = { id: string; sourceId: string; status: string; chunks: number };
  type Chunk = { id: string; sourceId: string; text: string; embedding: unknown };
  type Accion = ActionProposal & { amountEur?: number };
  type Notificacion = AgentNotification & { cta?: string };
  const conexion = await scoped.get<ConexionWa>(adminId, "whatsapp-connections", "whatsapp");
  const borradores = await scoped.list<BorradorWa>(adminId, "whatsapp-drafts");
  const bandeja = await scoped.list<BandejaWa>(adminId, "whatsapp-inbox");
  const documentos = await scoped.list<Documento>(adminId, "files");
  const fuentes = await scoped.list<Fuente>(adminId, "rag-sources");
  const chunks = await scoped.list<Chunk>(adminId, "rag-chunks");
  const listaAcciones = await scoped.list<Accion>(adminId, "actions");
  const notificaciones = await scoped.list<Notificacion>(adminId, "notifications");

  console.log(`whatsapp   : ${conexion ? `${conexion.instance} (${conexion.enabled ? "activa" : "parada"}) · ${borradores.length} borradores · ${bandeja.length} en bandeja` : "SIN CONEXIÓN"}`);
  console.log(`conocimiento: ${documentos.length} documentos · ${fuentes.length} fuentes · ${chunks.length} chunks`);
  console.log(`acciones   : ${listaAcciones.length} · notificaciones ${notificaciones.length}`);

  // E11
  if (!conexion) throw new Error("falta la conexión WhatsApp de acme");
  if (conexion.instance !== "acme-demo") throw new Error(`instance inesperada: ${conexion.instance}`);
  if (borradores.length !== 2) throw new Error(`se esperaban 2 borradores, hay ${borradores.length}`);
  if (bandeja.length !== 2) throw new Error(`se esperaban 2 mensajes de bandeja, hay ${bandeja.length}`);
  for (const borrador of borradores) {
    if (!conexion.allowedRecipients.includes(borrador.to)) {
      throw new Error(`el borrador ${borrador.id} apunta fuera de allowedRecipients (${borrador.to})`);
    }
    if (borrador.connectionGeneration !== conexion.generation) {
      throw new Error(`el borrador ${borrador.id} no pertenece a la generación vigente`);
    }
  }
  if (bandeja.some((mensaje) => mensaje.accountId !== "acme-demo")) {
    throw new Error("algún mensaje de bandeja no es de la cuenta acme-demo");
  }
  // E12
  if (documentos.length !== 4) throw new Error(`se esperaban 4 documentos, hay ${documentos.length}`);
  if (!documentos.some((doc) => doc.url.startsWith("data:"))) throw new Error("ningún documento se puede abrir con url data");
  if (fuentes.length !== 3) throw new Error(`se esperaban 3 fuentes RAG, hay ${fuentes.length}`);
  if (fuentes.some((fuente) => !fuente.sourceId.startsWith(`${TENANT_ID}:`))) {
    throw new Error("alguna fuente RAG no lleva el prefijo del tenant");
  }
  if (chunks.length !== 6) throw new Error(`se esperaban 6 chunks, hay ${chunks.length}`);
  const sourceIds = new Set(fuentes.map((fuente) => fuente.sourceId));
  if (chunks.some((chunk) => !sourceIds.has(chunk.sourceId))) {
    throw new Error("algún chunk apunta a una fuente que no es de acme");
  }
  // E13
  if (listaAcciones.length !== 4) throw new Error(`se esperaban 4 acciones, hay ${listaAcciones.length}`);
  const estadosAccion = new Set(listaAcciones.map((accion) => accion.status));
  for (const estado of ["awaiting_review", "scheduled", "failed", "outcome_unknown"] as const) {
    if (!estadosAccion.has(estado)) throw new Error(`falta una acción en estado ${estado}`);
  }
  if (listaAcciones.some((accion) => typeof accion.amountEur !== "number")) {
    throw new Error("alguna acción no lleva importe numérico");
  }
  if (notificaciones.length !== 4) throw new Error(`se esperaban 4 notificaciones, hay ${notificaciones.length}`);
  if (notificaciones.some((notificacion) => !notificacion.cta)) {
    throw new Error("alguna notificación no lleva cta explícito");
  }

  console.log("");
  console.log(`OK: seed de acme (identidad, tareas, obras, negocio, comunicaciones, conocimiento, acciones)`);
  await store.close();
}

// --- E10 · negocio: clientes, leads e facturas -------------------------------

async function seedBusiness(adminId: string): Promise<{ nuevos: number }> {
  const clientes = [
    { id: "acme-cli-1", type: "client", name: "Comunidad Colón 14", status: "activo", city: "Santa Cruz de Tenerife", monthlyFee: 0 },
    { id: "acme-cli-2", type: "client", name: "Hotel Tenerife Sur", status: "activo", city: "Adeje", monthlyFee: 1200 },
    { id: "acme-cli-3", type: "client", name: "Ayuntamiento de Tagoror", status: "activo", city: "Las Palmas de Gran Canaria", monthlyFee: 0 },
  ];

  const leads = [
    {
      id: "acme-lead-1",
      type: "lead",
      name: "Promotora Levante",
      domain: "promotora-levante.es",
      status: "oportunidad" as const,
      amountEur: 18400,
      nextStep: "Enviar presupuesto de estructura",
      action: "Revisar pliego",
      detail: "Tres locales en Valencia; piden reforma integral con plazo de 10 semanas.",
      updatedAt: iso(-3_600_000),
    },
    {
      id: "acme-lead-2",
      type: "lead",
      name: "Clínica Dental Arucas",
      domain: "dental-aruacas.es",
      status: "estable" as const,
      amountEur: 6400,
      nextStep: "Visita técnica el jueves",
      action: "Confirmar visita",
      detail: "Reforma de dos consultas; obra pequeña pero recurrente.",
      updatedAt: iso(-7_200_000),
    },
    {
      id: "acme-lead-3",
      type: "lead",
      name: "Restaurante La Bajada",
      domain: "labajada.es",
      status: "riesgo" as const,
      amountEur: null,
      nextStep: "Recuperar contacto: dos semanas sin respuesta",
      action: "Llamar",
      detail: "Pidió presupuesto de terraza y no volvió a contestar.",
      updatedAt: iso(-86_400_000 * 14),
    },
    {
      id: "acme-lead-4",
      type: "lead",
      name: "Hotel Tenerife Sur (ampliación)",
      domain: "hoteltenerifesur.es",
      status: "ganado" as const,
      amountEur: 41200,
      nextStep: "Firmar contrato de ampliación",
      action: "Enviar contrato",
      detail: "Ampliación de 6 habitaciones adjudicada.",
      updatedAt: iso(-1_800_000),
    },
  ];

  const facturas = [
    { id: "acme-inv-1", type: "invoice", number: "F-2026-012", clientId: "acme-cli-2", amountEur: 12600, status: "cobrada", issuedAt: "2026-10-01", dueAt: "2026-10-31" },
    { id: "acme-inv-2", type: "invoice", number: "F-2026-013", clientId: "acme-cli-1", amountEur: 8400, status: "cobrada", issuedAt: "2026-10-03", dueAt: "2026-11-02" },
    { id: "acme-inv-3", type: "invoice", number: "F-2026-014", clientId: "acme-cli-2", amountEur: 4300, status: "pendiente", issuedAt: "2026-10-15", dueAt: "2026-11-14" },
    { id: "acme-inv-4", type: "invoice", number: "F-2026-015", clientId: "acme-cli-3", amountEur: 2150, status: "pendiente", issuedAt: "2026-10-20", dueAt: "2026-11-19" },
  ];

  let nuevos = 0;
  for (const row of [...clientes, ...leads, ...facturas]) {
    if ((await writeScoped(adminId, "business-records", row)) === "nuevo") nuevos += 1;
  }
  return { nuevos };
}

// --- E08 · tareas ------------------------------------------------------------

const PARTIDAS = [
  "Demoliciones",
  "Replanteo",
  "Excavación",
  "Saneamiento",
  "Cimentación",
  "Estructura",
  "Cerramientos",
  "Cubierta",
  "Impermeabilización",
  "Instalación eléctrica",
  "Fontanería",
  "Climatización",
  "Tabiquería",
  "Enlucidos",
  "Alicatado",
  "Solados",
  "Carpintería interior",
  "Carpintería exterior",
  "Pintura",
  "Vidrio y espejos",
  "Cocina",
  "Baños",
  "Ventilación",
  "Limpieza final",
  "Entrega y firma",
];

function checklist(idPrefix: string, total: number, done: number): ProjectBlock[] {
  return PARTIDAS.slice(0, total).map((text, index) => ({
    id: `${idPrefix}-${index + 1}`,
    type: "checklist" as const,
    text,
    checked: index < done,
  }));
}

async function seedTasks(adminId: string, owners: Record<string, string>): Promise<{ nuevas: number; reparadas: number }> {
  type TaskRow = AgentTask & { clientId: string; amountEur?: number };
  const base = (id: string, title: string, kind: TaskRow["kind"], status: AgentTask["status"], agentId: string, state: Record<string, unknown>) => {
    const ownerId = String(state.ownerId);
    if (!Object.values(owners).includes(ownerId)) {
      throw new Error(`SEED_ACME_OWNER_GUARD: la tarea ${id} apunta a un owner que no es de acme (${ownerId})`);
    }
    const clientId = String(state.clientId ?? "");
    if (!clientId) {
      throw new Error(`SEED_ACME_CLIENT_GUARD: la tarea ${id} no declara cliente`);
    }
    return {
      id,
      tenantId: TENANT_ID,
      title,
      prompt: title,
      kind,
      status,
      clientId,
      ...(typeof state.amountEur === "number" ? { amountEur: state.amountEur } : {}),
      assignedTo: agentId,
      plan: [
        { id: "s1", title: "Leer contexto de la obra", status: "succeeded" as const, durationMs: 900 },
        { id: "s2", title: "Cruzar con el presupuesto", status: status === "failed" ? ("failed" as const) : ("succeeded" as const), durationMs: 1500 },
      ],
      evidence: [],
      input: {},
      state,
      createdAt: iso(-3_600_000 * 6),
      updatedAt: iso(-600_000),
      attempts: 1,
      artifactIds: [],
    } satisfies TaskRow;
  };

  const tasks: TaskRow[] = [
    base("acme-task-1", "Presupuesto reforma Colón 14", "plan", "queued", "acme-presupuestos", { ownerId: owners[ADMIN_EMAIL], clientId: "acme-cli-1", amountEur: 18400 }),
    base("acme-task-2", "Pedido de cemento y ferralla", "sop", "running", "acme-compras", { ownerId: owners["javier@acme-obras.es"], clientId: "acme-cli-2", amountEur: 3120 }),
    base("acme-task-3", "Parte diario Tenerife Sur", "sop", "succeeded", "acme-obra", { ownerId: owners["javier@acme-obras.es"], clientId: "acme-cli-2", amountEur: 4200 }),
    base("acme-task-4", "Incidencia de humedad en Las Palmas", "agent", "waiting_input", "acme-soporte", { ownerId: owners["sofia@acme-obras.es"], clientId: "acme-cli-3", amountEur: 640 }),
    base("acme-task-5", "Certificación de octubre", "finance", "waiting_approval", "acme-presupuestos", { ownerId: owners["sofia@acme-obras.es"], clientId: "acme-cli-2", amountEur: 12600 }),
    base("acme-task-6", "Revisión del pliego de Tagoror", "document", "paused", "acme-presupuestos", { ownerId: owners["marta@acme-obras.es"], clientId: "acme-cli-3", amountEur: 9800 }),
    base("acme-task-7", "Recordatorio cobro F-2026-014", "finance", "scheduled", "acme-soporte", { ownerId: owners["sofia@acme-obras.es"], clientId: "acme-cli-2", amountEur: 4300 }),
    base("acme-task-8", "Comparativa de proveedores de aluminio", "agent", "succeeded", "acme-compras", { ownerId: owners["marta@acme-obras.es"], clientId: "acme-cli-1", amountEur: 2150 }),
    base("acme-task-9", "Auditar avance de Tenerife Sur", "monitor", "failed", "acme-obra", { ownerId: owners["javier@acme-obras.es"], clientId: "acme-cli-2" }),
    base("acme-task-10", "Enviar dossier final de Las Palmas", "sop", "running", "acme-soporte", { ownerId: owners["sofia@acme-obras.es"], clientId: "acme-cli-3", amountEur: 780 }),
  ];

  let nuevas = 0;
  let reparadas = 0;
  for (const task of tasks) {
    const result = await writeScoped(
      adminId,
      "tasks",
      task,
      (existing) => typeof existing.clientId !== "string" || existing.clientId.length === 0,
    );
    if (result === "nuevo") nuevas += 1;
    if (result === "reparado") reparadas += 1;
  }
  return { nuevas, reparadas };
}

// --- E09 · obras, memorias de obra y artefactos ------------------------------

async function seedProjects(adminId: string): Promise<{ nuevas: number }> {
  type ProjectRow = Project & { progressPct: number; checklistDone: number; checklistTotal: number };
  const build = (
    id: string,
    name: string,
    clientId: string,
    status: Project["status"],
    total: number,
    done: number,
    description: string,
    tags: string[],
    linkedMemoryIds: string[],
    linkedArtifactIds: string[],
  ): ProjectRow => {
    const blocks = [
      { id: `${id}-head`, type: "heading" as const, text: "Checklist de obra" },
      ...checklist(id, total, done),
    ];
    return {
      id,
      name,
      clientId,
      description,
      status,
      tags,
      blocks,
      linkedMemoryIds,
      linkedArtifactIds,
      progressPct: Math.round((done / total) * 100),
      checklistDone: done,
      checklistTotal: total,
      createdAt: iso(-86_400_000 * 40),
      updatedAt: iso(-3_600_000),
    };
  };

  const obras: ProjectRow[] = [
    build(
      "acme-obra-tenerife-sur",
      "Tenerife Sur · 6 habitaciones",
      "acme-cli-2",
      "active",
      18,
      14,
      "Ampliación de 6 habitaciones y reforma de recepción.",
      ["hotel", "ampliacion"],
      ["acme-mem-obra-1"],
      ["acme-art-1"],
    ),
    build(
      "acme-obra-las-palmas",
      "Las Palmas · reforma integral",
      "acme-cli-3",
      "active",
      25,
      16,
      "Reforma integral del edificio municipal de Tagoror.",
      ["municipal", "reforma"],
      ["acme-mem-obra-2"],
      ["acme-art-2"],
    ),
    build(
      "acme-obra-tagoror",
      "Tagoror · urbanización",
      "acme-cli-3",
      "paused",
      19,
      8,
      "Urbanización exterior; en pausa a la espera de licencia.",
      ["urbanizacion", "licencia"],
      [],
      [],
    ),
  ];

  const memoriasObra = [
    {
      id: "acme-mem-obra-1",
      text: "Tenerife Sur: la propiedad exige entrar por el acceso de servicio hasta terminar la fachada.",
      source: "You",
      category: "obra",
      tags: ["obra", "tenerife-sur", "acceso"],
      createdAt: iso(-86_400_000 * 12),
    },
    {
      id: "acme-mem-obra-2",
      text: "Las Palmas: el ayuntamiento paga contra certificación firmada por su arquitecto.",
      source: "You",
      category: "obra",
      tags: ["obra", "las-palmas", "cobro"],
      createdAt: iso(-86_400_000 * 9),
    },
  ];

  const artefactos: AgentArtifact[] = [
    {
      id: "acme-art-1",
      taskId: "acme-task-3",
      kind: "report",
      title: "Parte diario Tenerife Sur",
      summary: "14 de 18 partidas cerradas; pendiente carpintería exterior.",
      data: { obra: "acme-obra-tenerife-sur", partidasCerradas: 14, partidasTotales: 18 },
      createdAt: iso(-86_400_000 * 2),
      tenantId: TENANT_ID,
    },
    {
      id: "acme-art-2",
      taskId: "acme-task-9",
      kind: "plan",
      title: "Plan de recuperación de avance",
      summary: "Refuerzo de dos oficiales durante tres semanas.",
      data: { obra: "acme-obra-tenerife-sur", refuerzoOficiales: 2, semanas: 3 },
      createdAt: iso(-86_400_000),
      tenantId: TENANT_ID,
    },
  ];

  let nuevas = 0;
  for (const obra of obras) {
    if ((await writeScoped(adminId, "projects", obra)) === "nuevo") nuevas += 1;
  }
  for (const memoria of memoriasObra) {
    if ((await writeScoped(adminId, "memories", memoria)) === "nuevo") nuevas += 1;
  }
  for (const artefacto of artefactos) {
    if ((await writeScoped(adminId, "agent-artifacts", artefacto)) === "nuevo") nuevas += 1;
  }
  return { nuevas };
}

// --- E11 · WhatsApp -----------------------------------------------------------

function draftId(idempotencyKey: string, owner: string): string {
  return createHash("sha256").update(JSON.stringify([TENANT_ID, owner, idempotencyKey])).digest("hex");
}

async function seedWhatsApp(adminId: string): Promise<{ nuevos: number }> {
  const allowedRecipients = ["34600111222", "34600333444"];
  const existing = await scoped.get(adminId, "whatsapp-connections", "whatsapp");
  if (!existing) {
    // Camino oficial: valida identidad en scope, cifra la credencial y escribe la fila.
    await runInTenantScope({ tenantId: TENANT_ID, actorId: adminId }, () =>
      provisionWhatsAppConnection(
        scoped,
        { tenantId: TENANT_ID, owner: adminId, actorId: adminId },
        {
          provider: "evolution",
          baseUrl: "https://evolution.acme-demo.example",
          instance: "acme-demo",
          apiKey: "acme-demo-api-key",
          enabled: true,
          allowedRecipients,
        },
        // vault.ts exige 32 bytes en base64: una clave demo determinista, no producción.
        process.env.ACME_WHATSAPP_KEY ?? Buffer.alloc(32, 42).toString("base64"),
      ),
    );
    console.log("+ conexión WhatsApp acme-demo");
  }

  const conexion = await scoped.get<{ generation: string }>(adminId, "whatsapp-connections", "whatsapp");
  if (!conexion) throw new Error("no se pudo leer la conexión WhatsApp recién creada");

  const drafts = [
    { key: "acme-draft-1", to: allowedRecipients[0], text: "Buenos días, adjuntamos la certificación de octubre para firma." },
    { key: "acme-draft-2", to: allowedRecipients[1], text: "Le confirmo la visita del jueves a las 9:00 para revisar la humedad." },
  ];

  let nuevos = 0;
  const now = Date.now();
  for (const draft of drafts) {
    const record = {
      id: draftId(draft.key, adminId),
      tenantId: TENANT_ID,
      owner: adminId,
      to: draft.to,
      text: draft.text,
      connectionGeneration: conexion.generation,
      channel: { provider: "evolution", accountId: "acme-demo" },
      createdAt: iso(-3_600_000),
      expiresAt: new Date(now + 30 * 60_000).toISOString(),
      status: "awaiting_review",
    };
    if ((await writeScoped(adminId, "whatsapp-drafts", record)) === "nuevo") nuevos += 1;
  }

  const inbox = [
    {
      id: "acme-wa-in-1",
      provider: "evolution" as const,
      accountId: "acme-demo",
      from: `${allowedRecipients[0]}@s.whatsapp.net`,
      text: "¿Podéis adelantar la visita al miércoles?",
      providerMessageId: "wamid.acme-1",
    },
    {
      id: "acme-wa-in-2",
      provider: "evolution" as const,
      accountId: "acme-demo",
      from: `${allowedRecipients[1]}@s.whatsapp.net`,
      text: "Recibida la certificación, la firma el arquitecto el lunes.",
      providerMessageId: "wamid.acme-2",
    },
  ];
  for (const [index, message] of inbox.entries()) {
    const record = {
      id: message.id,
      tenantId: TENANT_ID,
      owner: adminId,
      provider: message.provider,
      accountId: message.accountId,
      from: message.from,
      text: message.text,
      providerMessageId: message.providerMessageId,
      receivedAt: iso(-3_600_000 + index * 600_000),
      status: "received",
    };
    if ((await writeScoped(adminId, "whatsapp-inbox", record)) === "nuevo") nuevos += 1;
  }
  return { nuevos };
}

// --- E12 · conocimiento: documentos, fuentes RAG y chunks --------------------

async function seedKnowledge(adminId: string): Promise<{ nuevos: number }> {
  const dataUrl = `data:text/plain;base64,${Buffer.from(
    "Acta de recepción de obra - Tenerife Sur\nFirmada por la propiedad el 2026-10-28.",
    "utf8",
  ).toString("base64")}`;

  const documentos = [
    { id: "acme-doc-1", name: "Presupuesto Colón 14.pdf", mimeType: "application/pdf", size: 184320, pageCount: 6, url: "files/acme-doc-1.pdf", source: "upload" },
    { id: "acme-doc-2", name: "Pliego Tagoror.pdf", mimeType: "application/pdf", size: 402112, pageCount: 18, url: "files/acme-doc-2.pdf", source: "upload" },
    { id: "acme-doc-3", name: "Certificación octubre.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 25600, pageCount: 1, url: "files/acme-doc-3.xlsx", source: "upload" },
    { id: "acme-doc-4", name: "Acta de recepción.txt", mimeType: "text/plain", size: 96, pageCount: 1, url: dataUrl, source: "upload" },
  ];

  const fuentes = [
    { id: "acme:src-acta-1", sourceId: "acme:src-acta-1", sourceName: "Acta de recepción Tenerife Sur", kind: "upload" as const, status: "indexed" as const, chunks: 2, embedded: 2, attempts: 1 },
    { id: "acme:src-pliego-2", sourceId: "acme:src-pliego-2", sourceName: "Pliego Tagoror", kind: "upload" as const, status: "indexed" as const, chunks: 2, embedded: 2, attempts: 1 },
    { id: "acme:src-presupuesto-3", sourceId: "acme:src-presupuesto-3", sourceName: "Presupuesto Colón 14", kind: "upload" as const, status: "indexed" as const, chunks: 2, embedded: 2, attempts: 1 },
  ];

  const textos: Record<string, string[]> = {
    "acme:src-acta-1": [
      "La propiedad recibe la obra Tenerife Sur con reservas en la carpintería exterior.",
      "Se acuerda revisar las reservas en un plazo de 15 días naturales.",
    ],
    "acme:src-pliego-2": [
      "El pliego exige certificación mensual firmada por el arquitecto municipal.",
      "El plazo de ejecución de la urbanización es de 9 meses desde la licencia.",
    ],
    "acme:src-presupuesto-3": [
      "El presupuesto de Colón 14 asciende a 18.400 euros con IVA incluido.",
      "Las partidas de instalación eléctrica y fontanería van agrupadas.",
    ],
  };

  let nuevos = 0;
  for (const documento of documentos) {
    const record = { ...documento, createdAt: iso(-86_400_000 * 20) };
    if ((await writeScoped(adminId, "files", record)) === "nuevo") nuevos += 1;
  }
  for (const fuente of fuentes) {
    const record = { ...fuente, indexedAt: iso(-86_400_000 * 5), updatedAt: iso(-86_400_000 * 5) };
    if ((await writeScoped(adminId, "rag-sources", record)) === "nuevo") nuevos += 1;
  }
  for (const fuente of fuentes) {
    const frases = textos[fuente.sourceId] ?? [];
    for (const [index, text] of frases.entries()) {
      const record = {
        id: `${fuente.sourceId}:c${index + 1}`,
        sourceId: fuente.sourceId,
        sourceName: fuente.sourceName,
        chunkIndex: index,
        text,
        embedding: null,
        createdAt: iso(-86_400_000 * 5),
      };
      if ((await writeScoped(adminId, "rag-chunks", record)) === "nuevo") nuevos += 1;
    }
  }
  return { nuevos };
}

// --- E13 · acciones y notificaciones -----------------------------------------

async function seedActionsAndNotifications(adminId: string): Promise<{ nuevos: number }> {
  type Accion = ActionProposal & { amountEur: number };
  type Notificacion = AgentNotification & { cta: string };

  const acciones: Accion[] = [
    {
      id: "acme-act-1",
      taskId: "acme-task-5",
      title: "Enviar certificación de octubre a Hotel Tenerife Sur",
      kind: "email.send",
      data: { to: ["admin@hoteltenerifesur.es"], subject: "Certificación octubre", body: "Adjuntamos la certificación para firma." },
      status: "awaiting_review",
      hash: "acme-hash-act-1",
      createdAt: iso(-7_200_000),
      expiresAt: iso(86_400_000),
      signers: [],
      needed: 1,
      executeAt: null,
      amountEur: 12600,
    },
    {
      id: "acme-act-2",
      taskId: "acme-task-7",
      title: "Recordatorio de cobro F-2026-014",
      kind: "email.send",
      data: { to: ["admin@hoteltenerifesur.es"], subject: "Recordatorio de pago", body: "Os recuerdo la factura F-2026-014." },
      status: "scheduled",
      hash: "acme-hash-act-2",
      createdAt: iso(-5_400_000),
      expiresAt: iso(86_400_000 * 3),
      signers: [],
      needed: 1,
      executeAt: iso(86_400_000),
      amountEur: 4300,
    },
    {
      id: "acme-act-3",
      taskId: "acme-task-4",
      title: "Responder incidencia de humedad en Las Palmas",
      kind: "email.send",
      data: { to: ["obras@tagoror.es"], subject: "Visita de revisión", body: "Confirmamos visita el jueves a las 9:00." },
      status: "failed",
      hash: "acme-hash-act-3",
      createdAt: iso(-10_800_000),
      expiresAt: iso(-3_600_000),
      signers: [],
      needed: 1,
      executeAt: null,
      amountEur: 640,
      error: "El buzón del cliente rechazó el envío (550).",
    },
    {
      id: "acme-act-4",
      taskId: "acme-task-10",
      title: "Enviar dossier final de Las Palmas",
      kind: "email.send",
      data: { to: ["obras@tagoror.es"], subject: "Dossier final", body: "Adjuntamos el dossier de la obra." },
      status: "outcome_unknown",
      hash: "acme-hash-act-4",
      createdAt: iso(-4_200_000),
      expiresAt: iso(86_400_000),
      signers: [],
      needed: 1,
      executeAt: null,
      amountEur: 780,
    },
  ];

  const notificaciones: Notificacion[] = [
    { id: "acme-notif-1", taskId: "acme-task-5", title: "Certificación pendiente de aprobación", body: "La certificación de octubre espera tu revisión.", createdAt: iso(-3_600_000), read: false, cta: "Revisar certificación" },
    { id: "acme-notif-2", taskId: "acme-task-4", title: "Incidencia con respuesta pendiente", body: "El cliente pregunta si se puede adelantar la visita.", createdAt: iso(-5_400_000), read: false, cta: "Responder incidencia" },
    { id: "acme-notif-3", taskId: "acme-task-7", title: "Cobro programado para mañana", body: "La factura F-2026-014 se reclama mañana.", createdAt: iso(-7_200_000), read: true, cta: "Ver factura" },
    { id: "acme-notif-4", taskId: "acme-task-9", title: "Auditoría de avance fallida", body: "No se pudo leer el parte diario de Tenerife Sur.", createdAt: iso(-9_000_000), read: false, cta: "Reintentar auditoría" },
  ];

  let nuevos = 0;
  for (const accion of acciones) {
    if ((await writeScoped(adminId, "actions", accion)) === "nuevo") nuevos += 1;
  }
  for (const notificacion of notificaciones) {
    if ((await writeScoped(adminId, "notifications", notificacion)) === "nuevo") nuevos += 1;
  }
  return { nuevos };
}

try {
  await main();
} catch (error) {
  await store.close().catch(() => {});
  console.error("FALLO:", error);
  process.exit(1);
}
