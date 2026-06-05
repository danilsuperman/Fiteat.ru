import React from "react";

export function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];
  let key = 0;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      result.push(
        <h2 key={key++} className="text-xl font-bold text-foreground mt-8 mb-3 first:mt-0">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      result.push(
        <h3 key={key++} className="text-base font-semibold text-foreground mt-5 mb-2">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("• "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      result.push(
        <ul key={key++} className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground ml-2 mb-3">
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
      continue;
    } else if (line.trim() === "") {
      result.push(<div key={key++} className="h-2" />);
    } else {
      result.push(
        <p key={key++} className="text-sm text-muted-foreground leading-relaxed mb-2">
          {line}
        </p>
      );
    }
    i++;
  }
  return result;
}
