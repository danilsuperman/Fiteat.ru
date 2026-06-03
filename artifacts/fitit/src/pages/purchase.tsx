import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreatePlan } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { PlanInputDuration } from "@workspace/api-client-react";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TIERS = [
  {
    duration: PlanInputDuration.week,
    name: "7 дней",
    price: "490 ₽",
    period: "/ неделя",
    features: ["Меню на 7 дней", "Расчёт КБЖУ", "Список покупок", "Рецепты"],
    highlight: false,
  },
  {
    duration: PlanInputDuration.month,
    name: "30 дней",
    price: "1 490 ₽",
    period: "/ месяц",
    features: ["Меню на 30 дней", "Замена блюд", "PDF-экспорт", "Трекинг прогресса"],
    highlight: true,
    badge: "Популярный выбор",
  },
  {
    duration: PlanInputDuration.three_months,
    name: "90 дней",
    price: "3 490 ₽",
    period: "/ 3 месяца",
    features: ["Меню на 90 дней", "Экономия 22%", "Смена цели без доплат", "Корректировки"],
    highlight: false,
  },
  {
    duration: PlanInputDuration.six_months,
    name: "180 дней",
    price: "5 990 ₽",
    period: "/ 6 месяцев",
    features: ["Меню на 180 дней", "Экономия 32%", "Приоритетная поддержка", "Корректировки без лимита"],
    highlight: false,
  },
];

export default function Payment() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loadingDuration, setLoadingDuration] = useState<string | null>(null);
  const createPlanMutation = useCreatePlan();

  const handlePurchase = (duration: PlanInputDuration) => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    setLoadingDuration(duration);
    createPlanMutation.mutate(
      { data: { duration } },
      {
        onSuccess: (plan) => {
          toast({ title: "Успешно!", description: "Ваш персональный план сформирован." });
          setLocation(`/plan/${plan.id}`);
        },
        onError: (err) => {
          setLoadingDuration(null);
          toast({ title: "Ошибка", description: err.message || "Не удалось оформить план", variant: "destructive" });
        },
      },
    );
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
              <Card
                key={tier.duration}
                className={`relative flex flex-col ${tier.highlight ? "border-primary shadow-lg ring-1 ring-primary" : ""}`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {tier.badge}
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <div className="mt-3 flex items-baseline gap-1 text-3xl font-bold">
                    {tier.price}
                    <span className="text-base font-normal text-muted-foreground">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={tier.highlight ? "default" : "outline"}
                    size="lg"
                    onClick={() => handlePurchase(tier.duration)}
                    disabled={createPlanMutation.isPending}
                  >
                    {loadingDuration === tier.duration && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Выбрать план
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-16 bg-card border rounded-2xl p-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
            <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck className="h-7 w-7 text-primary" />
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
    </Layout>
  );
}
