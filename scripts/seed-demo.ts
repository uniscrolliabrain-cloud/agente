// DEMO_SEED_V1 - tenant demo reproducible con datos tipicos de PYME.
// Uso: pnpm exec tsx scripts/seed-demo.ts
// Idempotente: si el owner "demo" ya tiene datos, no reescribe.

import { existsSync } from "node:fs";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { UserService } from "../apps/server/src/users.ts";
import type { AgentRole } from "../packages/domain/src/agent.ts";

const OWNER = "demo";
const ADMIN_EMAIL = "demo@openmuse.local";
const ADMIN_PASSWORD = "demo-password-2026";
const ADMIN_NAME = "Alfonso (demo)";

async function seedRoles(db: Store): Promise<number> {
  const roles: AgentRole[] = [
    {
      id: "comercial",
      name: "Leo",
      tone: "concise",
      avatar: "sky",
      greeting: "Dime un lead y te digo en que punto esta.",
      roi: "Cero leads olvidados.",
      objetivo: "Pesado en el buen sentido. No deja que un lead se enfrie.",
      sops: ["revisar-pipeline", "primer-contacto"],
      active: true,
      memories: [
        { kind: "identidad", text: "Directo, sin rodeos. Tutea." },
        { kind: "dominio", text: "Todo lead necesita: origen, necesidad, presupuesto, proxima accion." },
        { kind: "preferencias", text: "Propuestas con 3 paquetes." },
        { kind: "historial", text: "" },
      ],
    },
    {
      id: "atencion",
      name: "Sofia",
      tone: "warm",
      avatar: "lilac",
      greeting: "Algun cliente esperando respuesta?",
      roi: "Ningun mensaje sin contestar en 4 horas.",
      objetivo: "La que no deja un mensaje sin contestar.",
      sops: ["responder-whatsapp"],
      active: true,
      memories: [
        { kind: "identidad", text: "Cercana, empatica." },
        { kind: "dominio", text: "Categorias: precio, horario, cita, soporte, ubicacion." },
        { kind: "preferencias", text: "Escalar a humano si el cliente lo pide 2 veces." },
        { kind: "historial", text: "" },
      ],
    },
    {
      id: "administrativo",
      name: "Carmen",
      tone: "warm",
      avatar: "sand",
      greeting: "Te recuerdo lo de esta semana.",
      roi: "Facturacion y cobros al dia.",
      objetivo: "Metodica e insistente. Recuerda el vencimiento 3 veces.",
      sops: ["emitir-factura-mensual", "recordar-pago-vencido"],
      active: true,
      memories: [
        { kind: "identidad", text: "Metodica, calida pero insistente." },
        { kind: "dominio", text: "Factura: numero correlativo, IVA 21%." },
        { kind: "preferencias", text: "Avisos a los 25, 28 y 31 dias." },
        { kind: "historial", text: "" },
      ],
    },
    {
      id: "finanzas",
      name: "Victor",
      tone: "concise",
      avatar: "sky",
      greeting: "Caja, margen, cobros.",
      roi: "Alertas reales solo cuando importa.",
      objetivo: "No factura, interpreta. Nunca da una cifra sin fecha.",
      sops: ["cashflow-semanal", "alerta-cobros"],
      active: true,
      memories: [
        { kind: "identidad", text: "Cuadriculado, sin adornos." },
        { kind: "dominio", text: "Metricas: caja neta, dias de cobro, margen por cliente." },
        { kind: "preferencias", text: "Alertas solo si el margen cae >15%." },
        { kind: "historial", text: "" },
      ],
    },
  ];
  for (const r of roles) {
    await db.put(OWNER, "agent-roles", r);
  }
  return roles.length;
}

async function seedMemories(db: Store): Promise<number> {
  const mems = [
    { text: "El tono con clientes es cercano y profesional. Tutear por defecto.", category: "preferencia", tags: ["tono", "comunicacion"] },
    { text: "Todas las propuestas incluyen 3 paquetes: basico, medio, premium.", category: "proceso", tags: ["propuestas"] },
    { text: "La factura se emite el primer dia laborable del mes.", category: "proceso", tags: ["facturacion"] },
    { text: "Antes de dar de alta a un cliente se valida el CIF.", category: "proceso", tags: ["alta-cliente"] },
    { text: "Las acciones sensibles (enviar email, publicar, cobrar) requieren aprobacion humana.", category: "empresa", tags: ["aprobaciones"] },
    { text: "El cliente Acme lleva con nosotros desde 2024. Factura mensual de 350.", category: "cliente", tags: ["acme"] },
    { text: "El proveedor de hosting es Hetzner. Renovacion en marzo.", category: "empresa", tags: ["proveedores"] },
    { text: "El equipo hace reunion semanal los lunes a las 10.", category: "rrhh", tags: ["reuniones"] },
  ];
  let count = 0;
  for (let i = 0; i < mems.length; i++) {
    const m = mems[i];
    await db.put(OWNER, "memories", {
      id: `demo-mem-${i + 1}`,
      text: m.text,
      source: "You",
      category: m.category,
      tags: m.tags,
      createdAt: new Date().toISOString(),
    });
    count++;
  }
  return count;
}

async function seedTasks(db: Store): Promise<number> {
  const now = Date.now();
  const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString();

  const tasks = [
    {
      id: "demo-task-1",
      title: "Conciliar banco de septiembre",
      kind: "sop" as const,
      status: "running" as const,
      assignedTo: "administrativo",
      plan: [
        { id: "s1", title: "Descargar extracto", status: "succeeded" as const, durationMs: 1200 },
        { id: "s2", title: "Casar movimientos", status: "running" as const },
        { id: "s3", title: "Guardar informe", status: "pending" as const },
      ],
    },
    {
      id: "demo-task-2",
      title: "Enviar recordatorios de pago",
      kind: "sop" as const,
      status: "running" as const,
      assignedTo: "administrativo",
      plan: [
        { id: "s1", title: "Leer facturas pendientes", status: "succeeded" as const, durationMs: 800 },
        { id: "s2", title: "Preparar emails", status: "running" as const },
      ],
    },
    {
      id: "demo-task-3",
      title: "Alta de cliente: Estudio Lua",
      kind: "sop" as const,
      status: "waiting_input" as const,
      assignedTo: "comercial",
      question: "Falta el CIF del cliente. Puedes confirmarlo?",
      plan: [
        { id: "s1", title: "Leer email", status: "succeeded" as const, durationMs: 500 },
        { id: "s2", title: "Validar CIF", status: "running" as const },
        { id: "s3", title: "Crear carpeta Drive", status: "pending" as const },
        { id: "s4", title: "Enviar bienvenida", status: "pending" as const },
      ],
    },
    {
      id: "demo-task-4",
      title: "Resumen semanal del negocio",
      kind: "sop" as const,
      status: "succeeded" as const,
      assignedTo: "finanzas",
      result: "Informe semanal entregado con 3 leads nuevos, 2 cerrados, caja estable.",
      plan: [
        { id: "s1", title: "Leer leads", status: "succeeded" as const, durationMs: 400 },
        { id: "s2", title: "Leer facturas", status: "succeeded" as const, durationMs: 600 },
        { id: "s3", title: "Guardar informe", status: "succeeded" as const, durationMs: 300 },
      ],
    },
    {
      id: "demo-task-5",
      title: "Auditar web de Bar La Esquina",
      kind: "sop" as const,
      status: "failed" as const,
      assignedTo: "comercial",
      error: "No se pudo abrir la web. Timeout a los 20s.",
      plan: [
        { id: "s1", title: "Leer home", status: "failed" as const, durationMs: 20000 },
      ],
    },
  ];

  for (const t of tasks) {
    await db.put(OWNER, "tasks", {
      id: t.id,
      tenantId: OWNER,
      title: t.title,
      prompt: t.title,
      kind: t.kind,
      status: t.status,
      assignedTo: t.assignedTo,
      plan: t.plan,
      evidence: [],
      input: {},
      state: { roleId: t.assignedTo },
      createdAt: iso(-3600_000),
      updatedAt: iso(-60_000),
      attempts: 1,
      leaseId: null,
      leaseUntil: null,
      artifactIds: [],
      ...(t.question ? { question: t.question } : {}),
      ...(t.result ? { result: t.result } : {}),
      ...(t.error ? { error: t.error } : {}),
    });
  }
  return tasks.length;
}

async function seedApprovals(db: Store): Promise<number> {
  const now = Date.now();
  const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString();

  const approvals = [
    {
      id: "demo-action-1",
      title: "Enviar factura Acme (350 EUR)",
      kind: "email.send",
      data: { to: ["acme@example.com"], subject: "Factura septiembre", body: "Adjunto la factura." },
      status: "awaiting_review" as const,
      amount: 350,
    },
    {
      id: "demo-action-2",
      title: "Cobro Consultoria Norte (7.900 EUR)",
      kind: "email.send",
      data: { to: ["norte@example.com"], subject: "Recordatorio de pago", body: "Os recuerdo el pago pendiente." },
      status: "awaiting_review" as const,
      amount: 7900,
    },
    {
      id: "demo-action-3",
      title: "Cobro Proyecto Delta (12.000 EUR)",
      kind: "email.send",
      data: { to: ["delta@example.com"], subject: "Confirmacion de cobro", body: "Confirmo el cobro acordado." },
      status: "awaiting_review" as const,
      amount: 12000,
    },
  ];

  for (const a of approvals) {
    await db.put(OWNER, "actions", {
      id: a.id,
      taskId: undefined,
      title: a.title,
      kind: a.kind,
      data: a.data,
      status: a.status,
      hash: `demo-hash-${a.id}`,
      createdAt: iso(-7200_000),
      expiresAt: iso(1800_000),
      signers: [],
      needed: a.amount >= 5000 ? 2 : 1,
      executeAt: null,
    });
  }
  return approvals.length;
}

async function seedBusinessRecords(db: Store): Promise<number> {
  const records = [
    { id: "lead-1", type: "lead", business: "Peluqueria Aurora", city: "Valencia", status: "contactado", value: 800 },
    { id: "lead-2", type: "lead", business: "Bar La Esquina", city: "Valencia", status: "nuevo", value: 1200 },
    { id: "lead-3", type: "lead", business: "Gimnasio FitZone", city: "Paterna", status: "cerrado", value: 2400 },
    { id: "lead-4", type: "lead", business: "Clinica Dental Sonrisa", city: "Valencia", status: "contactado", value: 1800 },
    { id: "client-1", type: "client", name: "Peluqueria Aurora", status: "activo", monthly_fee: 350 },
    { id: "client-2", type: "client", name: "Gimnasio FitZone", status: "activo", monthly_fee: 500 },
    { id: "inv-1", type: "invoice", client_id: "client-1", amount: 350, status: "cobrada", month: "2026-09" },
    { id: "inv-2", type: "invoice", client_id: "client-2", amount: 500, status: "pendiente", month: "2026-09" },
  ];
  for (const r of records) {
    await db.put(OWNER, "business-records", r as { id: string });
  }
  return records.length;
}
async function main() {
  const root = (await import("node:path")).resolve(process.cwd());
  const dbPath = `${process.env.DATA_DIR ?? ".openmuse"}/postgres`;

  if (existsSync(".env")) process.loadEnvFile(".env");

  const db = await createStore({
    dataDir: dbPath,
    databaseUrl: process.env.DATABASE_URL,
  });

  try {
    // Comprobacion idempotente: si el owner demo ya tiene roles, no reescribimos.
    const existing = await db.list<AgentRole>(OWNER, "agent-roles");
    if (existing.length > 0) {
      console.log(`SKIP: el tenant demo ya tiene ${existing.length} roles. Nada que hacer.`);
      return;
    }

    console.log("Sembrando tenant demo...");
    const roles = await seedRoles(db);
    console.log(`  + ${roles} roles`);
    const mems = await seedMemories(db);
    console.log(`  + ${mems} memorias`);
    // DEMO_SEED_TASKS_V1
    const tasks = await seedTasks(db);
    console.log(`  + ${tasks} tareas`);
    const approvals = await seedApprovals(db);
    console.log(`  + ${approvals} aprobaciones`);
    const records = await seedBusinessRecords(db);
    console.log(`  + ${records} business records`);

    // Usuario admin demo (si no existe).
    const users = new UserService(db);
    const existingUser = await users.getByEmail(ADMIN_EMAIL);
    if (!existingUser) {
      await users.create({
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        password: ADMIN_PASSWORD,
        role: "admin",
      });
      console.log(`  + usuario ${ADMIN_EMAIL}`);
    } else {
      console.log(`  = usuario ${ADMIN_EMAIL} ya existe`);
    }

    console.log("");
    console.log(`OK: tenant demo listo en ${root}`);
    console.log(`    Owner: ${OWNER}`);
    console.log(`    Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } finally {
    await db.close();
  }
}

void main().catch((err) => {
  console.error("FALLO:", err);
  process.exit(1);
});