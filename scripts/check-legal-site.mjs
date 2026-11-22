import { readdir, readFile } from "node:fs/promises";
import { parse } from "parse5";

const site = new URL("../apps/site/", import.meta.url);
const localOrigin = new URL("https://site.invalid/");
const documents = ["aviso-legal", "privacidad", "cookies", "terminos", "transparencia-ia", "confianza"];
const pages = new Map();
const problems = [];

function collect(node, page) {
  const attrs = Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
  if (node.tagName === "meta" && attrs.name) page.meta.set(attrs.name, attrs.content);
  if (node.tagName === "a" && attrs.href) page.links.push(attrs.href);
  if (attrs.id) page.ids.add(attrs.id);
  for (const child of node.childNodes ?? []) collect(child, page);
}

for (const file of await readdir(site)) {
  if (!file.endsWith(".html")) continue;
  const source = await readFile(new URL(file, site), "utf8");
  const page = { source, links: [], ids: new Set(), meta: new Map() };
  collect(parse(source), page);
  pages.set(file, page);
}

for (const document of documents) {
  const file = `${document}.html`;
  const page = pages.get(file);
  if (!page) {
    problems.push(`${file}: falta documento`);
    continue;
  }
  const state = page.meta.get("legal-status");
  const robots = page.meta.get("robots")?.split(/[,\s]+/) ?? [];
  const placeholder = /\[\s*PENDIENTE\b/i.test(page.source);
  if (
    !["draft", "approved", "published"].includes(state) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(page.meta.get("legal-version") ?? "")
  ) {
    problems.push(`${file}: falta estado o versión válida`);
  }
  if (state === "draft" && !robots.includes("noindex")) problems.push(`${file}: borrador indexable`);
  if (placeholder && state !== "draft") problems.push(`${file}: pendiente fuera de borrador`);
  if (process.argv.includes("--release") && (state !== "published" || placeholder || robots.includes("noindex"))) {
    problems.push(`${file}: publicación bloqueada por estado, indexación o contenido pendiente`);
  }
}

for (const [file, page] of pages) {
  const base = new URL(file, localOrigin);
  for (const href of page.links) {
    const url = new URL(href, base);
    if (url.origin !== localOrigin.origin) continue;
    const target = pages.get(url.pathname.slice(1) || "index.html");
    if (!target || (url.hash && !target.ids.has(decodeURIComponent(url.hash.slice(1))))) {
      problems.push(`${file}: enlace local roto ${href}`);
    }
  }
}

if (problems.length) {
  process.stderr.write(`${problems.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Sitio legal verificado: ${pages.size} páginas HTML.\n`);
}
