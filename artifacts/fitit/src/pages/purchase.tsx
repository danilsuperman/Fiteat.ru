import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreatePlan, useGetMetabolicResult } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { PlanInputDuration } from "@workspace/api-client-react";
import { Check, Loader2, ShieldCheck, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TIERS = [
  {
    duration: PlanInputDuration.week,
    name: "Пробная неделя",
    price: "490 ₽",
    period: "/ неделя",
    features: [
      "Персональное меню на 7 дней",
      "Точный расчет КБЖУ",
      "Удобный список покупок",
      "Простые рецепты"
    ],
    highlight: false
  },
  {
    duration: PlanInputDuration.month,
    name: "Трансформация",
    price: "1490 ₽",
    period: "/ месяц",
    features: [
      "Все из Пробной недели",
      "Меню на 30 дней",
      "Алгоритм замены блюд",
      "Еженедельная адаптация"
    ],
    highlight: true,
    badge: "Популярный выбор"
  },
  {
    duration: PlanInputDuration.three_months,
    name: "Фундамент",
    price: "3490 ₽",
    period: "/ 3 месяца",
    features: [
      "Все из месяца",
      "Экономия 22%",
      "Трекинг прогресса",
      "Смена цели без доплат"
    ],
    highlight: false
  }
];

export default function Purchase() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createPlanMutation = useCreatePlan();

  const handlePurchase = (duration: PlanInputDuration) => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    createPlanMutation.mutate({ data: { duration } }, {
      onSuccess: (plan) => {
        toast({
          title: "Успешно!",
          description: "Ваш персональный план сформирован.",
        });
        setLocation(`/plan/${plan.id}`);
      },
      onError: (err) => {
        toast({
          title: "Ошибка оплаты",
          description: err.message || "Не удалось оформить план",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Layout>
      <div className="bg-muted/10 py-16 lg:py-24">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Выберите свой план</h1>
            <p className="text-xl text-muted-foreground">
              Инвестируйте в свое здоровье. Научный подход к питанию, который дает гарантированный результат.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {TIERS.map((tier) => (
              <Card 
                key={tier.duration} 
                className={`relative flex flex-col ${tier.highlight ? 'border-primary shadow-lg ring-1 ring-primary' : ''}`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {tier.badge}
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <div className="mt-4 flex items-baseline text-4xl font-bold">
                    {tier.price}
                    <span className="ml-1 text-xl font-normal text-muted-foreground">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                        <span className="text-sm">{feature}</span>
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
                    {createPlanMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Выбрать план
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-16 bg-card border rounded-2xl p-8 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">100% гарантия качества</h3>
              <p className="text-muted-foreground mt-1">
                Если план вам не подойдет, алгоритм бесплатно перестроит его с учетом ваших замечаний. Мы работаем на результат.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
