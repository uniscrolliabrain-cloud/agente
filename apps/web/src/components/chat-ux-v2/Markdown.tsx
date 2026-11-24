// CHAT_UX_V2_MARKDOWN - render seguro de markdown basico a nodos React.
// No usa dangerouslySetInnerHTML ni dependencias nuevas. Cubre lo que el chat
// muestra hoy en texto plano: parrafos, titulos, listas, citas, codigo, tablas,
// negrita, cursiva, codigo inline y enlaces http(s).
import type { ReactNode } from "react";

function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null = pattern.exec(text);
  let index = 0;
  while (match) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-i${index++}`;
    if (token.startsWith("**")) nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith("`")) nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    else if (token.startsWith("[")) {
      const link = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(token);
      if (link)
        nodes.push(
          <a key={key} href={link[2]} target="_blank" rel="noreferrer">
            {link[1]}
          </a>,
        );
      else nodes.push(token);
    } else nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    last = match.index + token.length;
    match = pattern.exec(text);
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "h"; level: number; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "quote"; lines: string[] }
  | { kind: "code"; lang: string; code: string }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "hr" };

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parse(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push({ kind: "code", lang, code: code.join("\n") });
      continue;
    }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push({ kind: "hr" });
      index += 1;
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({ kind: "h", level: heading[1].length, text: heading[2] });
      index += 1;
      continue;
    }
    if (/^\s*>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      blocks.push({ kind: "quote", lines: quote });
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+[.)]\s+/, ""));
        index += 1;
      }
      blocks.push({ kind: "ol", items });
      continue;
    }
    if (line.includes("|") && index + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[index + 1])) {
      const head = splitRow(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].includes("|")) {
        rows.push(splitRow(lines[index]));
        index += 1;
      }
      blocks.push({ kind: "table", head, rows });
      continue;
    }
    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^\s*(#{1,4}\s|[-*]\s|\d+[.)]\s|>|```)/.test(lines[index]) &&
      !(lines[index].includes("|") && index + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[index + 1]))
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    if (paragraph.length) blocks.push({ kind: "p", lines: paragraph });
  }
  return blocks;
}

function renderBlock(block: Block, key: string): ReactNode {
  switch (block.kind) {
    case "p":
      return <p key={key}>{inline(block.lines.join(" "), key)}</p>;
    case "h": {
      const Tag = (block.level === 1 ? "h3" : block.level === 2 ? "h3" : "h4") as "h3" | "h4";
      return <Tag key={key}>{inline(block.text, key)}</Tag>;
    }
    case "ul":
      return (
        <ul key={key}>
          {block.items.map((item) => (
            <li key={`${key}-${item}`}>{inline(item, `${key}-${item}`)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={key}>
          {block.items.map((item) => (
            <li key={`${key}-${item}`}>{inline(item, `${key}-${item}`)}</li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote key={key}>
          {block.lines.map((line) => (
            <p key={`${key}-${line}`}>{inline(line, `${key}-${line}`)}</p>
          ))}
        </blockquote>
      );
    case "code":
      return (
        <div className="cux-code" key={key}>
          {/* biome-ignore lint/a11y/noNoninteractiveTabindex: un bloque de codigo con scroll debe poder recorrerse con teclado */}
          <pre tabIndex={0}>
            <code>{block.code}</code>
          </pre>
        </div>
      );
    case "table":
      return (
        <>
          {/* biome-ignore lint/a11y/noNoninteractiveTabindex: la tabla con scroll debe poder recorrerse con teclado */}
          <section className="cux-table-wrap" key={key} aria-label="Tabla de datos" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  {block.head.map((cell) => (
                    <th key={`${key}-h-${cell}`}>{inline(cell, `${key}-h-${cell}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row) => (
                  <tr key={`${key}-r-${row.join("|")}`}>
                    {row.map((cell) => (
                      <td key={`${key}-c-${cell}`}>{inline(cell, `${key}-c-${cell}`)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      );
    case "hr":
      return <hr key={key} />;
    default:
      return null;
  }
}

export default function Markdown({ text }: { text: string }) {
  return <div className="cux-markdown">{parse(text).map((block, index) => renderBlock(block, `b${index}`))}</div>;
}
