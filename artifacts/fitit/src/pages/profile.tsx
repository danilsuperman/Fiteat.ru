import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useGetMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, CreditCard, Bell, ChevronRight, Check, Loader2 } from "lucide-react";

const API = "/api";
function fmt(n: number) { return new Intl.NumberFormat("ru-RU").format(n); }
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-background border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ProfileSection({ token, user }: { token: string; user: any }) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) { setName(user.name); setEmail(user.email); } }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch(`${API}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      toast({ title: "Данные обновлены" });
      setEditing(false);
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Section title="Личные данные" icon={User}>
      {!editing ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Имя</p>
              <p className="text-sm font-medium">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Email</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Дата регистрации</p>
              <p className="text-sm font-medium">{user?.createdAt ? fmtDate(user.createdAt) : "—"}</p>
            </div>
          </div>
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors mt-2">
            Редактировать <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={save} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Имя</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Сохранить
            </button>
            <button type="button" onClick={() => setEditing(false)}
              className="h-9 px-4 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors">
              Отмена
            </button>
          </div>
        </form>
      )}
    </Section>
  );
}

function PasswordSection({ token }: { token: string }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) { toast({ title: "Пароли не совпадают", variant: "destructive" }); return; }
    if (form.next.length < 6) { toast({ title: "Минимум 6 символов", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const r = await fetch(`${API}/profile/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setSuccess(true);
      setForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Section title="Безопасность" icon={Lock}>
      <form onSubmit={save} className="space-y-3">
        {[
          { key: "current", label: "Текущий пароль" },
          { key: "next", label: "Новый пароль" },
          { key: "confirm", label: "Подтвердите новый пароль" },
        ].map(f => (
          <div key={f.key} className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
            <input type="password" value={(form as any)[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        ))}
        <button type="submit" disabled={loading}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 mt-1">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : success ? <Check className="h-3.5 w-3.5" /> : null}
          {success ? "Пароль обновлён" : "Изменить пароль"}
        </button>
      </form>
    </Section>
  );
}

function PaymentsSection({ token }: { token: string }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/profile/payments`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setPayments(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <Section title="История платежей" icon={CreditCard}>
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-secondary animate-pulse" />)}
        </div>
      ) : payments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Платежей пока нет</p>
      ) : (
        <div className="space-y-0 divide-y divide-border">
          {payments.map(p => (
            <div key={p.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{p.package_name || "Персональный план"}</p>
                <p className="text-xs text-muted-foreground">{fmtDate(p.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{fmt(Math.round(p.amount_kopecks / 100))} ₽</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  p.status === "success" ? "bg-green-500/10 text-green-700" : "bg-secondary text-muted-foreground"
                }`}>{p.status === "success" ? "Оплачен" : p.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function AutoPaySection() {
  const [enabled, setEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fitit_autopay") || "false"); } catch { return false; }
  });

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    try { localStorage.setItem("fitit_autopay", JSON.stringify(next)); } catch {}
  };

  return (
    <Section title="Автоплатёж" icon={Bell}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium mb-0.5">Автоматическое продление</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            {enabled
              ? "Подписка будет автоматически продлена за 3 дня до окончания"
              : "Включите, чтобы не прерывать доступ к плану"}
          </p>
        </div>
        <button onClick={toggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-foreground" : "bg-border"}`}>
          <span className={`inline-block h-4 w-4 rounded-full bg-background transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>
    </Section>
  );
}

export default function Profile() {
  const { isAuthenticated, token } = useAuth();
  const [, setLocation] = useLocation();
  const { data: user } = useGetMe({ query: { enabled: isAuthenticated } });

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return (
    <Layout>
      <div className="py-10 sm:py-16">
        <div className="container px-4 max-w-2xl">
          <div className="mb-8">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Аккаунт</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Профиль</h1>
          </div>

          <div className="space-y-4">
            <ProfileSection token={token!} user={user} />
            <PasswordSection token={token!} />
            <PaymentsSection token={token!} />
            <AutoPaySection />
          </div>
        </div>
      </div>
    </Layout>
  );
}
