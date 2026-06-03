import { useState } from "react";
import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetPlan, useGetPlanSummary, useRegeneratePlan, useExportPlan } from "@workspace/api-client-react";
import { Meal } from "@workspace/api-client-react";
import { FileDown, RefreshCw, AlertCircle, Info, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/App";
import { getGetPlanQueryKey, getGetPlanSummaryQueryKey } from "@workspace/api-client-react";

export default function PlanView() {
  const params = useParams();
  const planId = Number(params.planId);
  const { toast } = useToast();
  
  const [activeDay, setActiveDay] = useState(1);

  const { data: planData, isLoading: isLoadingPlan } = useGetPlan(planId, {
    query: { enabled: !!planId }
  });

  const { data: summary, isLoading: isLoadingSummary } = useGetPlanSummary(planId, {
    query: { enabled: !!planId }
  });

  const exportMutation = useExportPlan();
  const regenerateMutation = useRegeneratePlan();

  const handleExport = (format: string) => {
    exportMutation.mutate({ planId, format }, {
      onSuccess: (res) => {
        window.open(res.url, "_blank");
      },
      onError: () => {
        toast({ title: "Ошибка", description: "Не удалось экспортировать план", variant: "destructive" });
      }
    });
  };

  const handleRegenerate = () => {
    if (confirm("Вы уверены? Это полностью перепишет ваш текущий план питания.")) {
      regenerateMutation.mutate({ planId }, {
        onSuccess: () => {
          toast({ title: "Успешно", description: "План пересчитан." });
          queryClient.invalidateQueries({ queryKey: getGetPlanQueryKey(planId) });
          queryClient.invalidateQueries({ queryKey: getGetPlanSummaryQueryKey(planId) });
        },
        onError: () => {
          toast({ title: "Ошибка", description: "Не удалось пересчитать план", variant: "destructive" });
        }
      });
    }
  };

  if (isLoadingPlan || isLoadingSummary) {
    return (
      <Layout>
        <div className="container py-8 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid md:grid-cols-4 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
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

  // Group meals by day
  const mealsByDay: Record<number, Meal[]> = {};
  planData.meals?.forEach(meal => {
    if (!mealsByDay[meal.dayNumber]) mealsByDay[meal.dayNumber] = [];
    mealsByDay[meal.dayNumber].push(meal);
  });
  
  // Sort meals within each day by mealNumber
  Object.values(mealsByDay).forEach(meals => {
    meals.sort((a, b) => a.mealNumber - b.mealNumber);
  });

  const days = Object.keys(mealsByDay).map(Number).sort((a, b) => a - b);
  const currentDayMeals = mealsByDay[activeDay] || [];

  return (
    <Layout>
      <div className="bg-muted/10 min-h-screen pb-12">
        <div className="border-b bg-background sticky top-16 z-40">
          <div className="container py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Ваш персональный план
              </h1>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Info className="h-4 w-4" /> {summary?.avgCalories} ккал/день</span>
                <span>Б: {summary?.avgProteins}г</span>
                <span>Ж: {summary?.avgFats}г</span>
                <span>У: {summary?.avgCarbs}г</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
                <FileDown className="mr-2 h-4 w-4" /> PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleRegenerate}>
                <RefreshCw className="mr-2 h-4 w-4" /> Пересобрать
              </Button>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <Tabs value={activeDay.toString()} onValueChange={(v) => setActiveDay(Number(v))}>
            <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <TabsList className="h-12 w-max inline-flex p-1">
                {days.map(day => (
                  <TabsTrigger 
                    key={day} 
                    value={day.toString()}
                    className="px-6 py-2 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    День {day}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={activeDay.toString()} className="mt-0 space-y-6">
              {currentDayMeals.map(meal => (
                <Card key={meal.id} className="overflow-hidden border-muted">
                  <div className="bg-muted/30 px-6 py-3 border-b flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{meal.mealType}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="secondary" className="font-mono">{meal.calories} ккал</Badge>
                      <span className="hidden sm:inline text-muted-foreground">Б:{meal.proteins} Ж:{meal.fats} У:{meal.carbs}</span>
                    </div>
                  </div>
                  <CardContent className="p-0">
                    <div className="p-6">
                      <h4 className="text-xl font-bold mb-2">{meal.name}</h4>
                      <p className="text-muted-foreground mb-4">{meal.ingredients}</p>
                      
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="recipe" className="border-none">
                          <AccordionTrigger className="py-2 hover:no-underline text-primary text-sm font-medium">
                            Показать рецепт
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                            {meal.recipe}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
