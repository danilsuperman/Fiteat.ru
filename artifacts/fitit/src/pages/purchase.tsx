import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { PlanInputDuration } from "@workspace/api-client-react";
import { Check, Loader2, ShieldCheck, X, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AI_UPSELL_PRICE = 299;

const TIERS = [
  {
    duration: PlanInputDuration.week,
    name: "7 дней",
    price: 490,
    priceLabel: "490 ₽",
    period: "/ неделя",
    features: ["Меню на 7 дней", "Расчёт КБЖУ", "Список покупок", "Рецепты"],
    highlight: false,
  },
  {
    duration: PlanInputDuration.month,
    name: "30 дней",
    price: 1490,
    priceLabel: "1 490 ₽",
    period: "/ месяц",
    features: ["Меню на 30 дней", "Замена блюд", "PDF-экспорт", "Трекинг прогресса"],
    highlight: true,
    badge: "Популярный выбор",
  },
  {
    duration: PlanInputDuration.three_months,
    name: "90 дней",
    price: 3490,
    priceLabel: "3 490 ₽",
    period: "/ 3 месяца",
    features: ["Меню на 90 дней", "Экономия 22%", "Смена цели без доплат", "Корректировки"],
    highlight: false,
  },
  {
    duration: PlanInputDuration.six_months,
    name: "180 дней",
    price: 5990,
    priceLabel: "5 990 ₽",
    period: "/ 6 месяцев",
    features: ["Меню на 180 дней", "Экономия 32%", "Приоритетная поддержка", "Корректировки без лимита"],
    highlight: false,
  },
];

type Tier = typeof TIERS[0];
function fmt(n: number) { return new Intl.NumberFormat("ru-RU").format(n); }

/* ─── Package Modal ─── */
function PackageModal({ tier, onClose }: { tier: Tier; onClose: () => void }) {
  const { token } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [withAiChat, setWithAiChat] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalPrice = tier.price + (withAiChat ? AI_UPSELL_PRICE : 0);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ duration: tier.duration, withAiChat }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Не удалось оформить план");
      toast({
        title: "Успешно!",
        description: withAiChat ? "План и AI-нутрициолог активированы!" : "Ваш персональный план сформирован.",
      });
      setLocation(`/plan/${data.id}`);
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-background w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl flex flex-col max-h-[92dvh]">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border shrink-0">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{tier.priceLabel}</span>
              <span className="text-sm text-muted-foreground">{tier.period}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">Персональный план питания · {tier.name}</p>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground mt-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Features */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Что входит</p>
            <ul className="space-y-2.5">
              {tier.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-foreground" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* AI upsell */}
          <div
            className={`rounded-2xl border-2 p-4 transition-all cursor-pointer select-none ${withAiChat ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/40"}`}
            onClick={() => setWithAiChat(v => !v)}
          >
            <div className="flex items-start gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${withAiChat ? "bg-foreground text-background" : "bg-secondary"}`}>
                <Bot className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm">Чат с AI-нутрициологом</p>
                  <span className="text-sm font-bold whitespace-nowrap text-foreground">+{fmt(AI_UPSELL_PRICE)} ₽</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Персональные ответы на вопросы о питании, рецептах и достижении вашей цели
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5">
                  {["24/7 доступ", "Мгновенные ответы", "Адаптация к вашему плану"].map(t => (
                    <span key={t} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 shrink-0" />{t}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all mt-0.5 ${withAiChat ? "bg-foreground border-foreground" : "border-border"}`}>
                {withAiChat && <Check className="h-3 w-3 text-background" />}
              </div>
            </div>
          </div>

          {/* Trust */}
          <div className="flex items-center gap-3 py-3 px-4 bg-secondary/50 rounded-xl">
            <ShieldCheck className="h-5 w-5 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Алгоритм бесплатно перестроит план, если он вам не подойдёт
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 pb-5 pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Итого:</span>
            <span className="text-2xl font-bold">{fmt(totalPrice)} ₽</span>
          </div>
          <Button className="w-full h-12 rounded-xl text-base font-semibold" onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Оформляем..." : "Оформить план"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function Payment() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  const openModal = (tier: Tier) => {
    if (!isAuthenticated) { setLocation("/login"); return; }
    setSelectedTier(tier);
  };

  return (
    <Layout>
      <div className="bg-muted/10 py-16 lg:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Выберите свой план</h1>
            <p className="text-xl text-muted-foreground">
              Персональное питание под ваш метаболизм, цели и предпочтения.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {TIERS.map((tier) => (
              <div
                key={tier.duration}
                className={`relative flex flex-col rounded-2xl p-6 border transition-all hover:shadow-md cursor-pointer group ${
                  tier.highlight ? "border-foreground bg-foreground text-background shadow-lg" : "border-border bg-background hover:border-foreground/40"
                }`}
                onClick={() => openModal(tier)}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {tier.badge}
                    </span>
                  </div>
                )}
                <div className="mb-4">
                  <p className="text-2xl font-bold">{tier.name}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-3xl font-bold ${tier.highlight ? "text-background" : ""}`}>{tier.priceLabel}</span>
                    <span className={`text-sm ${tier.highlight ? "text-background/60" : "text-muted-foreground"}`}>{tier.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 flex-1 mb-5">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className={`h-4 w-4 shrink-0 ${tier.highlight ? "text-background/70" : "text-foreground/60"}`} />
                      <span className={tier.highlight ? "text-background/80" : "text-muted-foreground"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full rounded-xl text-sm font-semibold ${tier.highlight ? "bg-background text-foreground hover:bg-background/90" : "group-hover:bg-foreground group-hover:text-background"}`}
                  variant={tier.highlight ? "ghost" : "outline"}
                >
                  Выбрать план
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-card border rounded-2xl p-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
            <div className="h-14 w-14 bg-foreground/10 rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck className="h-7 w-7 text-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold">100% гарантия качества</h3>
              <p className="text-muted-foreground mt-1">
                Если план вам не подойдёт — алгоритм бесплатно перестроит его с учётом ваших замечаний.
              </p>
            </div>
          </div>
        </div>
      </div>

      {selectedTier && <PackageModal tier={selectedTier} onClose={() => setSelectedTier(null)} />}
    </Layout>
  );
}
