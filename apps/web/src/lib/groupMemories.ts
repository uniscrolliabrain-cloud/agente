// E1_GROUP_MEMORIES_V1 - agrupar, filtrar y detectar duplicados.
export interface Memory {
  id: string;
  text: string;
  category: string;
  tags: string[];
  roleId?: string | null;
}

export interface GroupFilter {
  q?: string;
  category?: string;
  roleId?: string;
}

export function groupMemories(
  list: Memory[],
  roleName: (id: string) => string,
  filter: GroupFilter,
): Array<[string, Memory[]]> {
  const q = filter.q?.toLowerCase().trim();
  const out = new Map<string, Memory[]>();
  for (const m of list) {
    if (filter.category && m.category !== filter.category) continue;
    if (filter.roleId && m.roleId !== filter.roleId) continue;
    if (q && !(m.text.toLowerCase().includes(q) || m.tags.some((t) => t.includes(q)))) continue;
    const key = m.roleId ? `Rol: ${roleName(m.roleId)}` : m.category;
    const bucket = out.get(key) ?? [];
    bucket.push(m);
    out.set(key, bucket);
  }
  return [...out.entries()].sort(([a], [b]) => a.localeCompare(b, "es"));
}

const TOKENS = (s: string): Set<string> => {
  const norm = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return new Set(norm.match(/[a-z0-9]{3,}/g) ?? []);
};

export function similarity(a: string, b: string): number {
  const A = TOKENS(a);
  const B = TOKENS(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

export interface DuplicateCandidate {
  memory: Memory;
  score: number;
}

export function findDuplicate(
  text: string,
  list: Memory[],
  threshold = 0.6,
): DuplicateCandidate | null {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, " ");
  const exact = list.find(
    (m) => m.text.trim().toLowerCase().replace(/\s+/g, " ") === normalized,
  );
  if (exact) return { memory: exact, score: 1 };
  let best: DuplicateCandidate | null = null;
  for (const m of list) {
    const score = similarity(text, m.text);
    if (score >= threshold && (!best || score > best.score)) best = { memory: m, score };
  }
  return best;
}