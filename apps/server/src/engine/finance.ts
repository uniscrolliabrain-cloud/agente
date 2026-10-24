import { z } from "zod";
import { AppError } from "../errors.ts";

/** CSV amounts use positive expenses and negative income. No currency conversion is inferred. */
export function analyzeSpending(csv: string) {
  // Todo lo que puede fallar por el contenido del fichero es un 422 con mensaje util, no un
  // 500: el front ya sabe pintar {error, fields} de un AppError (api/client.ts) y con Error
  // plano todo acababa en el 502 generico de onError.
  if (csv.length > 500000) throw new AppError("Import at most 500 KB of transaction CSV", 422);
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i <= csv.length; i++) {
    const c = csv[i];
    if (c === '"') {
      if (quoted && csv[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (!quoted && cell.length) throw new AppError("Invalid quoted CSV field", 422);
      else quoted = !quoted;
    } else if (!quoted && (c === "," || c === "\n" || c === undefined)) {
      row.push(cell.replace(/\r$/, ""));
      cell = "";
      if (c !== ",") {
        if (row.some((v) => v.trim())) rows.push(row);
        row = [];
      }
    } else if (c !== undefined) cell += c;
  }
  if (quoted) throw new AppError("CSV has an unclosed quoted field", 422);
  const header = rows.shift()?.map((v) => v.trim().toLowerCase());
  if (!header || !["date", "description", "amount", "category"].every((v) => header.includes(v)))
    throw new AppError("CSV needs date,description,amount,category columns", 422);
  if (!rows.length || rows.length > 5000)
    throw new AppError("Import between 1 and 5,000 transactions", 422);
  const transactions = rows.map((r, index) => {
    const get = (name: string) => r[header.indexOf(name)]?.trim() ?? "";
    if (r.length !== header.length)
      throw new AppError(`Row ${index + 2} has the wrong number of columns`, 422);
    const date = get("date"),
      amount = get("amount");
    if (!z.iso.date().safeParse(date).success || !/^[-+]?\d+(?:\.\d{1,2})?$/.test(amount))
      throw new AppError(
        `Row ${index + 2} needs an ISO date and a plain amount with at most two decimal places`,
        422,
      );
    const cents = Math.round(Number(amount) * 100);
    if (!Number.isSafeInteger(cents) || Math.abs(cents) > 1e12)
      throw new AppError("Transaction amount is out of range", 422);
    return {
      id: `row-${index + 2}`,
      date,
      description: get("description"),
      amount: cents / 100,
      category: get("category") || "Uncategorized",
      cents,
    };
  });
  const expenses = transactions.filter((t) => t.cents > 0).reduce((n, t) => n + t.cents, 0),
    income = -transactions.filter((t) => t.cents < 0).reduce((n, t) => n + t.cents, 0);
  const grouped = new Map<string, number>();
  for (const t of transactions)
    if (t.cents > 0) grouped.set(t.category, (grouped.get(t.category) ?? 0) + t.cents);
  const categories = [...grouped]
    .map(([name, cents]) => ({ name, amount: cents / 100 }))
    .sort((a, b) => b.amount - a.amount);
  return {
    income: income / 100,
    spending: expenses / 100,
    saved: (income - expenses) / 100,
    count: transactions.length,
    categories,
    transactions: transactions.map(({ cents, ...t }) => t),
    period: {
      from: transactions.map((t) => t.date).sort()[0],
      to: transactions
        .map((t) => t.date)
        .sort()
        .at(-1),
    },
    amountConvention:
      "Positive expenses; negative income. Values use the source currency; no currency conversion.",
  };
}

