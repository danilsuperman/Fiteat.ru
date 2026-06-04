import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const result: React.ReactNode[] = [];
  let key = 0;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      result.push(<h2 key={key++} className="text-xl font-bold text-foreground mt-8 mb-3">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      result.push(<h3 key={key++} className="text-base font-semibold text-foreground mt-5 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("• "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      result.push(
        <ul key={key++} className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2 mb-3">
          {items.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      );
      continue;
    } else if (line.trim() === "") {
      result.push(<div key={key++} className="h-2" />);
    } else {
      result.push(<p key={key++} className="text-sm text-muted-foreground leading-relaxed mb-2">{line}</p>);
    }
    i++;
  }
  return result;
}

export default function ConsentPage() {
  const [content, setContent] = useState<string | null>(null);
  const [title, setTitle] = useState("Согласие на обработку данных");

  useEffect(() => {
    fetch("/api/pages/consent")
      .then(r => r.json())
      .then(d => { if (d.content) { setContent(d.content); setTitle(d.title); } })
      .catch(() => {});
  }, []);

  return (
    <Layout>
      <div className="py-10 sm:py-14">
        <div className="container px-4 max-w-3xl">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" />
              На главную
            </Link>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">Правовая информация</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
          </div>
          <div className="border border-border rounded-2xl p-6 sm:p-8 bg-background">
            {content ? renderMarkdown(content) : (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-secondary rounded animate-pulse" style={{ width: `${70 + (i % 3) * 10}%` }} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
