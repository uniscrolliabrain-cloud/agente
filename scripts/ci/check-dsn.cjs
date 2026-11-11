// CHECK_DSN_V1 - valida un DSN Postgres sin imprimir la contrasena.
// Lo usa .github/workflows/configure-prod-db.yml antes de tocar Fly.
const { Client } = require("pg");

(async () => {
  let dsn = process.env.DSN || "";
  if (!/^postgres(ql)?:\/\//i.test(dsn)) {
    console.error("El DSN no empieza por postgres:// o postgresql://");
    process.exit(2);
  }
  // Supabase exige TLS; si el DSN no lo pide, se pide aqui.
  if (!/[?&]sslmode=/i.test(dsn)) dsn += (dsn.includes("?") ? "&" : "?") + "sslmode=require";

  const url = new URL(dsn);
  const client = new Client({ connectionString: dsn, connectionTimeoutMillis: 15000 });
  await client.connect();

  const who = await client.query("select current_user as u, current_database() as d, version() as v");
  const one = async (sql, fallback) => {
    try {
      return await client.query(sql);
    } catch {
      return fallback;
    }
  };
  const vec = await one("select extversion from pg_extension where extname = 'vector'", null);
  const role = await one("select rolbypassrls from pg_roles where rolname = current_user", null);
  const tables = await one(
    "select count(*)::int as n from information_schema.tables where table_schema = 'public'",
    null,
  );
  const policies = await one("select count(*)::int as n from pg_policies", null);

  console.log(
    JSON.stringify({
      host: url.host,
      port: url.port || "5432",
      db: url.pathname.slice(1),
      user: who.rows[0].u,
      server: String(who.rows[0].v).split(",")[0],
      pgvector: Boolean(vec && vec.rowCount === 1),
      rol_bypassrls: role?.rows?.[0]?.rolbypassrls ?? null,
      tablas_public: tables?.rows?.[0]?.n ?? null,
      politicas_rls: policies?.rows?.[0]?.n ?? null,
    }),
  );
  await client.end();
})().catch((error) => {
  console.error("Fallo de conexion:", error.code || error.message);
  if (/ENETUNREACH|EHOSTUNREACH|EAI_AGAIN/i.test(String(error.code) + error.message)) {
    console.error(
      "Pista: parece un DSN IPv6 directo (db.<ref>.supabase.co). Usa el pooler: puerto 6543 y host *.pooler.supabase.com.",
    );
  }
  process.exit(1);
});
