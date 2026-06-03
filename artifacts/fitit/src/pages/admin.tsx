import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  BarChart3, Tag, FileText, LogOut, Plus, Trash2,
  Eye, EyeOff, X, Users, TrendingUp, Check,
  DollarSign, ChevronDown, ChevronUp, Search,
  Calendar, Settings, RefreshCw, Edit2, Star, Apple
} from "lucide-react";

const API = (p: string) => `/api${p}`;

function apiFetch(path: string, token: string, opts?: RequestInit) {
  return fetch(API(path), {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts?.headers || {}) },
  }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error || "Ошибка"); return d; });
}

function fmt(n: number) { return new Intl.NumberFormat("ru-RU").format(n); }
function fmtRub(n: number) { return `${fmt(n)} ₽`; }
function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function isExpired(s: string | null | undefined) { return s ? new Date(s) < new Date() : false; }
function monthsWord(m: number) { return m === 1 ? "месяц" : m < 5 ? "месяца" : "месяцев"; }
function daysWord(d: number) { return d === 1 ? "день" : d < 5 ? "дня" : "дней"; }

/* ─── Admin Login ─── */
function AdminLogin({ onLogin }: { onLogin: (token: string, info: any) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const data = await fetch(API("/admin/login"), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); return d; });
      onLogin(data.token, data);
    } catch (e: any) { setError(e.message || "Ошибка входа"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="ФИТИТ" className="h-7 w-auto mx-auto mb-4" />
          <h1 className="text-xl font-bold">Административная панель</h1>
          <p className="text-sm text-muted-foreground mt-1">Вход для сотрудников</p>
        </div>
        <form onSubmit={submit} className="border border-border rounded-2xl p-6 space-y-4">
          {error && <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="admin@fitit.ru" autoComplete="username" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoComplete="current-password" />
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

/* ─── Date Range Picker ─── */
function DateRangePicker({ from, to, onChange }: {
  from: string; to: string;
  onChange: (from: string, to: string) => void;
}) {
  const presets = [
    { label: "Сегодня",    days: 0 },
    { label: "7 дней",     days: 7 },
    { label: "30 дней",    days: 30 },
    { label: "90 дней",    days: 90 },
    { label: "Весь период",days: 365 * 5 },
  ];
  const setPreset = (days: number) => {
    const t = new Date(); const f = new Date();
    if (days > 0) f.setDate(f.getDate() - days);
    onChange(f.toISOString().slice(0, 10), t.toISOString().slice(0, 10));
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map(p => (
        <button key={p.label} onClick={() => setPreset(p.days)}
          className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-foreground/40 hover:bg-secondary/50 transition-colors font-medium">
          {p.label}
        </button>
      ))}
      <div className="flex items-center gap-1.5 border border-border rounded-xl px-3 h-8">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <input type="date" value={from} onChange={e => onChange(e.target.value, to)}
          className="text-xs bg-transparent border-none outline-none w-28 cursor-pointer" />
        <span className="text-muted-foreground text-xs">—</span>
        <input type="date" value={to} onChange={e => onChange(from, e.target.value)}
          className="text-xs bg-transparent border-none outline-none w-28 cursor-pointer" />
      </div>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border ${accent ? "bg-foreground text-background border-foreground" : "border-border"}`}>
      <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${accent ? "text-background/60" : "text-muted-foreground"}`}>{label}</p>
      <p className="text-3xl font-bold leading-none">{value}</p>
      {sub && <p className={`text-xs mt-1.5 ${accent ? "text-background/50" : "text-muted-foreground"}`}>{sub}</p>}
    </div>
  );
}

/* ─── Analytics Tab ─── */
function AnalyticsTab({ token }: { token: string }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const monthAgoStr = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthAgoStr);
  const [to, setTo]     = useState(todayStr);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch(`/admin/analytics?from=${from}&to=${to}`, token)
      .then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [token, from, to]);

  useEffect(() => { load(); }, [load]);

  const handleRange = (f: string, t: string) => { setFrom(f); setTo(t); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <h2 className="text-lg font-semibold">Аналитика</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <DateRangePicker from={from} to={to} onChange={handleRange} />
          <button onClick={load} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {!data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-secondary animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Users */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Пользователи</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard label="Всего" value={fmt(data.users.total)} />
              <StatCard label="Активных" value={fmt(data.users.active)} sub="с активной подпиской" accent />
              <StatCard label="Новых за период" value={fmt(data.users.new)} />
            </div>
          </div>

          {/* Plans */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Планы питания</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Создано сегодня" value={fmt(data.plans.today)} />
              <StatCard label="За месяц" value={fmt(data.plans.month)} />
              <StatCard label="За период" value={fmt(data.plans.period)} />
              <StatCard label="Всего" value={fmt(data.plans.total)} />
            </div>
          </div>

          {/* Revenue */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Выручка</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="За период" value={fmtRub(data.revenue.period)} sub={`${fmt(data.revenue.count)} платежей`} accent />
              <StatCard label="Всего" value={fmtRub(data.revenue.total)} />
              <StatCard label="Средний чек" value={fmtRub(data.revenue.avgCheck)} />
              <StatCard label="LTV" value={fmtRub(data.revenue.ltv)} sub="выручка / пользователь" />
            </div>
          </div>

          {/* Conversion */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Конверсия</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-border rounded-2xl p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Регистрация → покупка</p>
                <p className="text-3xl font-bold">{data.conversion.regToPurchase}%</p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {fmt(data.conversion.purchasers)} из {fmt(data.conversion.registrations)} зарегистрировавшихся
                </p>
                <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-foreground rounded-full transition-all" style={{ width: `${Math.min(data.conversion.regToPurchase, 100)}%` }} />
                </div>
              </div>
              <div className="border border-border rounded-2xl p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Повторные покупки</p>
                <p className="text-3xl font-bold">{data.conversion.repeatPurchase}%</p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {fmt(data.conversion.repeatBuyers)} из {fmt(data.conversion.firstBuyers)} купивших
                </p>
                <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-foreground rounded-full transition-all" style={{ width: `${Math.min(data.conversion.repeatPurchase, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue by package */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Выручка по пакетам</p>
            <div className="border border-border rounded-2xl overflow-hidden">
              {data.revenue.byPackage.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">Платежей за этот период нет</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Пакет</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Продаж</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Выручка</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.revenue.byPackage.map((p: any) => (
                      <tr key={p.name} className="border-b border-border last:border-0 hover:bg-secondary/20">
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{fmt(p.count)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{fmtRub(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Users Tab ─── */
function UsersTab({ token }: { token: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState({ discountPercent: 0, notes: "", subscriptionDays: 0 });
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch(`/admin/users?search=${encodeURIComponent(search)}&limit=50`, token)
      .then(d => { setUsers(d.users); setTotal(d.total); }).catch(() => {}).finally(() => setLoading(false));
  }, [token, search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openEdit = (u: any) => {
    setEditing(u);
    setEditForm({ discountPercent: u.discount_percent || 0, notes: u.notes || "", subscriptionDays: 30 });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await apiFetch(`/admin/users/${editing.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({
          discountPercent: editForm.discountPercent,
          notes: editForm.notes,
          ...(editForm.subscriptionDays > 0 ? { subscriptionDays: editForm.subscriptionDays } : {}),
        }),
      });
      setEditing(null); load();
    } catch (e: any) { alert(e.message); }
  };

  const del = async (id: number, name: string) => {
    if (!confirm(`Удалить пользователя ${name}? Это действие нельзя отменить.`)) return;
    try { await apiFetch(`/admin/users/${id}`, token, { method: "DELETE" }); load(); }
    catch (e: any) { alert(e.message); }
  };

  const subStatus = (u: any) => {
    if (!u.subscription_expires_at) return { label: "Нет", cls: "bg-secondary text-muted-foreground" };
    if (isExpired(u.subscription_expires_at)) return { label: "Истекла", cls: "bg-destructive/10 text-destructive" };
    return { label: `до ${fmtDate(u.subscription_expires_at)}`, cls: "bg-green-500/10 text-green-700" };
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-lg font-semibold">Пользователи</h2>
          <p className="text-xs text-muted-foreground">Всего: {fmt(total)}</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по имени или email..."
            className="flex h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
      </div>

      {/* Edit drawer */}
      {editing && (
        <div className="border border-border rounded-2xl p-5 space-y-4 bg-secondary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{editing.name}</p>
              <p className="text-xs text-muted-foreground">{editing.email}</p>
            </div>
            <button onClick={() => setEditing(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Скидка %</label>
              <input type="number" min="0" max="100" value={editForm.discountPercent}
                onChange={e => setEditForm(f => ({ ...f, discountPercent: Number(e.target.value) }))}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Продлить подписку (дни)</label>
              <input type="number" min="0" max="365" value={editForm.subscriptionDays}
                onChange={e => setEditForm(f => ({ ...f, subscriptionDays: Number(e.target.value) }))}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-xs font-medium text-muted-foreground">Заметки</label>
              <input value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Внутренняя заметка..."
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="rounded-xl" onClick={saveEdit}>Сохранить</Button>
            <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setEditing(null)}>Отмена</Button>
          </div>
        </div>
      )}

      <div className="border border-border rounded-2xl overflow-hidden">
        {loading && users.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Загрузка...</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Пользователи не найдены</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  {["Пользователь", "Подписка", "Планы", "Оплачено", "Скидка", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const ss = subStatus(u);
                  return (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium leading-tight">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                        <p className="text-xs text-muted-foreground">Рег: {fmtDate(u.created_at)}</p>
                        {u.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">📝 {u.notes}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${ss.cls}`}>{ss.label}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.plan_count}</td>
                      <td className="px-4 py-3 font-medium">{fmtRub(Math.round(Number(u.total_paid_kopecks) / 100))}</td>
                      <td className="px-4 py-3">
                        {u.discount_percent > 0
                          ? <span className="text-xs font-semibold text-accent">{u.discount_percent}%</span>
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(u)} title="Редактировать"
                            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => del(u.id, u.name)} title="Удалить"
                            className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {total > 50 && (
        <p className="text-xs text-muted-foreground text-center">Показано 50 из {fmt(total)} пользователей. Используйте поиск для фильтрации.</p>
      )}
    </div>
  );
}

/* ─── Pricing Tab ─── */
const FEATURES_PLACEHOLDER = "Функция 1\nФункция 2\nФункция 3";

function PricingTab({ token }: { token: string }) {
  const [packages, setPackages] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const empty = { name: "", description: "", priceRubles: "", durationDays: "30", featuresText: "", isActive: true, sortOrder: "0" };
  const [form, setForm] = useState(empty);

  const load = useCallback(() => {
    apiFetch("/admin/pricing", token).then(setPackages).catch(() => {});
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true); setError(""); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || "",
      priceRubles: String(Math.round(p.price_kopecks / 100)),
      durationDays: String(p.duration_days),
      featuresText: (p.features || []).join("\n"),
      isActive: p.is_active, sortOrder: String(p.sort_order),
    });
    setShowForm(true); setError("");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const payload = {
        name: form.name, description: form.description,
        priceRubles: Number(form.priceRubles),
        durationDays: Number(form.durationDays),
        features: form.featuresText.split("\n").map(l => l.trim()).filter(Boolean),
        isActive: form.isActive, sortOrder: Number(form.sortOrder),
      };
      if (editing) await apiFetch(`/admin/pricing/${editing.id}`, token, { method: "PUT", body: JSON.stringify(payload) });
      else await apiFetch("/admin/pricing", token, { method: "POST", body: JSON.stringify(payload) });
      setShowForm(false); load();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const del = async (id: number, name: string) => {
    if (!confirm(`Удалить пакет «${name}»?`)) return;
    await apiFetch(`/admin/pricing/${id}`, token, { method: "DELETE" });
    load();
  };

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const durationLabel = (days: number) => {
    if (days >= 365) { const m = Math.round(days / 30); return `${m} ${monthsWord(m)}`; }
    if (days >= 30)  { const m = Math.round(days / 30); return `${m} ${monthsWord(m)}`; }
    return `${days} ${daysWord(days)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Тарифные пакеты</h2>
        <Button size="sm" className="rounded-xl gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Новый пакет
        </Button>
      </div>

      {showForm && (
        <form onSubmit={save} className="border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{editing ? "Редактировать пакет" : "Новый тарифный пакет"}</p>
            <button type="button" onClick={() => setShowForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Название *</label>
              <input value={form.name} onChange={e => f("name", e.target.value)} required placeholder="Стандарт"
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Цена (₽) *</label>
              <input type="number" min="0" value={form.priceRubles} onChange={e => f("priceRubles", e.target.value)} required placeholder="990"
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Длительность (дней) *</label>
              <input type="number" min="1" value={form.durationDays} onChange={e => f("durationDays", e.target.value)} required
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Порядок сортировки</label>
              <input type="number" value={form.sortOrder} onChange={e => f("sortOrder", e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Краткое описание</label>
            <input value={form.description} onChange={e => f("description", e.target.value)} placeholder="Персональный план на 1 месяц"
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Функции (каждая с новой строки)</label>
            <textarea value={form.featuresText} onChange={e => f("featuresText", e.target.value)} rows={4}
              placeholder={FEATURES_PLACEHOLDER}
              className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => f("isActive", e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm">Активен (показывать на сайте)</span>
          </label>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="rounded-xl" disabled={loading}>{loading ? "Сохранение..." : editing ? "Сохранить" : "Создать"}</Button>
            <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => setShowForm(false)}>Отмена</Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {packages.map(p => (
          <div key={p.id} className={`border rounded-2xl p-5 space-y-3 ${p.is_active ? "border-border" : "border-dashed border-border opacity-60"}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{p.name}</p>
                  {!p.is_active && <span className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">Скрыт</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => del(p.id, p.name)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-2xl font-bold">{fmtRub(Math.round(p.price_kopecks / 100))}</p>
              <p className="text-sm text-muted-foreground pb-0.5">{durationLabel(p.duration_days)}</p>
            </div>
            {p.features?.length > 0 && (
              <ul className="space-y-1">
                {p.features.map((feat: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-foreground shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
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

  const load = useCallback(() => { apiFetch("/admin/promo-codes", token).then(setCodes).catch(() => {}); }, [token]);
  useEffect(() => { load(); }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      await apiFetch("/admin/promo-codes", token, {
        method: "POST",
        body: JSON.stringify({ code: form.code, discountPercent: Number(form.discountPercent), maxUses: form.maxUses ? Number(form.maxUses) : null, expiresAt: form.expiresAt || null }),
      });
      setForm({ code: "", discountPercent: "", maxUses: "", expiresAt: "" }); setShowForm(false); load();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const del = async (id: number) => { if (!confirm("Удалить промокод?")) return; await apiFetch(`/admin/promo-codes/${id}`, token, { method: "DELETE" }); load(); };
  const toggle = async (id: number) => { await apiFetch(`/admin/promo-codes/${id}/toggle`, token, { method: "PATCH" }); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Промокоды и скидки</h2>
        <Button size="sm" className="rounded-xl gap-2" onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4" /> Создать</Button>
      </div>
      {showForm && (
        <form onSubmit={create} className="border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Новый промокод</p>
            <button type="button" onClick={() => setShowForm(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "code", label: "Код *", placeholder: "SUMMER25", transform: (v: string) => v.toUpperCase() },
              { key: "discountPercent", label: "Скидка % *", placeholder: "25", type: "number" },
              { key: "maxUses", label: "Макс. использований", placeholder: "∞", type: "number" },
              { key: "expiresAt", label: "Истекает", placeholder: "", type: "date" },
            ].map(({ key, label, placeholder, type, transform }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{label}</label>
                <input type={type || "text"} value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: transform ? transform(e.target.value) : e.target.value }))}
                  placeholder={placeholder} required={label.endsWith("*")}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
            ))}
          </div>
          <Button type="submit" size="sm" className="rounded-xl" disabled={loading}>{loading ? "Создание..." : "Создать промокод"}</Button>
        </form>
      )}
      <div className="border border-border rounded-2xl overflow-hidden">
        {codes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Промокодов пока нет</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {["Код","Скидка","Использований","Истекает","Статус",""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                  <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                  <td className="px-4 py-3 text-accent font-semibold">{c.discount_percent}%</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("ru") : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${c.is_active ? "bg-green-500/10 text-green-700" : "bg-secondary text-muted-foreground"}`}>
                      {c.is_active ? <><Check className="h-3 w-3" /> Активен</> : "Отключён"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => toggle(c.id)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                        {c.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={() => del(c.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
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

  const load = useCallback(() => { apiFetch("/admin/articles", token).then(setArticles).catch(() => {}); }, [token]);
  useEffect(() => { load(); }, [load]);

  const startEdit = (a: any) => { setEditing(a); setForm({ title: a.title, slug: a.slug, excerpt: a.excerpt, content: a.content, category: a.category, readTime: a.read_time, isPublished: a.is_published }); setShowForm(true); setError(""); };
  const startCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); setError(""); };
  const slugify = (t: string) => t.toLowerCase().replace(/[^a-zа-я0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      if (editing) await apiFetch(`/admin/articles/${editing.id}`, token, { method: "PUT", body: JSON.stringify(form) });
      else await apiFetch("/admin/articles", token, { method: "POST", body: JSON.stringify(form) });
      setShowForm(false); setEditing(null); load();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const del = async (id: number) => { if (!confirm("Удалить статью?")) return; await apiFetch(`/admin/articles/${id}`, token, { method: "DELETE" }); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Статьи в блоге</h2>
        <Button size="sm" className="rounded-xl gap-2" onClick={startCreate}><Plus className="h-4 w-4" /> Новая статья</Button>
      </div>
      {showForm && (
        <form onSubmit={save} className="border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{editing ? "Редактировать" : "Новая статья"}</p>
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
              <label className="text-xs font-medium text-muted-foreground">Slug *</label>
              <input value={form.slug} onChange={e => f("slug", e.target.value)} required readOnly={!!editing}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Категория</label>
              <select value={form.category} onChange={e => f("category", e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Время чтения</label>
              <input value={form.readTime} onChange={e => f("readTime", e.target.value)} placeholder="5 мин"
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="flex items-end pb-1">
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
            <label className="text-xs font-medium text-muted-foreground">Содержание *</label>
            <textarea value={form.content} onChange={e => f("content", e.target.value)} required rows={8}
              className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="rounded-xl" disabled={loading}>{loading ? "Сохранение..." : editing ? "Сохранить" : "Опубликовать"}</Button>
            <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => setShowForm(false)}>Отмена</Button>
          </div>
        </form>
      )}
      <div className="border border-border rounded-2xl overflow-hidden">
        {articles.length === 0 ? <div className="text-center py-12 text-muted-foreground text-sm">Статей пока нет</div> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {["Заголовок","Категория","Статус",""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                  <td className="px-4 py-3">
                    <p className="font-medium leading-tight line-clamp-1">{a.title}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">/blog/{a.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${a.is_published ? "bg-green-500/10 text-green-700" : "bg-secondary text-muted-foreground"}`}>
                      {a.is_published ? "Опубликовано" : "Черновик"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => startEdit(a)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => del(a.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
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

/* ─── Reviews Tab ─── */
const STATUS_COLORS: Record<string, string> = {
  pending:  "bg-yellow-500/10 text-yellow-700",
  approved: "bg-green-500/10 text-green-700",
  rejected: "bg-red-500/10 text-red-700",
};
const STATUS_LABELS: Record<string, string> = {
  pending:  "На модерации",
  approved: "Одобрен",
  rejected: "Отклонён",
};

function ReviewsTab({ token }: { token: string }) {
  const [reviews, setReviews]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setFilter]   = useState("pending");
  const [actLoading, setActLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch(`/admin/reviews${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`, token)
      .then(setReviews).catch(() => {}).finally(() => setLoading(false));
  }, [token, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const act = async (id: number, status: "approved" | "rejected") => {
    setActLoading(true);
    try {
      await apiFetch(`/admin/reviews/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } catch (e: any) { alert(e.message); }
    finally { setActLoading(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Удалить отзыв? Это действие необратимо.")) return;
    setActLoading(true);
    try {
      await apiFetch(`/admin/reviews/${id}`, token, { method: "DELETE" });
      load();
    } catch (e: any) { alert(e.message); }
    finally { setActLoading(false); }
  };

  const filters = [
    { id: "pending",  label: "Ожидают" },
    { id: "approved", label: "Одобрены" },
    { id: "rejected", label: "Отклонены" },
    { id: "all",      label: "Все" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold">Модерация отзывов</h2>
        <button onClick={load} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-1 border border-border rounded-xl p-1 w-fit overflow-x-auto">
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === f.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-secondary animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Star className="h-10 w-10 mx-auto mb-3 text-border" />
          <p>Нет отзывов в этой категории</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map(r => (
            <div key={r.id} className="border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-4">
                {r.photos?.length > 0 && (
                  <img src={r.photos[0]} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-border" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-semibold text-sm">{r.user_name}</span>
                    <span className="text-xs text-muted-foreground">{r.user_email}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                      ))}
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] || ""}`}>
                      {STATUS_LABELS[r.status] || r.status}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">{fmtDate(r.created_at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{r.text}</p>
                  {r.admin_note && (
                    <p className="text-xs text-muted-foreground mt-1.5 italic border-l-2 border-border pl-2">
                      Заметка: {r.admin_note}
                    </p>
                  )}
                  {r.photos?.length > 1 && (
                    <p className="text-xs text-muted-foreground mt-1">{r.photos.length} фото</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border/60">
                {r.status !== "approved" && (
                  <button onClick={() => act(r.id, "approved")} disabled={actLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-700 text-sm font-medium hover:bg-green-500/20 transition-colors">
                    <Check className="h-3.5 w-3.5" />Одобрить
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button onClick={() => act(r.id, "rejected")} disabled={actLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
                    <X className="h-3.5 w-3.5" />Отклонить
                  </button>
                )}
                <button onClick={() => del(r.id)} disabled={actLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-sm hover:bg-destructive/10 hover:text-destructive transition-colors ml-auto">
                  <Trash2 className="h-3.5 w-3.5" />Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Snacks Tab ─── */
function SnacksTab({ token }: { token: string }) {
  const [snacks, setSnacks]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<any | null>(null);
  const [saving, setSaving]       = useState(false);
  const [form, setForm] = useState({ name:"", description:"", calories:"", proteins:"", fats:"", carbs:"", photoUrl:"", tags:"" });

  const load = useCallback(() => {
    setLoading(true);
    apiFetch("/admin/snacks", token).then(setSnacks).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name:"", description:"", calories:"", proteins:"", fats:"", carbs:"", photoUrl:"", tags:"" });
    setShowModal(true);
  };
  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ name:s.name, description:s.description||"", calories:String(s.calories), proteins:String(s.proteins), fats:String(s.fats), carbs:String(s.carbs), photoUrl:s.photo_url||"", tags:(s.tags||[]).join(", ") });
    setShowModal(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        name: form.name, description: form.description,
        calories: Number(form.calories), proteins: Number(form.proteins),
        fats: Number(form.fats), carbs: Number(form.carbs),
        photoUrl: form.photoUrl || undefined,
        tags: form.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
      };
      if (editing) await apiFetch(`/admin/snacks/${editing.id}`, token, { method: "PUT", body: JSON.stringify(body) });
      else await apiFetch("/admin/snacks", token, { method: "POST", body: JSON.stringify(body) });
      setShowModal(false);
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Удалить перекус?")) return;
    await apiFetch(`/admin/snacks/${id}`, token, { method: "DELETE" });
    load();
  };

  const toggle = async (id: number) => {
    await apiFetch(`/admin/snacks/${id}/toggle`, token, { method: "PATCH" });
    load();
  };

  const INPUT = "flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-semibold">Перекусы</h2>
        <div className="flex gap-2">
          <button onClick={load} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors">
            <Plus className="h-4 w-4" />Добавить
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-secondary animate-pulse" />)}
        </div>
      ) : snacks.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Apple className="h-10 w-10 mx-auto mb-3 text-border" />
          <p>Перекусы не добавлены</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {snacks.map(s => (
            <div key={s.id} className={`flex items-center gap-4 p-4 border border-border rounded-xl transition-opacity ${s.is_active ? "" : "opacity-50"}`}>
              {s.photo_url ? (
                <img src={s.photo_url} alt={s.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Apple className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm">{s.name}</p>
                  {!s.is_active && <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">скрыт</span>}
                </div>
                <p className="text-xs text-muted-foreground">{s.calories} ккал · Б {s.proteins}г · Ж {s.fats}г · У {s.carbs}г</p>
                {s.tags?.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {s.tags.map((t: string) => <span key={t} className="text-xs bg-secondary px-1.5 py-0.5 rounded-full">{t}</span>)}
                  </div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => toggle(s.id)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                  {s.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => del(s.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-background w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl flex flex-col max-h-[92dvh]">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border shrink-0">
              <h3 className="font-bold">{editing ? "Редактировать перекус" : "Новый перекус"}</h3>
              <button onClick={() => setShowModal(false)} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Название *</label>
                <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} className={INPUT} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Описание</label>
                <textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})} rows={2}
                  className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key:"calories", label:"Калории" }, { key:"proteins", label:"Белки (г)" },
                  { key:"fats", label:"Жиры (г)" }, { key:"carbs", label:"Углеводы (г)" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-sm font-medium block mb-1.5">{f.label}</label>
                    <input type="number" step="0.1" value={(form as any)[f.key]}
                      onChange={e => setForm({...form, [f.key]:e.target.value})} className={INPUT} />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">URL фото (необязательно)</label>
                <input value={form.photoUrl} onChange={e => setForm({...form, photoUrl:e.target.value})} placeholder="https://..." className={INPUT} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Теги (через запятую)</label>
                <input value={form.tags} onChange={e => setForm({...form, tags:e.target.value})} placeholder="белок, быстро, кето" className={INPUT} />
              </div>
            </div>
            <div className="shrink-0 px-5 pb-5 pt-4 border-t border-border">
              <button onClick={save} disabled={saving || !form.name}
                className="w-full h-11 rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50">
                {saving ? "Сохранение..." : editing ? "Сохранить изменения" : "Добавить перекус"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Admin Dashboard ─── */
const TABS = [
  { id: "analytics", label: "Аналитика",    icon: BarChart3,   roles: ["admin", "owner"] },
  { id: "users",     label: "Пользователи", icon: Users,       roles: ["admin", "owner"] },
  { id: "promo",     label: "Промокоды",    icon: Tag,         roles: ["admin", "owner"] },
  { id: "articles",  label: "Статьи",       icon: FileText,    roles: ["admin", "owner", "seo"] },
  { id: "pricing",   label: "Цены",         icon: DollarSign,  roles: ["admin", "owner"] },
  { id: "reviews",   label: "Отзывы",       icon: Star,        roles: ["admin", "owner"] },
  { id: "snacks",    label: "Перекусы",     icon: Apple,       roles: ["admin", "owner"] },
];

const ROLE_LABELS: Record<string, string> = { admin: "Администратор", owner: "Владелец", seo: "SEO-специалист" };

function AdminDashboard({ token, info, onLogout }: { token: string; info: any; onLogout: () => void }) {
  const allowedTabs = TABS.filter(t => t.roles.includes(info.role));
  const [activeTab, setActiveTab] = useState(allowedTabs[0]?.id || "articles");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="ФИТИТ" className="h-6 w-auto" />
            <span className="text-xs font-medium text-muted-foreground border-l border-border pl-4 hidden sm:block">Панель управления</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-tight">{info.name}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[info.role]}</p>
            </div>
            <button onClick={onLogout}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-xl px-3 h-9">
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab nav — scrollable on mobile */}
        <div className="flex gap-1 mb-8 border border-border rounded-2xl p-1 overflow-x-auto">
          {allowedTabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}>
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {activeTab === "analytics" && <AnalyticsTab token={token} />}
        {activeTab === "users"     && <UsersTab     token={token} />}
        {activeTab === "promo"     && <PromoTab     token={token} />}
        {activeTab === "articles"  && <ArticlesTab  token={token} />}
        {activeTab === "pricing"   && <PricingTab   token={token} />}
        {activeTab === "reviews"   && <ReviewsTab   token={token} />}
        {activeTab === "snacks"    && <SnacksTab    token={token} />}
      </div>
    </div>
  );
}

/* ─── Main ─── */
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
    localStorage.removeItem("fitit_admin_token"); localStorage.removeItem("fitit_admin_info");
    setToken(""); setInfo(null);
  };

  if (!token || !info) return <AdminLogin onLogin={handleLogin} />;
  return <AdminDashboard token={token} info={info} onLogout={handleLogout} />;
}
