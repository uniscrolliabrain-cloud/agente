/**
 * Business Data Connector - minimal lean
 * Adapters: postgres, api, csv, sheets
 */
export interface BusinessQuery {
  source: "postgres" | "csv" | "api" | "sheets";
  query: string;
  params?: Record<string, unknown>;
}
export class BusinessDataService {
  constructor(private readonly opts: { databaseUrl?: string } = {}) {}
  async query(owner: string, q: BusinessQuery) {
    if (q.source === "api") {
      const res = await fetch(q.query).then(r=>r.json()).catch(()=>({error:"fetch failed"}));
      return { rows: Array.isArray(res) ? res : [res], summary: `Fetched ${q.query}` };
    }
    return { rows: [], summary: "Connect DATABASE_URL or API URL" };
  }
}
