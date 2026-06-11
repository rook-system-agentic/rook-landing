import type { ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const token = match[0];

    if (token.startsWith("**")) {
      parts.push(
        <strong key={`${token}-${match.index}`} className="text-cream font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      parts.push(
        <code key={`${token}-${match.index}`} className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-sm text-ocre">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        parts.push(
          <a
            key={`${token}-${match.index}`}
            href={linkMatch[2]}
            className="text-terracota underline decoration-terracota/40 underline-offset-4 hover:text-ocre"
            target={linkMatch[2].startsWith("http") ? "_blank" : undefined}
            rel={linkMatch[2].startsWith("http") ? "noopener" : undefined}
          >
            {linkMatch[1]}
          </a>,
        );
      }
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function isTable(lines: string[], index: number) {
  return lines[index]?.includes("|") && /^\s*\|?\s*:?-{3,}:?\s*\|/.test(lines[index + 1] || "");
}

function renderTable(lines: string[], start: number) {
  const tableLines: string[] = [];
  let index = start;

  while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
    tableLines.push(lines[index]);
    index += 1;
  }

  const rows = tableLines
    .filter((line, lineIndex) => lineIndex !== 1)
    .map((line) =>
      line
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim()),
    );

  const [head, ...body] = rows;
  return {
    nextIndex: index,
    node: (
      <div className="my-8 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-white/5 text-cream">
            <tr>
              {head.map((cell) => (
                <th key={cell} className="px-4 py-3 font-semibold">
                  {renderInline(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {body.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 text-muted">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  };
}

export default function MarkdownContent({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (isTable(lines, index)) {
      const table = renderTable(lines, index);
      nodes.push(<div key={`table-${index}`}>{table.node}</div>);
      index = table.nextIndex;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      nodes.push(
        <h2 key={index} className="mt-12 mb-4 text-2xl font-bold leading-tight text-cream">
          {renderInline(trimmed.slice(3))}
        </h2>,
      );
      index += 1;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      nodes.push(
        <h3 key={index} className="mt-8 mb-3 text-xl font-semibold leading-tight text-cream">
          {renderInline(trimmed.slice(4))}
        </h3>,
      );
      index += 1;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      nodes.push(
        <blockquote key={index} className="my-8 rounded-xl border border-ocre/30 bg-ocre/5 p-5 text-sm leading-relaxed text-cream/90">
          {renderInline(trimmed.slice(2))}
        </blockquote>,
      );
      index += 1;
      continue;
    }

    if (/^- /.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^- /.test(lines[index].trim())) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      nodes.push(
        <ul key={`ul-${index}`} className="my-5 space-y-2 pl-5 text-muted">
          {items.map((item) => (
            <li key={item} className="list-disc leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    const paragraph: string[] = [trimmed];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith("## ") &&
      !lines[index].trim().startsWith("### ") &&
      !lines[index].trim().startsWith("> ") &&
      !/^- /.test(lines[index].trim()) &&
      !isTable(lines, index)
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }

    nodes.push(
      <p key={`p-${index}`} className="my-5 text-base leading-8 text-muted">
        {renderInline(paragraph.join(" "))}
      </p>,
    );
  }

  return <div>{nodes}</div>;
}

