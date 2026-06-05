import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Mail, MessageCircle, Clock, CheckCircle } from "lucide-react";
import { Link } from "wouter";

const TOPICS = [
  "Вопрос о плане питания",
  "Проблема с аккаунтом",
  "Вопрос об оплате",
  "Технический сбой",
  "Удаление аккаунта",
  "Другое",
];

function parseSupport(content: string) {
  let description = "Мы поможем разобраться с любым вопросом. Команда отвечает в рабочие дни.";
  let email = "support@fitit.pro";
  let responseTime = "В рабочие дни — до 24 часов";

  const lines = content.split("\n");
  let currentSection = "";
  let descSet = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith("## ")) {
      currentSection = line.slice(3).toLowerCase();
      continue;
    }
    if (line.startsWith("#")) continue;
    if (line.startsWith("- ") || line.startsWith("• ")) continue;

    const sec = currentSection;
    if (sec.includes("время") || sec.includes("ответ")) {
      responseTime = line;
    } else if (sec.includes("mail") || sec.includes("e-mail") || sec.includes("почт") || sec.includes("связ")) {
      email = line;
    } else if (!descSet) {
      description = line;
      descSet = true;
    }
  }
  return { description, email, responseTime };
}

export default function Support() {
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageInfo, setPageInfo] = useState({
    title: "Поддержка",
    description: "Мы поможем разобраться с любым вопросом. Команда отвечает в рабочие дни.",
    email: "support@fitit.pro",
    responseTime: "В рабочие дни — до 24 часов",
  });

  useEffect(() => {
    fetch("/api/pages/support")
      .then(r => r.json())
      .then(d => {
        if (d?.content) {
          const parsed = parseSupport(d.content);
          setPageInfo({
            title: d.title || "Поддержка",
            description: parsed.description,
            email: parsed.email,
            responseTime: parsed.responseTime,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Не удалось отправить");
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-12 sm:py-20">
        <div className="container px-4 max-w-5xl">
          <div className="mb-10 sm:mb-14">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Помощь</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{pageInfo.title}</h1>
            <p className="text-muted-foreground mt-3 max-w-xl">{pageInfo.description}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 sm:gap-10">
            <div className="lg:col-span-2">
              {sent ? (
                <div className="bg-background border border-border rounded-2xl p-8 text-center">
                  <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Сообщение отправлено</h2>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                    Мы получили ваш запрос и ответим на указанный e-mail в течение 24 часов.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", topic: "", message: "" }); }}
                    className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                  >
                    Отправить ещё одно сообщение
                  </button>
                </div>
              ) : (
                <div className="bg-background border border-border rounded-2xl p-6 sm:p-8">
                  <h2 className="text-lg font-bold mb-5">Написать в поддержку</h2>
                  {error && (
                    <div className="mb-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl px-4 py-3">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Имя</label>
                        <input
                          type="text"
                          placeholder="Ваше имя"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          required
                          className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">E-mail</label>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          required
                          className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Тема обращения</label>
                      <select
                        value={form.topic}
                        onChange={(e) => setForm({ ...form, topic: e.target.value })}
                        required
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="" disabled>Выберите тему</option>
                        {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Сообщение</label>
                      <textarea
                        placeholder="Опишите вашу ситуацию подробно..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        required
                        rows={5}
                        className="flex w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Отправляем..." : "Отправить обращение"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-background border border-border rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Время ответа</p>
                    <p className="text-sm text-muted-foreground">{pageInfo.responseTime}</p>
                  </div>
                </div>
              </div>

              <div className="bg-background border border-border rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">E-mail</p>
                    <a href={`mailto:${pageInfo.email}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {pageInfo.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-background border border-border rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">FAQ</p>
                    <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Частые вопросы →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/40 rounded-2xl p-5">
                <p className="text-sm font-medium mb-2">Полезные разделы</p>
                <ul className="space-y-2">
                  {[
                    { href: "/faq", label: "Вопросы и ответы" },
                    { href: "/how-it-works", label: "Как это работает" },
                    { href: "/calculator", label: "Калькулятор КБЖУ" },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
