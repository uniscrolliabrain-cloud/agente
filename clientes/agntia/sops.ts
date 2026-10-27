// AGENCY_SOPS_V1 - las SOPs con las que opera la agencia (tenant `agntia`).
//
// Reglas de diseno de esta primera tanda:
//   - Solo herramientas que funcionan en el despliegue de fase 1
//     (`COMPUTER_ENABLED=false`, sin sandbox Python): por eso no hay
//     `computer_command` ni `skillId`. Donde antes habia un script, hay
//     `llm_generate` + `save_artifact`.
//   - `query_business` consulta el schema del tenant (`clientes/agntia/agency.json`
//     define lead/client/invoice/call).
//   - Todo lo que manda algo a un tercero termina en `prepare_email` o
//     `prepare_event`: son propuestas que requieren aprobacion, nunca envios
//     automaticos.
//   - `allowedTools` se declara por SOP y el executor lo verifica paso a paso.
//
// Esto no sustituye al guion comercial: es el esqueleto ejecutable. Los textos
// que el fundador quiera cambiar viven aqui, no en el codigo del motor.

import { sopSchema, type SOP } from "../../packages/domain/src/sop.ts";

const draft = sopSchema.parse({
  id: "resumen-negocio",
  name: "Resumen del negocio",
  description: "Informe semanal de leads, clientes y facturacion de la agencia.",
  category: "Operaciones",
  trigger: { type: "cron", value: "weekly:fri:18:00" },
  allowedTools: ["query_business", "llm_generate", "save_artifact", "prepare_email"],
  steps: [
    {
      id: "leads",
      title: "Leer leads",
      tool: "query_business",
      params: { source: "postgres", query: "SELECT * FROM records WHERE type = 'lead'" },
    },
    {
      id: "clientes",
      title: "Leer clientes",
      tool: "query_business",
      params: { source: "postgres", query: "SELECT * FROM records WHERE type = 'client'" },
    },
    {
      id: "facturas",
      title: "Leer facturas",
      tool: "query_business",
      params: { source: "postgres", query: "SELECT * FROM records WHERE type = 'invoice'" },
    },
    {
      id: "informe",
      title: "Redactar el informe",
      tool: "llm_generate",
      params: {
        instruction:
          "Resume en castellano, en menos de 200 palabras, la semana de la agencia: leads nuevos, " +
          "leads contactados sin respuesta, clientes activos, facturas cobradas y pendientes. " +
          "Termina con una sola accion recomendada para la proxima semana. " +
          "Datos: leads={{leads}} clientes={{clientes}} facturas={{facturas}}",
      },
    },
    {
      id: "guardar",
      title: "Guardar el informe",
      tool: "save_artifact",
      params: {
        kind: "report",
        title: "Resumen del negocio",
        summary: "Leads, clientes y facturacion de la semana",
        data: { informe: "{{informe}}", leads: "{{leads}}", clientes: "{{clientes}}", facturas: "{{facturas}}" },
      },
    },
    {
      id: "enviar",
      title: "Preparar el email del informe",
      tool: "prepare_email",
      required: false,
      params: {
        to: ["{{input.email}}"],
        subject: "Resumen de la semana",
        body: "{{informe}}",
      },
    },
  ],
});

const followUp = sopSchema.parse({
  id: "follow-up-3-dias",
  name: "Follow-up de leads parados",
  description: "Detecta leads contactados sin respuesta y prepara el recordatorio.",
  category: "Ventas",
  trigger: { type: "cron", value: "daily:09:00" },
  allowedTools: ["query_business", "llm_generate", "prepare_email"],
  steps: [
    {
      id: "parados",
      title: "Leads contactados",
      tool: "query_business",
      params: {
        source: "postgres",
        query: "SELECT * FROM records WHERE type = 'lead' AND status = 'contactado'",
      },
    },
    {
      id: "mensaje",
      title: "Redactar el recordatorio",
      tool: "llm_generate",
      params: {
        instruction:
          "Para cada lead de la lista, escribe un recordatorio de maximo 60 palabras, en el tono de " +
          "la agencia (directo, sin jerga), con una sola pregunta al final. No inventes datos del " +
          "negocio. Leads: {{parados}}",
      },
    },
    {
      id: "enviar",
      title: "Preparar el email de follow-up",
      tool: "prepare_email",
      params: {
        to: ["{{input.email}}"],
        subject: "Seguimos con esto?",
        body: "{{mensaje}}",
      },
    },
  ],
});

const firstContact = sopSchema.parse({
  id: "primer-contacto",
  name: "Primer contacto personalizado",
  description: "Prepara el primer email a un lead concreto, usando lo que ya sabemos del negocio.",
  category: "Ventas",
  trigger: { type: "api", value: "" },
  allowedTools: ["recall_memory", "llm_generate", "prepare_email", "save_artifact"],
  steps: [
    {
      id: "contexto",
      title: "Recuperar lo que sabemos del lead",
      tool: "recall_memory",
      params: { query: "{{input.lead}} {{input.city}} {{input.sector}}" },
    },
    {
      id: "email",
      title: "Escribir el primer email",
      tool: "llm_generate",
      params: {
        instruction:
          "Escribe un primer email en castellano a {{input.lead}} ({{input.city}}). Maximo 120 " +
          "palabras. Menciona una sola cosa concreta de su negocio, propone una llamada de 15 " +
          "minutos y no promete resultados. Contexto: {{contexto}}",
      },
    },
    {
      id: "guardar",
      title: "Guardar el borrador",
      tool: "save_artifact",
      params: {
        kind: "report",
        title: "Primer contacto: {{input.lead}}",
        summary: "Borrador listo para revisar",
        data: { email: "{{email}}", contexto: "{{contexto}}" },
      },
    },
    {
      id: "enviar",
      title: "Preparar el envio",
      tool: "prepare_email",
      params: {
        to: ["{{input.email}}"],
        subject: "Una idea para {{input.lead}}",
        body: "{{email}}",
      },
    },
  ],
});

const paymentReminder = sopSchema.parse({
  id: "recordar-pago-vencido",
  name: "Recordar pago pendiente",
  description: "Aviso amable de facturas pendientes, con la cifra exacta.",
  category: "Cobros",
  trigger: { type: "cron", value: "daily:10:00" },
  allowedTools: ["query_business", "llm_generate", "prepare_email"],
  steps: [
    {
      id: "pendientes",
      title: "Facturas pendientes",
      tool: "query_business",
      params: { source: "postgres", query: "SELECT * FROM records WHERE type = 'invoice' AND status = 'pendiente'" },
    },
    {
      id: "mensaje",
      title: "Redactar el aviso",
      tool: "llm_generate",
      params: {
        instruction:
          "Escribe un recordatorio de pago de maximo 80 palabras: importe, mes y una via de pago. " +
          "Tono cordial, sin amenazas. Facturas: {{pendientes}}",
      },
    },
    {
      id: "enviar",
      title: "Preparar el email de cobro",
      tool: "prepare_email",
      params: { to: ["{{input.email}}"], subject: "Factura pendiente", body: "{{mensaje}}" },
    },
  ],
});

const pipeline = sopSchema.parse({
  id: "revisar-pipeline",
  name: "Revisar pipeline de ventas",
  description: "Foto del pipeline por estado, con el siguiente paso por lead.",
  category: "Ventas",
  trigger: { type: "manual", value: "" },
  allowedTools: ["query_business", "llm_generate", "save_artifact"],
  steps: [
    {
      id: "leads",
      title: "Todos los leads",
      tool: "query_business",
      params: { source: "postgres", query: "SELECT * FROM records WHERE type = 'lead'" },
    },
    {
      id: "analisis",
      title: "Analizar el pipeline",
      tool: "llm_generate",
      params: {
        instruction:
          "Agrupa los leads por estado y di, para cada grupo, el siguiente paso concreto. " +
          "Senala los leads sin siguiente paso. Leads: {{leads}}",
      },
    },
    {
      id: "guardar",
      title: "Guardar la revision",
      tool: "save_artifact",
      params: { kind: "report", title: "Pipeline actual", summary: "Leads por estado", data: { analisis: "{{analisis}}" } },
    },
  ],
});

const monthly = sopSchema.parse({
  id: "conciliacion-mensual",
  name: "Conciliacion mensual",
  description: "Cuadra lo cobrado y lo pendiente del mes.",
  category: "Operaciones",
  trigger: { type: "cron", value: "monthly:1:08:00" },
  allowedTools: ["query_business", "llm_generate", "save_artifact"],
  steps: [
    {
      id: "cobradas",
      title: "Facturas cobradas",
      tool: "query_business",
      params: { source: "postgres", query: "SELECT * FROM records WHERE type = 'invoice' AND status = 'cobrada'" },
    },
    {
      id: "pendientes",
      title: "Facturas pendientes",
      tool: "query_business",
      params: { source: "postgres", query: "SELECT * FROM records WHERE type = 'invoice' AND status = 'pendiente'" },
    },
    {
      id: "cuadre",
      title: "Cuadrar el mes",
      tool: "llm_generate",
      params: {
        instruction:
          "Calcula el total cobrado, el total pendiente y la diferencia. Si hay facturas sin cliente " +
          "asociado, dilo. Cobradas: {{cobradas}} Pendientes: {{pendientes}}",
      },
    },
    {
      id: "guardar",
      title: "Guardar la conciliacion",
      tool: "save_artifact",
      params: { kind: "report", title: "Conciliacion del mes", summary: "Cobros y pendientes", data: { cuadre: "{{cuadre}}" } },
    },
  ],
});

const auditWeb = sopSchema.parse({
  id: "auditar-web-lead",
  name: "Auditar la web de un lead",
  description: "Lee la web del lead y saca tres mejoras concretas para el primer contacto.",
  category: "Ventas",
  trigger: { type: "api", value: "" },
  allowedTools: ["read_web", "llm_generate", "save_artifact"],
  steps: [
    {
      id: "home",
      title: "Leer la home",
      tool: "read_web",
      params: { url: "https://{{input.domain}}" },
    },
    {
      id: "auditoria",
      title: "Detectar mejoras",
      tool: "llm_generate",
      params: {
        instruction:
          "Con el texto de la web, escribe tres mejoras concretas y observables (mensaje, captacion, " +
          "respuesta). Nada de consejos genericos. Texto: {{home}}",
      },
    },
    {
      id: "guardar",
      title: "Guardar la auditoria",
      tool: "save_artifact",
      params: {
        kind: "report",
        title: "Auditoria {{input.domain}}",
        summary: "Tres mejoras para el primer contacto",
        data: { auditoria: "{{auditoria}}", home: "{{home}}" },
      },
    },
  ],
});

const discoveryCall = sopSchema.parse({
  id: "agendar-discovery-call",
  name: "Agendar discovery call",
  description: "Propone la cita en el calendario y guarda el resultado (requiere aprobacion).",
  category: "Ventas",
  trigger: { type: "api", value: "" },
  allowedTools: ["prepare_event", "save_artifact"],
  steps: [
    {
      id: "cita",
      title: "Proponer la cita",
      tool: "prepare_event",
      params: {
        calendarId: "primary",
        title: "Discovery call: {{input.lead}}",
        start: "{{input.start}}",
        end: "{{input.end}}",
        timeZone: "Europe/Madrid",
        description: "Llamada de 15 minutos para ver si encaja. Lead: {{input.lead}} ({{input.email}})",
        attendees: ["{{input.email}}"],
      },
    },
    {
      id: "registro",
      title: "Registrar la propuesta",
      tool: "save_artifact",
      params: {
        kind: "report",
        title: "Cita propuesta: {{input.lead}}",
        summary: "Pendiente de aprobacion en el panel",
        data: { lead: "{{input.lead}}", inicio: "{{input.start}}" },
      },
    },
  ],
});

export const agencySops: SOP[] = [
  draft,
  followUp,
  firstContact,
  paymentReminder,
  pipeline,
  monthly,
  auditWeb,
  discoveryCall,
];
