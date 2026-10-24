// EXPRESSION_V1 - evaluador de expresiones simples para guards.

export function evaluateExpression(
  expr: string,
  data: Record<string, unknown>,
): boolean {
  const trimmed = expr.trim();

  // "field in [a, b, c]"
  const inMatch = trimmed.match(/^(\w+)\s+in\s+\[([^\]]*)\]$/);
  if (inMatch) {
    const [, field, list] = inMatch;
    const values = list.split(",").map((v) => v.trim().replace(/^['"]|['"]$/g, ""));
    return values.includes(String(data[field]));
  }

  // "field exists"
  const existsMatch = trimmed.match(/^(\w+)\s+exists$/);
  if (existsMatch) {
    return data[existsMatch[1]] !== undefined && data[existsMatch[1]] !== null;
  }

  // "field op value"
  const opMatch = trimmed.match(/^(\w+)\s*(>=|<=|==|!=|>|<)\s*(.+)$/);
  if (opMatch) {
    const [, field, op, rawValue] = opMatch;
    const actual = data[field];
    const expected = parseValue(rawValue);
    return compare(actual, expected, op);
  }

  return false;
}

function parseValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed.replace(/^['"]|['"]$/g, "");
}

function compare(actual: unknown, expected: unknown, op: string): boolean {
  if (typeof actual === "number" && typeof expected === "number") {
    switch (op) {
      case ">=": return actual >= expected;
      case "<=": return actual <= expected;
      case ">": return actual > expected;
      case "<": return actual < expected;
      case "==": return actual === expected;
      case "!=": return actual !== expected;
    }
  }
  switch (op) {
    case "==": return String(actual) === String(expected);
    case "!=": return String(actual) !== String(expected);
  }
  return false;
}