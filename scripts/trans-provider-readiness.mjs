// Supplemental contract for Trans00–06. No runtime authority, no fake success.
// Explicitly named read-only probes only. No output of secrets or provider payloads.
import { pathToFileURL } from "node:url";
// CONTRACT_REGISTRY_LINK_V1 - los nombres de este contrato salen del registro
// de conexiones del producto (scripts/lib/connections.ts), no de una segunda
// tabla escrita a mano. Antes habia dos tablas que ya decian cosas distintas:
// esta no cubria FAST/SLOW/EMBEDDINGS_LLM_API_KEY ni WORKER_TOKEN, y el registro
// no cubria migraciones ni fixtures. Ahora un nombre nuevo de campana o esta en
// el registro o se declara aqui como CAMPAIGN_ONLY; si no, el contrato falla.
import { CONNECTION_NAMES } from "./lib/connections.ts";

export const REGISTRY_NAMES = new Set(CONNECTION_NAMES);

/** Nombres que solo existen para certificar una campana: fixtures y extras. */
export const CAMPAIGN_ONLY = new Set([
  "TEST_TENANT_ID",
  "TEST_OWNER_ID",
  "GOOGLE_TEST_ACCOUNT_EMAIL",
  "GOOGLE_TEST_DOCUMENT_ID",
  "GOOGLE_TEST_SPREADSHEET_ID",
  "GOOGLE_TEST_PRESENTATION_ID",
  "GOOGLE_CLOUD_PROJECT",
  "GOOGLE_CLOUD_LOCATION",
  "OTEL_EXPORTER_OTLP_ENDPOINT",
  "OTEL_EXPORTER_OTLP_HEADERS",
  "SENTRY_AUTH_TOKEN",
  "SENTRY_ORG",
  "SENTRY_PROJECT",
  "GRAFANA_CLOUD_TOKEN",
  "VERCEL_ORG_ID",
  "VERCEL_PROJECT_ID",
  "ANAM_API_KEY",
  "ANAM_AVATAR_ID",
  "ANAM_AVATAR_ID_2",
  "JEV_API_KEY",
  "MUSE_API_KEY",
  "ELEVENLABS_VOICE_ID",
  "SUPABASE_SECRET",
  "FAST_LLM_MODEL",
  "SLOW_LLM_MODEL",
  "EMBEDDINGS_LLM_PROVIDER",
  "EMBEDDINGS_LLM_MODEL",
  "RESEND_FROM_EMAIL",
]);

/** Nombres que este contrato exige y el registro de conexiones no conoce. */
export function unregisteredNames(){
 return [...new Set(SPECS.flatMap(s=>s.requirements.flat()))].filter(n=>!REGISTRY_NAMES.has(n)&&!CAMPAIGN_ONLY.has(n));
}

export const SPECS = [
  {
    "id": "db-runtime",
    "campaigns": [
      "Trans00",
      "Trans01",
      "Trans05",
      "Trans06"
    ],
    "requirements": [
      [
        "DATABASE_URL"
      ],
      [
        "AGENTE_ACCESS_KEY"
      ],
      [
        "TOKEN_ENCRYPTION_KEY"
      ]
    ],
    "probe": null,
    "note": "Verify isolated test DB, roles and tenant policies."
  },
  {
    "id": "db-migrations",
    "campaigns": [
      "Trans01",
      "Trans04"
    ],
    "requirements": [
      [
        "DATABASE_MIGRATION_URL"
      ]
    ],
    "probe": null,
    "note": "Proposed migration DSN name; reconcile with runner; distinct runtime role."
  },
  {
    "id": "db-business",
    "campaigns": [
      "Trans01"
    ],
    "requirements": [
      [
        "BUSINESS_DATABASE_URL"
      ]
    ],
    "probe": null,
    "note": "Separate read-only database role."
  },
  {
    "id": "tenant-fixtures",
    "campaigns": [
      "Trans01",
      "Trans05",
      "Trans06"
    ],
    "requirements": [
      [
        "TEST_TENANT_ID"
      ],
      [
        "TEST_OWNER_ID"
      ]
    ],
    "probe": null,
    "note": "Proposed fixture names; need two tenants for negative tests."
  },
  {
    "id": "supabase-auth",
    "campaigns": [
      "Trans01"
    ],
    "requirements": [
      [
        "SUPABASE_URL"
      ]
    ],
    "probe": "supabase",
    "note": "JWKS only, not JWT or isolation certification."
  },
  {
    "id": "supabase-admin",
    "campaigns": [
      "Trans01"
    ],
    "requirements": [
      [
        "SUPABASE_SECRET_KEY",
        "SUPABASE_SECRET"
      ]
    ],
    "probe": null,
    "note": "Not JWT signing secret or database DSN."
  },
  {
    "id": "fast-muse",
    "campaigns": [
      "Trans02",
      "Trans05",
      "Trans06"
    ],
    "requirements": [
      [
        "MUSE_API_KEY"
      ],
      [
        "FAST_LLM_MODEL"
      ]
    ],
    "probe": null,
    "note": "Confirm actual Fast port and Muse endpoint."
  },
  {
    "id": "slow-deepseek",
    "campaigns": [
      "Trans02",
      "Trans05",
      "Trans06"
    ],
    "requirements": [
      [
        "OPEN_ROUTER_API_KEY"
      ],
      [
        "SLOW_LLM_MODEL"
      ]
    ],
    "probe": "slow",
    "note": "Independent account; never alias to JEV."
  },
  {
    "id": "jev",
    "campaigns": [
      "Trans02",
      "Trans05",
      "Trans06"
    ],
    "requirements": [
      [
        "OPENROUTER_API_KEY"
      ]
    ],
    "probe": "jev",
    "note": "Independent account; model and runtime routing pending."
  },
  {
    "id": "jev-service",
    "campaigns": [
      "Trans02"
    ],
    "requirements": [
      [
        "JEV_API_KEY"
      ]
    ],
    "probe": null,
    "note": "Only if required by actual JEV service port."
  },
  {
    "id": "embeddings",
    "campaigns": [
      "Trans02",
      "Trans05",
      "Trans06"
    ],
    "requirements": [
      [
        "EMBEDDINGS_LLM_PROVIDER"
      ],
      [
        "EMBEDDINGS_LLM_MODEL"
      ],
      [
        "EMBEDDINGS_LLM_API_KEY"
      ]
    ],
    "probe": null,
    "note": "Verify actual model, dimensions and index; no Fast fallback in certification."
  },
  {
    "id": "google-workspace",
    "campaigns": [
      "Trans03",
      "Trans05"
    ],
    "requirements": [
      [
        "GOOGLE_CLIENT_ID"
      ],
      [
        "GOOGLE_CLIENT_SECRET"
      ],
      [
        "GOOGLE_REFRESH_TOKEN"
      ],
      [
        "GOOGLE_TEST_ACCOUNT_EMAIL"
      ]
    ],
    "probe": "google",
    "note": "Dogfood only; actual runtime OAuth per user and tenant."
  },
  {
    "id": "google-docs",
    "campaigns": [
      "Trans03",
      "Trans05"
    ],
    "requirements": [
      [
        "GOOGLE_TEST_DOCUMENT_ID"
      ]
    ],
    "probe": null,
    "note": "Proposed fixture; shares google-workspace credentials."
  },
  {
    "id": "google-sheets",
    "campaigns": [
      "Trans03",
      "Trans05"
    ],
    "requirements": [
      [
        "GOOGLE_TEST_SPREADSHEET_ID"
      ]
    ],
    "probe": null,
    "note": "Proposed fixture; shares google-workspace credentials."
  },
  {
    "id": "google-slides",
    "campaigns": [
      "Trans03",
      "Trans05"
    ],
    "requirements": [
      [
        "GOOGLE_TEST_PRESENTATION_ID"
      ]
    ],
    "probe": null,
    "note": "Proposed fixture; shares google-workspace credentials."
  },
  {
    "id": "google-places",
    "campaigns": [
      "Trans03"
    ],
    "requirements": [
      [
        "GOOGLE_MAPS_API_KEY"
      ]
    ],
    "probe": "places",
    "note": "Read-only query; may incur quota/cost."
  },
  {
    "id": "gemini",
    "campaigns": [
      "Trans02",
      "Trans03",
      "Trans05"
    ],
    "requirements": [
      [
        "GEMINI_API_KEY",
        "GOOGLE_API_KEY"
      ]
    ],
    "probe": "gemini",
    "note": "Catalog only; inference not certified."
  },
  {
    "id": "vertex-rag",
    "campaigns": [
      "Trans02",
      "Trans05"
    ],
    "requirements": [
      [
        "GOOGLE_CLOUD_PROJECT"
      ],
      [
        "GOOGLE_CLOUD_LOCATION"
      ]
    ],
    "probe": null,
    "note": "Requires ADC/workload identity, IAM and corpus; not Gemini API key."
  },
  {
    "id": "whatsapp",
    "campaigns": [
      "Trans03"
    ],
    "requirements": [
      [
        "WHATSAPP_TOKEN",
        "WHATSAPP_ACCESS_TOKEN"
      ],
      [
        "WHATSAPP_PHONE_ID",
        "WHATSAPP_PHONE_NUMBER_ID"
      ],
      [
        "WHATSAPP_BUSINESS_ACCOUNT_ID",
        "WHATSAPP_WABA_ID"
      ]
    ],
    "probe": "whatsapp",
    "note": "Phone metadata only; no sends."
  },
  {
    "id": "whatsapp-inbound",
    "campaigns": [
      "Trans03"
    ],
    "requirements": [
      [
        "WHATSAPP_APP_SECRET"
      ],
      [
        "WHATSAPP_VERIFY_TOKEN"
      ],
      [
        "WHATSAPP_WEBHOOK_BINDINGS"
      ]
    ],
    "probe": null,
    "note": "Validate signature, tenant, owner, SOP and replay."
  },
  {
    "id": "resend",
    "campaigns": [
      "Trans03"
    ],
    "requirements": [
      [
        "RESEND_API_KEY"
      ],
      [
        "EMAIL_FROM",
        "RESEND_FROM",
        "RESEND_FROM_EMAIL"
      ]
    ],
    "probe": "resend",
    "note": "Domain-list permission only; no sends."
  },
  {
    "id": "vapi",
    "campaigns": [
      "Trans03"
    ],
    "requirements": [
      [
        "VAPI_API_KEY"
      ],
      [
        "VAPI_ASSISTANT_ID"
      ]
    ],
    "probe": "vapi",
    "note": "Assistant metadata only; no calls."
  },
  {
    "id": "vapi-inbound",
    "campaigns": [
      "Trans03"
    ],
    "requirements": [
      [
        "VAPI_WEBHOOK_SECRET"
      ]
    ],
    "probe": null,
    "note": "If webhook enabled; verify existing route."
  },
  {
    "id": "vapi-outbound",
    "campaigns": [
      "Trans03"
    ],
    "requirements": [
      [
        "VAPI_PHONE_NUMBER_ID"
      ]
    ],
    "probe": null,
    "note": "Keep outbound disabled until approved."
  },
  {
    "id": "anam",
    "campaigns": [
      "Trans03"
    ],
    "requirements": [
      [
        "ANAM_API_KEY"
      ],
      [
        "ANAM_AVATAR_ID",
        "ANAM_AVATAR_ID_2"
      ]
    ],
    "probe": null,
    "note": "Confirm exact avatar API contract."
  },
  {
    "id": "elevenlabs",
    "campaigns": [
      "Trans03"
    ],
    "requirements": [
      [
        "ELEVENLABS_API_KEY"
      ],
      [
        "ELEVENLABS_VOICE_ID"
      ]
    ],
    "probe": "elevenlabs",
    "note": "Voice metadata only; no synthesis."
  },
  {
    "id": "composio",
    "campaigns": [
      "Trans03"
    ],
    "requirements": [
      [
        "COMPOSIO_API_KEY"
      ]
    ],
    "probe": null,
    "note": "Optional; selected toolkit and account binding."
  },
  {
    "id": "apify",
    "campaigns": [
      "Trans03"
    ],
    "requirements": [
      [
        "APIFY_TOKEN"
      ]
    ],
    "probe": "apify",
    "note": "Account metadata only; no actor runs."
  },
  {
    "id": "facebook-pages",
    "campaigns": [
      "Trans03"
    ],
    "requirements": [],
    "probe": null,
    "note": "Optional per-page ID/token pair and explicit tenant binding."
  },
  {
    "id": "grafana-api",
    "campaigns": [
      "Trans04"
    ],
    "requirements": [
      [
        "GRAFANA_URL"
      ],
      [
        "GRAFANA_SERVICE_ACCOUNT_TOKEN"
      ]
    ],
    "probe": "grafana",
    "note": "Authenticated org API only."
  },
  {
    "id": "grafana-cloud",
    "campaigns": [
      "Trans04"
    ],
    "requirements": [
      [
        "GRAFANA_CLOUD_TOKEN"
      ]
    ],
    "probe": null,
    "note": "Need ingest endpoints and instance IDs for each signal."
  },
  {
    "id": "otlp",
    "campaigns": [
      "Trans04"
    ],
    "requirements": [
      [
        "OTEL_EXPORTER_OTLP_ENDPOINT"
      ],
      [
        "OTEL_EXPORTER_OTLP_HEADERS"
      ]
    ],
    "probe": null,
    "note": "Exporter protocol and actual receipt verification pending."
  },
  {
    "id": "metrics",
    "campaigns": [
      "Trans04"
    ],
    "requirements": [
      [
        "METRICS_TOKEN"
      ],
      [
        "PUBLIC_API_URL"
      ]
    ],
    "probe": null,
    "note": "Scraper endpoint and tenant scope."
  },
  {
    "id": "sentry-dsn",
    "campaigns": [
      "Trans04"
    ],
    "requirements": [
      [
        "SENTRY_DSN"
      ]
    ],
    "probe": null,
    "note": "SDK and actual receipt required."
  },
  {
    "id": "sentry-release",
    "campaigns": [
      "Trans04"
    ],
    "requirements": [
      [
        "SENTRY_AUTH_TOKEN"
      ],
      [
        "SENTRY_ORG"
      ],
      [
        "SENTRY_PROJECT"
      ]
    ],
    "probe": "sentry",
    "note": "Project read only; no release upload."
  },
  {
    "id": "alerts",
    "campaigns": [
      "Trans04"
    ],
    "requirements": [],
    "probe": null,
    "note": "Receiver and authentication must be selected."
  },
  {
    "id": "fly",
    "campaigns": [
      "Trans04"
    ],
    "requirements": [
      [
        "FLY_API_TOKEN"
      ],
      [
        "FLY_APP_NAME"
      ]
    ],
    "probe": "fly",
    "note": "App metadata; no deploy."
  },
  {
    "id": "vercel",
    "campaigns": [
      "Trans04"
    ],
    "requirements": [
      [
        "VERCEL_TOKEN"
      ],
      [
        "VERCEL_ORG_ID"
      ],
      [
        "VERCEL_PROJECT_ID"
      ]
    ],
    "probe": "vercel",
    "note": "Project metadata; no deploy."
  },
  {
    "id": "backups",
    "campaigns": [
      "Trans04"
    ],
    "requirements": [],
    "probe": null,
    "note": "Isolated backup storage and restore drill."
  },
  {
    "id": "knowledge-sources",
    "campaigns": [
      "Trans05"
    ],
    "requirements": [],
    "probe": null,
    "note": "Explicit authorized source and tenant scope."
  },
  {
    "id": "attention",
    "campaigns": [
      "Trans06"
    ],
    "requirements": [],
    "probe": null,
    "note": "Uses shared DB and model contracts."
  },
  {
    "id": "convergence",
    "campaigns": [
      "Trans00"
    ],
    "requirements": [],
    "probe": null,
    "note": "Requires actual CI, integration evidence and receipts."
  }
];
export function inspect(spec,env){
 const present=[],missing=[],issues=[];
 for(const aliases of spec.requirements){const key=aliases.find(k=>typeof env[k]==="string"&&env[k].trim()&&!/^(stub|todo|changeme|placeholder)$/i.test(env[k].trim()));if(key)present.push(key);else missing.push(aliases[0]);}
 if(spec.id==="db-runtime"&&env.TOKEN_ENCRYPTION_KEY&&!/^[A-Za-z0-9+/]{43}=$/.test(env.TOKEN_ENCRYPTION_KEY.trim()))issues.push("INVALID_ENCRYPTION_KEY_SHAPE");
 if(spec.id==="db-runtime"&&env.AGENTE_ACCESS_KEY&&env.AGENTE_ACCESS_KEY.trim().length<24)issues.push("ACCESS_KEY_TOO_SHORT");
 if(spec.id==="db-migrations"&&env.DATABASE_MIGRATION_URL&&env.DATABASE_MIGRATION_URL===env.DATABASE_URL)issues.push("MIGRATION_DSN_EQUALS_RUNTIME");
 if(spec.id==="db-business"&&env.BUSINESS_DATABASE_URL&&env.BUSINESS_DATABASE_URL===env.DATABASE_URL)issues.push("BUSINESS_DSN_EQUALS_RUNTIME");
 if(["slow-deepseek","jev"].includes(spec.id)&&env.OPEN_ROUTER_API_KEY&&env.OPEN_ROUTER_API_KEY===env.OPENROUTER_API_KEY)issues.push("SLOW_JEV_KEYS_IDENTICAL");
 return {id:spec.id,campaigns:spec.campaigns,present,missing,issues,status:issues.length?"invalid_config":missing.length?"stub_missing_config":spec.probe?"configured_unverified":"stub_wiring_pending"};
}
export function classify(status){
 if(status>=200&&status<300)return "probe_pass";
 return ({401:"authentication_failed",403:"permission_denied",404:"resource_not_found",429:"quota_or_rate_limit"})[status]||"http_failure";
}
function httpsBase(value){
 const u=new URL(value);
 if(u.protocol!=="https:"||u.username||u.password||u.search||u.hash)throw new Error("invalid_config");
 return u.href.replace(/\/+$/,"");
}
export async function probe(spec,env,fetcher=globalThis.fetch){
 const row=inspect(spec,env);
 if(row.status!=="configured_unverified")return row;
 const read=(...keys)=>keys.map(k=>env[k]?.trim()).find(Boolean);
 const auth=k=>({Authorization:"Bearer "+read(k)});
 const get=async(url,headers={},body)=>fetcher(url,{method:body?"POST":"GET",headers,body,redirect:"error",signal:AbortSignal.timeout(15000)});
 const checks=[];
 const check=async(name,url,headers,body)=>{
  const r=await get(url,headers,body);
  checks.push({name,http:r.status,status:classify(r.status)});
  if(r.body)await r.body.cancel();
 };
 try{
 switch(spec.probe){
 case "supabase":await check("jwks",httpsBase(read("SUPABASE_URL"))+"/auth/v1/.well-known/jwks.json");break;
 case "slow":case "jev":await check("key","https://openrouter.ai/api/v1/key",auth(spec.probe==="slow"?"OPEN_ROUTER_API_KEY":"OPENROUTER_API_KEY"));break;
 case "gemini":await check("models","https://generativelanguage.googleapis.com/v1beta/models?pageSize=1",{"x-goog-api-key":read("GEMINI_API_KEY","GOOGLE_API_KEY")});break;
 case "places":await check("places","https://places.googleapis.com/v1/places:searchText",{"X-Goog-Api-Key":read("GOOGLE_MAPS_API_KEY"),"X-Goog-FieldMask":"places.id","Content-Type":"application/json"},JSON.stringify({textQuery:"Madrid Spain"}));break;
 case "google":{
  const r=await get("https://oauth2.googleapis.com/token",{"Content-Type":"application/x-www-form-urlencoded"},new URLSearchParams({client_id:read("GOOGLE_CLIENT_ID"),client_secret:read("GOOGLE_CLIENT_SECRET"),refresh_token:read("GOOGLE_REFRESH_TOKEN"),grant_type:"refresh_token"}).toString());
  checks.push({name:"refresh",http:r.status,status:classify(r.status)});
  if(!r.ok){if(r.body)await r.body.cancel();break;}
  const data=await r.json();
  if(typeof data.access_token!=="string"||!data.access_token){checks.push({name:"access-token-shape",status:"invalid_response"});break;}
  const scopes=["gmail.modify","drive.readonly","drive.file","calendar.readonly","calendar.events","meetings.space.created","meetings.space.readonly","documents","spreadsheets","presentations","contacts.readonly","tasks"].map(s=>"https://www.googleapis.com/auth/"+s);
  const granted=new Set(typeof data.scope==="string"?data.scope.split(/\s+/):[]);
  checks.push({name:"requested-scopes",status:scopes.every(s=>granted.has(s))?"probe_pass":"scopes_unverified"});
  const h={Authorization:"Bearer "+data.access_token};
  const p=await get("https://gmail.googleapis.com/gmail/v1/users/me/profile",h);
  checks.push({name:"gmail",http:p.status,status:classify(p.status)});
  if(p.ok){
   const profile=await p.json(),expected=read("GOOGLE_TEST_ACCOUNT_EMAIL");
   checks.push({name:"dogfood-account",status:expected?(profile.emailAddress?.toLowerCase()===expected.toLowerCase()?"probe_pass":"account_mismatch"):"account_unverified"});
   if(!expected||profile.emailAddress?.toLowerCase()!==expected.toLowerCase())break;
  }else{if(p.body)await p.body.cancel();break;}
  for(const [name,url] of Object.entries({drive:"https://www.googleapis.com/drive/v3/files?pageSize=1",calendar:"https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1",meet:"https://meet.googleapis.com/v2/conferenceRecords?pageSize=1",people:"https://people.googleapis.com/v1/people/me/connections?personFields=names&pageSize=1",tasks:"https://tasks.googleapis.com/tasks/v1/users/@me/lists?maxResults=1"}))await check(name,url,h);
  break;
 }
 case "whatsapp":{
  const version=read("WHATSAPP_GRAPH_VERSION")||"v21.0";
  if(!/^v\d+\.\d+$/.test(version))throw new Error("invalid_config");
  await check("phone","https://graph.facebook.com/"+version+"/"+encodeURIComponent(read("WHATSAPP_PHONE_ID","WHATSAPP_PHONE_NUMBER_ID"))+"?fields=id",{Authorization:"Bearer "+read("WHATSAPP_TOKEN","WHATSAPP_ACCESS_TOKEN")});break;
 }
 case "resend":await check("domains","https://api.resend.com/domains",auth("RESEND_API_KEY"));break;
 case "vapi":await check("assistant","https://api.vapi.ai/assistant/"+encodeURIComponent(read("VAPI_ASSISTANT_ID")),auth("VAPI_API_KEY"));break;
 case "elevenlabs":await check("voice","https://api.elevenlabs.io/v1/voices/"+encodeURIComponent(read("ELEVENLABS_VOICE_ID")),{"xi-api-key":read("ELEVENLABS_API_KEY")});break;
 case "apify":await check("account","https://api.apify.com/v2/users/me",auth("APIFY_TOKEN"));break;
 case "grafana":await check("org",httpsBase(read("GRAFANA_URL"))+"/api/org",auth("GRAFANA_SERVICE_ACCOUNT_TOKEN"));break;
 case "sentry":await check("project","https://sentry.io/api/0/projects/"+encodeURIComponent(read("SENTRY_ORG"))+"/"+encodeURIComponent(read("SENTRY_PROJECT"))+"/",auth("SENTRY_AUTH_TOKEN"));break;
 case "fly":await check("app","https://api.machines.dev/v1/apps/"+encodeURIComponent(read("FLY_APP_NAME")),auth("FLY_API_TOKEN"));break;
 case "vercel":await check("project","https://api.vercel.com/v9/projects/"+encodeURIComponent(read("VERCEL_PROJECT_ID"))+"?teamId="+encodeURIComponent(read("VERCEL_ORG_ID")),auth("VERCEL_TOKEN"));break;
 default:return {...row,status:"stub_wiring_pending"};
 }
 }catch(error){checks.push({name:"transport",status:error?.message==="invalid_config"?"invalid_config":error?.name==="TimeoutError"?"timeout":"transport_or_response_error"});}
 return {...row,status:checks.length&&checks.every(c=>c.status==="probe_pass")?"probe_pass":"probe_failed",checks};
}
export async function main(args,env=process.env){
 const filter=args.find(a=>a.startsWith("--only="));
 const only=filter?filter.slice(7).split(",").filter(Boolean):[];
 const live=args.includes("--probe");
 if(args.some(a=>!["--probe","--strict"].includes(a)&&!a.startsWith("--only=")))throw new Error("Unsupported option");
 if(live&&!only.length)throw new Error("Explicit --only required");
 if(only.some(id=>!SPECS.some(s=>s.id===id)))throw new Error("Unknown provider id");
 const rows=[];
 for(const spec of SPECS.filter(s=>!only.length||only.includes(s.id)))rows.push(live?await probe(spec,env):inspect(spec,env));
 const unregistered=unregisteredNames();
 console.log(JSON.stringify({schemaVersion:1,mode:live?"read-only-probe":"offline-contract",certifiesRuntime:false,registry:{source:"scripts/lib/connections.ts",names:REGISTRY_NAMES.size,unregistered},rows},null,2));
 return args.includes("--strict")&&(unregistered.length>0||rows.some(r=>r.status!=="probe_pass"))?1:0;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{process.exitCode=await main(process.argv.slice(2));}catch{console.error("Invalid invocation or internal readiness error");process.exitCode=2;}}
