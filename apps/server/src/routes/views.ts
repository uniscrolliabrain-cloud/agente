// ROUTES_VIEWS_V1 - POST /api/views/resolve
// Recibe {intent}, usa kernel.readView para contexto, devuelve ViewSpec o FormSpec.
import type { FastifyInstance } from "fastify";
import { z } from "zod";
const bodySchema=z.object({intent:z.string().min(1).max(1000),context:z.record(z.string(),z.unknown()).optional()});
export async function viewsRoutes(app:FastifyInstance){
 app.post("/api/views/resolve",async(req,reply)=>{
  const parsed=bodySchema.safeParse((req as any).body);
  if(!parsed.success)return reply.code(400).send({error:parsed.error.message});
  const {intent}=parsed.data;
  // TODO: IntentResolver + Views.readView
  // Placeholder que respeta contrato ViewSpec minimo para que el frontend pinte fallback.
  const spec={
   id:`view_${Date.now()}`,kind:"collection",layout:"list",title:intent.slice(0,80),
   columns:[{key:"id",label:"ID",type:"text"}],dataSource:[{kind:"business-graph",query:intent,tenantId:"unknown",bindings:{}}],
   provenance:{intent,source:"views.resolve.stub"},
  };
  return reply.send({spec});
 });
}