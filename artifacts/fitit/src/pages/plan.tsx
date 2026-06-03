import { useState } from "react";
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

const REPLACE_REASONS = [
  "Не нравится",
  "Нет продукта",
  "Дорого",
  "Долго готовить",
  "Аллергия",
];

function parseIngredients(text: string): Array<{ name: string; amount: string }> {
  return text.split(", ").map((item) => {
    const parts = item.split(" — ");
    return { name: (parts[0] || item).trim(), amount: (parts[1] || "").trim() };
  });
}

function ShoppingListTab({ meals }: { meals: Meal[] }) {
  const [filter, setFilter] = useState<"week" | "all">("all");

  const filteredMeals = filter === "week" ? meals.filter((m) => m.dayNumber <= 7) : meals;

  const aggregated = new Map<string, string[]>();
  for (const meal of filteredMeals) {
    for (const item of parseIngredients(meal.ingredients)) {
      if (!item.name) continue;
      if (!aggregated.has(item.name)) aggregated.set(item.name, []);
      if (item.amount) aggregated.get(item.name)!.push(item.amount);
    }
  }

  const sorted = [...aggregated.entries()].sort((a, b) => a[0].localeCompare(b[0], "ru"));

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Весь план
        </Button>
        <Button
          variant={filter === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("week")}
        >
          На неделю
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map(([name, amounts]) => (
          <div key={name} className="flex justify-between items-center p-3 border rounded-lg bg-card">
            <span className="font-medium text-sm">{name}</span>
            {amounts.length > 0 && (
              <span className="text-xs text-muted-foreground ml-2 text-right">
                {amounts.slice(0, 3).join(", ")}
                {amounts.length > 3 ? ` +${amounts.length - 3}` : ""}
              </span>
            )}
          </div>
        ))}
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
        <div className="container py-8 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
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
        <div className="container py-24 text-center">
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
  const currentDayMeals = mealsByDay[activeDay] || [];
  const allMeals: Meal[] = planData.meals || [];

  return (
    <Layout>
      <div className="bg-muted/10 min-h-screen pb-12">
        {/* Sticky header */}
        <div className="border-b bg-background sticky top-16 z-40">
          <div className="container py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Персональный план питания
              </h1>
              {summary && (
                <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Info className="h-3.5 w-3.5" /> {summary.avgCalories} ккал/день</span>
                  <span>Б: {summary.avgProteins}г</span>
                  <span>Ж: {summary.avgFats}г</span>
                  <span>У: {summary.avgCarbs}г</span>
                  <span>{summary.totalDays} дней</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/api/plans/${planId}/export/pdf`, "_blank")}
              >
                <FileDown className="mr-2 h-4 w-4" /> PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={regenerateMutation.isPending}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${regenerateMutation.isPending ? "animate-spin" : ""}`} />
                Пересобрать
              </Button>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <Tabs value={activeMainTab} onValueChange={(v) => setActiveMainTab(v as any)} className="space-y-6">
            <TabsList>
              <TabsTrigger value="days">
                <Calendar className="mr-2 h-4 w-4" />
                Рацион по дням
              </TabsTrigger>
              <TabsTrigger value="shopping">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Список покупок
              </TabsTrigger>
            </TabsList>

            <TabsContent value="days" className="mt-0">
              {/* Day selector */}
              <div className="mb-6 overflow-x-auto pb-2">
                <div className="flex gap-2 w-max">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
                        activeDay === day
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      День {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {currentDayMeals.map((meal) => (
                  <Card key={meal.id} className="overflow-hidden">
                    <div className="bg-muted/40 px-6 py-3 border-b flex justify-between items-center">
                      <h3 className="font-semibold">{meal.mealType}</h3>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="font-mono">{meal.calories} ккал</Badge>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          Б:{meal.proteins} Ж:{meal.fats} У:{meal.carbs}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h4 className="text-xl font-bold mb-2">{meal.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{meal.ingredients}</p>

                      <Accordion type="single" collapsible>
                        <AccordionItem value="recipe" className="border-none">
                          <AccordionTrigger className="py-2 hover:no-underline text-primary text-sm font-medium">
                            Показать рецепт
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                            {meal.recipe}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <div className="mt-4 pt-4 border-t flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Заменить блюдо:</span>
                        {REPLACE_REASONS.map((reason) => (
                          <button
                            key={reason}
                            onClick={() => handleReplaceMeal(meal.id)}
                            disabled={replaceMealMutation.isPending && replacingMealId === meal.id}
                            className="text-xs px-2.5 py-1 rounded-full border hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                          >
                            {reason}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="shopping" className="mt-0">
              <ShoppingListTab meals={allMeals} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
