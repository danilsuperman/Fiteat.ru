import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  BarChart3, Tag, FileText, LogOut, ChevronRight,
  Plus, Trash2, Eye, EyeOff, X, Users, TrendingUp, Check
} from "lucide-react";

const API = (p: string) => `/api${p}`;

function apiFetch(path: string, token: string, opts?: RequestInit) {
  return fetch(API(path), {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts?.headers || {}) },
  }).then(async (r) => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Ошибка");
    return data;
  });
}

/* ─── Admin Login ─── */
function AdminLogin({ onLogin }: { onLogin: (token: string, info: any) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await fetch(API("/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; });
      onLogin(data.token, data);
    } catch (e: any) {
      setError(e.message || "Ошибка входа");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="ФИТИТ" className="h-7 w-auto mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground">Административная панель</h1>
          <p className="text-sm text-muted-foreground mt-1">Вход для сотрудников</p>
        </div>
        <form onSubmit={submit} className="border border-border rounded-2xl p-6 space-y-4 bg-background">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3">{error}</div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="admin@fitit.ru" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </Button>
        </form>
        <p className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← На главную</Link>
        </p>
      </div>
    </div>
  );
}

/* ─── Stats Tab ─── */
function StatsTab({ token }: { token: string }) {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { apiFetch("/admin/stats", token).then(setStats).catch(() => {}); }, [token]);

  const cards = stats ? [
    { label: "Всего пользователей", value: stats.users, sub: `+${stats.newUsersWeek} за 7 дней`, icon: Users },
    { label: "Планов создано", value: stats.plans, sub: `+${stats.newPlansWeek} за 7 дней`, icon: TrendingUp },
    { label: "Активных промокодов", value: stats.activePromoCodes, sub: "сейчас", icon: Tag },
    { label: "Статей в блоге", value: stats.articles, sub: "опубликовано", icon: FileText },
  ] : [];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Статистика сайта</h2>
      {!stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-secondary animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{c.label}</p>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold text-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Promo Codes Tab ─── */
function PromoTab({ token }: { token: string }) {
  const [codes, setCodes] = useState<any[]>([]);
  const [form, setForm] = useState({ code: "", discountPercent: "", maxUses: "", expiresAt: "" });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    apiFetch("/admin/promo-codes", token).then(setCodes).catch(() => {});
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      await apiFetch("/admin/promo-codes", token, {
        method: "POST",
        body: JSON.stringify({
          code: form.code,
          discountPercent: Number(form.discountPercent),
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
        }),
      });
      setForm({ code: "", discountPercent: "", maxUses: "", expiresAt: "" });
      setShowForm(false); load();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Удалить промокод?")) return;
    await apiFetch(`/admin/promo-codes/${id}`, token, { method: "DELETE" });
    load();
  };

  const toggle = async (id: number) => {
    await apiFetch(`/admin/promo-codes/${id}/toggle`, token, { method: "PATCH" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Промокоды и скидки</h2>
        <Button size="sm" className="rounded-xl gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Создать
        </Button>
      </div>

      {showForm && (
        <form onSubmit={create} className="border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold">Новый промокод</p>
            <button type="button" onClick={() => setShowForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Код *</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                required placeholder="SUMMER25"
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Скидка % *</label>
              <input type="number" min="1" max="100" value={form.discountPercent}
                onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))}
                required placeholder="25"
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Макс. использований</label>
              <input type="number" min="1" value={form.maxUses}
                onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                placeholder="∞"
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Истекает</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>
          <Button type="submit" size="sm" className="rounded-xl" disabled={loading}>
            {loading ? "Создание..." : "Создать промокод"}
          </Button>
        </form>
      )}

      <div className="border border-border rounded-2xl overflow-hidden">
        {codes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Промокодов пока нет</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Код</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Скидка</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Использований</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Истекает</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                  <td className="px-4 py-3 text-accent font-semibold">{c.discount_percent}%</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString("ru") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      c.is_active ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"
                    }`}>
                      {c.is_active ? <><Check className="h-3 w-3" /> Активен</> : "Отключён"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => toggle(c.id)} title={c.is_active ? "Отключить" : "Включить"}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                        {c.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={() => del(c.id)} title="Удалить"
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ─── Articles Tab ─── */
const CATEGORIES = ["Наука", "Питание", "Гормоны", "Рацион", "Лайфхаки", "Образ жизни"];

function ArticlesTab({ token }: { token: string }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emptyForm = { title: "", slug: "", excerpt: "", content: "", category: "Питание", readTime: "5 мин", isPublished: true };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => {
    apiFetch("/admin/articles", token).then(setArticles).catch(() => {});
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const startEdit = (a: any) => {
    setEditing(a);
    setForm({ title: a.title, slug: a.slug, excerpt: a.excerpt, content: a.content, category: a.category, readTime: a.read_time, isPublished: a.is_published });
    setShowForm(true);
    setError("");
  };

  const startCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); setError(""); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      if (editing) {
        await apiFetch(`/admin/articles/${editing.id}`, token, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await apiFetch("/admin/articles", token, { method: "POST", body: JSON.stringify(form) });
      }
      setShowForm(false); setEditing(null); load();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Удалить статью?")) return;
    await apiFetch(`/admin/articles/${id}`, token, { method: "DELETE" });
    load();
  };

  const f = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const slugify = (title: string) => title.toLowerCase().replace(/[^a-zа-я0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Статьи в блоге</h2>
        <Button size="sm" className="rounded-xl gap-2" onClick={startCreate}>
          <Plus className="h-4 w-4" /> Новая статья
        </Button>
      </div>

      {showForm && (
        <form onSubmit={save} className="border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{editing ? "Редактировать статью" : "Новая статья"}</p>
            <button type="button" onClick={() => setShowForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Заголовок *</label>
            <input value={form.title} onChange={e => { f("title", e.target.value); if (!editing) f("slug", slugify(e.target.value)); }} required
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Slug (URL) *</label>
              <input value={form.slug} onChange={e => f("slug", e.target.value)} required readOnly={!!editing}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Категория *</label>
              <select value={form.category} onChange={e => f("category", e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Время чтения</label>
              <input value={form.readTime} onChange={e => f("readTime", e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="5 мин" />
            </div>
            <div className="space-y-1 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer h-10">
                <input type="checkbox" checked={form.isPublished} onChange={e => f("isPublished", e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm">Опубликовать</span>
              </label>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Краткое описание *</label>
            <textarea value={form.excerpt} onChange={e => f("excerpt", e.target.value)} required rows={2}
              className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Содержание статьи *</label>
            <textarea value={form.content} onChange={e => f("content", e.target.value)} required rows={8}
              className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y" />
          </div>
          <div className="flex gap-3">
            <Button type="submit" size="sm" className="rounded-xl" disabled={loading}>
              {loading ? "Сохранение..." : editing ? "Сохранить" : "Опубликовать"}
            </Button>
            <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => setShowForm(false)}>Отмена</Button>
          </div>
        </form>
      )}

      <div className="border border-border rounded-2xl overflow-hidden">
        {articles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Статей пока нет</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Заголовок</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Категория</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium leading-tight line-clamp-1">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">/blog/{a.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{a.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      a.is_published ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"
                    }`}>
                      {a.is_published ? "Опубликовано" : "Черновик"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => startEdit(a)} title="Редактировать"
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                        <FileText className="h-4 w-4" />
                      </button>
                      <button onClick={() => del(a.id)} title="Удалить"
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ─── Admin Dashboard ─── */
const TABS: { id: string; label: string; icon: any; roles: string[] }[] = [
  { id: "stats", label: "Статистика", icon: BarChart3, roles: ["admin", "owner"] },
  { id: "promo", label: "Промокоды", icon: Tag, roles: ["admin", "owner"] },
  { id: "articles", label: "Статьи", icon: FileText, roles: ["admin", "owner", "seo"] },
];

function AdminDashboard({ token, info, onLogout }: { token: string; info: any; onLogout: () => void }) {
  const allowedTabs = TABS.filter(t => t.roles.includes(info.role));
  const [activeTab, setActiveTab] = useState(allowedTabs[0]?.id || "articles");

  const roleLabel: Record<string, string> = { admin: "Администратор", owner: "Владелец", seo: "SEO-специалист" };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="ФИТИТ" className="h-6 w-auto" />
            <span className="text-xs font-medium text-muted-foreground border-l border-border pl-4">Панель управления</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-tight">{info.name}</p>
              <p className="text-xs text-muted-foreground">{roleLabel[info.role]}</p>
            </div>
            <button onClick={onLogout}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-xl px-3 h-9">
              <LogOut className="h-3.5 w-3.5" /> Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab nav */}
        <div className="flex gap-1 mb-8 border border-border rounded-2xl p-1 w-fit">
          {allowedTabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}>
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {activeTab === "stats"    && <StatsTab    token={token} />}
        {activeTab === "promo"    && <PromoTab    token={token} />}
        {activeTab === "articles" && <ArticlesTab token={token} />}
      </div>
    </div>
  );
}

/* ─── Main Admin Page ─── */
export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("fitit_admin_token") || "");
  const [info, setInfo]   = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem("fitit_admin_info") || "null"); } catch { return null; }
  });

  const handleLogin = (t: string, i: any) => {
    localStorage.setItem("fitit_admin_token", t);
    localStorage.setItem("fitit_admin_info", JSON.stringify(i));
    setToken(t); setInfo(i);
  };

  const handleLogout = () => {
    localStorage.removeItem("fitit_admin_token");
    localStorage.removeItem("fitit_admin_info");
    setToken(""); setInfo(null);
  };

  if (!token || !info) return <AdminLogin onLogin={handleLogin} />;
  return <AdminDashboard token={token} info={info} onLogout={handleLogout} />;
}
