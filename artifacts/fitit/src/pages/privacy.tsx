import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";

export default function PrivacyPage() {
  const [content, setContent] = useState<string | null>(null);
  const [title, setTitle] = useState("Политика конфиденциальности");

  useEffect(() => {
    fetch("/api/pages/privacy")
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
            {content ? (
              <div className="space-y-1">{renderMarkdown(content)}</div>
            ) : (
              <div className="space-y-3">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-4 bg-secondary rounded animate-pulse" style={{ width: `${65 + (i % 4) * 9}%` }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
