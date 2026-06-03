import { useState, useCallback, useEffect } from "react";
import { useParams, Link, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetPlan,
  useGetPlanSummary,
  useRegeneratePlan,
  useReplaceMeal,
} from "@workspace/api-client-react";
import type { Meal } from "@workspace/api-client-react";
import { FileDown, RefreshCw, AlertCircle, Info, Calendar, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/App";
import { getGetPlanQueryKey, getGetPlanSummaryQueryKey } from "@workspace/api-client-react";

/* ─── Snacks Sidebar ─── */
function SnacksSidebar() {
  const [snacks, setSnacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSnacks = useCallback(() => {
    setLoading(true);
    fetch("/api/snacks")
      .then(r => r.json())
      .then(setSnacks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSnacks();
    const id = setInterval(fetchSnacks, 30000);
    return () => clearInterval(id);
  }, [fetchSnacks]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Перекусы</h3>
        <button onClick={fetchSnacks} title="Обновить"
          className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      {loading ? (
        <>
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </>
      ) : snacks.map(s => (
        <div key={s.id} className="bg-background border border-border rounded-xl p-3.5 space-y-2 hover:shadow-sm transition-shadow">
          {s.photo_url && (
            <img src={s.photo_url} alt={s.name} className="w-full h-20 object-cover rounded-lg" />
          )}
          <div>
            <p className="text-sm font-semibold leading-tight">{s.name}</p>
            {s.description && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{s.description}</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">{s.calories} ккал</span>
            <span className="text-xs text-muted-foreground">
              Б{parseFloat(s.proteins)} Ж{parseFloat(s.fats)} У{parseFloat(s.carbs)}
            </span>
          </div>
        </div>
      ))}
      <Link href="/snacks"
        className="block text-xs text-center text-muted-foreground hover:text-foreground transition-colors py-1">
        Посмотреть все перекусы →
      </Link>
    </div>
  );
}

const REPLACE_REASONS = ["Не нравится", "Нет продукта", "Дорого", "Долго готовить", "Аллергия"];

function parseIngredients(text: string): Array<{ name: string; amount: string }> {
  return text.split(", ").map((item) => {
    const parts = item.split(" — ");
    return { name: (parts[0] || item).trim(), amount: (parts[1] || "").trim() };
  });
}

/* ─── Smart amount consolidation ─── */
function parseAmount(amount: string): { num: number; unit: string } | null {
  if (!amount) return null;
  const m = amount.trim().match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!m) return null;
  return { num: parseFloat(m[1].replace(",", ".")), unit: m[2].trim() };
}

function consolidateAmounts(amounts: string[]): string {
  if (amounts.length === 0) return "";
  if (amounts.length === 1) return amounts[0];

  const parsed = amounts.map(parseAmount);
  const allParsed = parsed.every(Boolean);

  if (allParsed) {
    const units = new Set(parsed.map(p => p!.unit.toLowerCase()));
    if (units.size === 1) {
      const unit = [...units][0];
      const total = parsed.reduce((s, p) => s + p!.num, 0);
      const rounded = Math.abs(total - Math.round(total)) < 0.05 ? Math.round(total) : parseFloat(total.toFixed(1));
      return unit ? `${rounded} ${unit}` : String(rounded);
    }
  }
  // Can't consolidate — show unique
  const unique = [...new Set(amounts)];
  return unique.join(", ");
}

/* ─── Shopping List Tab ─── */
function ShoppingListTab({ meals, totalDays }: { meals: Meal[]; totalDays: number }) {
  const [fromDay, setFromDay] = useState(1);
  const [toDay, setToDay] = useState(totalDays);

  const filteredMeals = meals.filter(m => m.dayNumber >= fromDay && m.dayNumber <= toDay);

  const aggregated = new Map<string, string[]>();
  for (const meal of filteredMeals) {
    for (const item of parseIngredients(meal.ingredients)) {
      if (!item.name) continue;
      if (!aggregated.has(item.name)) aggregated.set(item.name, []);
      if (item.amount) aggregated.get(item.name)!.push(item.amount);
    }
  }

  const sorted = [...aggregated.entries()].sort((a, b) => a[0].localeCompare(b[0], "ru"));

  const presets = [
    { label: "Весь план", from: 1, to: totalDays },
    { label: "Нед. 1", from: 1, to: Math.min(7, totalDays) },
    ...(totalDays > 7 ? [{ label: "Нед. 2", from: 8, to: Math.min(14, totalDays) }] : []),
    ...(totalDays > 14 ? [{ label: "Нед. 3", from: 15, to: Math.min(21, totalDays) }] : []),
    ...(totalDays > 21 ? [{ label: "Нед. 4", from: 22, to: Math.min(30, totalDays) }] : []),
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <Button
              key={p.label}
              variant={fromDay === p.from && toDay === p.to ? "default" : "outline"}
              size="sm"
              onClick={() => { setFromDay(p.from); setToDay(p.to); }}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Дни:</span>
          <input
            type="number" min={1} max={totalDays} value={fromDay}
            onChange={e => setFromDay(Math.max(1, Math.min(Number(e.target.value), toDay)))}
            className="w-14 h-8 rounded-lg border border-input bg-background px-2 text-center text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span>—</span>
          <input
            type="number" min={fromDay} max={totalDays} value={toDay}
            onChange={e => setToDay(Math.max(fromDay, Math.min(Number(e.target.value), totalDays)))}
            className="w-14 h-8 rounded-lg border border-input bg-background px-2 text-center text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="text-xs">({filteredMeals.length > 0 ? `${sorted.length} позиций` : "0 позиций"})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {sorted.map(([name, amounts]) => {
          const consolidated = consolidateAmounts(amounts);
          return (
            <div key={name} className="flex justify-between items-center p-3 border rounded-lg bg-card">
              <span className="font-medium text-sm">{name}</span>
              {consolidated && (
                <span className="text-sm font-semibold text-foreground ml-2 text-right shrink-0 whitespace-nowrap">
                  {consolidated}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Список покупок пуст.</p>
        </div>
      )}
    </div>
  );
}

export default function PlanView() {
  const params = useParams();
  const search = useSearch();
  const planId = Number(params.planId);
  const { toast } = useToast();

  const defaultTab = new URLSearchParams(search).get("tab") === "shopping" ? "shopping" : "days";
  const [activeDay, setActiveDay] = useState(1);
  const [activeMainTab, setActiveMainTab] = useState<"days" | "shopping">(defaultTab as any);
  const [replacingMealId, setReplacingMealId] = useState<number | null>(null);

  const { data: planData, isLoading: isLoadingPlan } = useGetPlan(planId, {
    query: { enabled: !!planId },
  });

  const { data: summary, isLoading: isLoadingSummary } = useGetPlanSummary(planId, {
    query: { enabled: !!planId },
  });

  const regenerateMutation = useRegeneratePlan();
  const replaceMealMutation = useReplaceMeal();

  const handleRegenerate = () => {
    if (!confirm("Это перепишет весь план питания. Продолжить?")) return;
    regenerateMutation.mutate(
      { planId },
      {
        onSuccess: () => {
          toast({ title: "Готово", description: "План пересчитан." });
          queryClient.invalidateQueries({ queryKey: getGetPlanQueryKey(planId) });
          queryClient.invalidateQueries({ queryKey: getGetPlanSummaryQueryKey(planId) });
        },
        onError: () => toast({ title: "Ошибка", description: "Не удалось пересчитать план.", variant: "destructive" }),
      },
    );
  };

  const handleReplaceMeal = (mealId: number) => {
    setReplacingMealId(mealId);
    replaceMealMutation.mutate(
      { planId, mealId, data: {} },
      {
        onSuccess: () => {
          setReplacingMealId(null);
          toast({ title: "Блюдо заменено" });
          queryClient.invalidateQueries({ queryKey: getGetPlanQueryKey(planId) });
        },
        onError: () => {
          setReplacingMealId(null);
          toast({ title: "Ошибка замены", variant: "destructive" });
        },
      },
    );
  };

  if (isLoadingPlan || isLoadingSummary) {
    return (
      <Layout>
        <div className="container px-4 py-6 sm:py-8 space-y-4 sm:space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 sm:h-24" />)}
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Layout>
    );
  }

  if (!planData) {
    return (
      <Layout>
        <div className="container px-4 py-24 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">План не найден</h2>
          <Link href="/dashboard"><Button className="mt-4">В панель</Button></Link>
        </div>
      </Layout>
    );
  }

  const mealsByDay: Record<number, Meal[]> = {};
  planData.meals?.forEach((meal) => {
    if (!mealsByDay[meal.dayNumber]) mealsByDay[meal.dayNumber] = [];
    mealsByDay[meal.dayNumber].push(meal);
  });
  Object.values(mealsByDay).forEach((meals) => meals.sort((a, b) => a.mealNumber - b.mealNumber));
  const days = Object.keys(mealsByDay).map(Number).sort((a, b) => a - b);
  const totalDays = days.length > 0 ? Math.max(...days) : 1;
  const currentDayMeals = mealsByDay[activeDay] || [];
  const allMeals: Meal[] = planData.meals || [];

  // Day highlighting: calculate how many days have passed since plan start
  const planStart = planData.startDate ? new Date(planData.startDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysPassed = planStart
    ? Math.floor((today.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24))
    : -1;
  const isPast = (day: number) => daysPassed >= 0 && day <= daysPassed;
  const isToday = (day: number) => daysPassed >= 0 && day === daysPassed + 1;

  return (
    <Layout>
      <div className="bg-muted/10 min-h-screen pb-12">
        {/* Sticky sub-header */}
        <div className="border-b bg-background sticky top-16 z-40">
          <div className="container px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                <span className="truncate">Персональный план питания</span>
              </h1>
              {summary && (
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {summary.avgCalories} ккал/день
                  </span>
                  <span>Б: {summary.avgProteins}г</span>
                  <span>Ж: {summary.avgFats}г</span>
                  <span>У: {summary.avgCarbs}г</span>
                  <span>{summary.totalDays} дней</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={() => window.open(`/api/plans/${planId}/export/pdf`, "_blank")}
              >
                <FileDown className="mr-1.5 h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={handleRegenerate}
                disabled={regenerateMutation.isPending}
              >
                <RefreshCw className={`mr-1.5 h-4 w-4 ${regenerateMutation.isPending ? "animate-spin" : ""}`} />
                <span className="hidden xs:inline">Пересобрать</span>
                <span className="xs:hidden">Пересоб.</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="container px-4 py-5 sm:py-8">
          <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0">
          <Tabs value={activeMainTab} onValueChange={(v) => setActiveMainTab(v as any)} className="space-y-5 sm:space-y-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="days" className="flex-1 sm:flex-none gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Рацион по дням</span>
              </TabsTrigger>
              <TabsTrigger value="shopping" className="flex-1 sm:flex-none gap-1.5">
                <ShoppingCart className="h-4 w-4" />
                <span>Список покупок</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="days" className="mt-0">
              {/* Day selector */}
              <div className="mb-5 sm:mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-2 w-max">
                  {days.map((day) => {
                    const past = isPast(day);
                    const todayDay = isToday(day);
                    const active = activeDay === day;
                    return (
                      <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={`relative px-4 sm:px-5 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : todayDay
                            ? "border-primary/60 bg-primary/8 text-foreground"
                            : past
                            ? "border-border bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                            : "bg-background hover:border-primary hover:bg-primary/5"
                        }`}
                      >
                        {past && !active && (
                          <span className="absolute inset-0 rounded-full border border-dashed border-border opacity-60 pointer-events-none" />
                        )}
                        {todayDay ? "Сегодня" : `День ${day}`}
                        {past && !active && (
                          <span className="ml-1 text-[10px] opacity-50">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {currentDayMeals.map((meal) => (
                  <Card key={meal.id} className="overflow-hidden">
                    <div className="bg-muted/40 px-4 sm:px-6 py-3 border-b flex justify-between items-center gap-2">
                      <h3 className="font-semibold text-sm sm:text-base">{meal.mealType}</h3>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <Badge variant="secondary" className="font-mono text-xs">{meal.calories} ккал</Badge>
                        <span className="text-xs text-muted-foreground hidden md:inline">
                          Б:{meal.proteins} Ж:{meal.fats} У:{meal.carbs}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4 sm:p-6">
                      <h4 className="text-lg sm:text-xl font-bold mb-2">{meal.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">{meal.ingredients}</p>

                      {/* Macros on mobile */}
                      <div className="flex gap-3 text-xs text-muted-foreground mb-3 md:hidden">
                        <span>Б: {meal.proteins}г</span>
                        <span>Ж: {meal.fats}г</span>
                        <span>У: {meal.carbs}г</span>
                      </div>

                      <Accordion type="single" collapsible>
                        <AccordionItem value="recipe" className="border-none">
                          <AccordionTrigger className="py-2 hover:no-underline text-primary text-sm font-medium">
                            Показать рецепт
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed pt-2 text-sm">
                            {meal.recipe}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Заменить блюдо:</p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {REPLACE_REASONS.map((reason) => (
                            <button
                              key={reason}
                              onClick={() => handleReplaceMeal(meal.id)}
                              disabled={replaceMealMutation.isPending && replacingMealId === meal.id}
                              className="text-xs px-2.5 py-1.5 rounded-full border hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                              {reason}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="shopping" className="mt-0">
              <ShoppingListTab meals={allMeals} totalDays={totalDays} />
            </TabsContent>
          </Tabs>
          </div>
          <div className="hidden lg:block w-56 xl:w-64 shrink-0 sticky top-24">
            <SnacksSidebar />
          </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
