import { Link } from "wouter";
import { useGetMetabolicResult } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Flame, ShieldAlert, Target, Scale, Brain } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Result() {
  const { isAuthenticated } = useAuth();
  const { data: result, isLoading, error } = useGetMetabolicResult({
    query: { enabled: isAuthenticated },
  });

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Для просмотра результатов необходимо войти</h2>
          <Link href="/login"><Button>Войти</Button></Link>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container px-4 py-8 sm:py-12 space-y-6 sm:space-y-8">
          <Skeleton className="h-10 w-3/4 max-w-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <Skeleton className="h-44 sm:h-48" />
            <Skeleton className="h-44 sm:h-48" />
            <Skeleton className="h-44 sm:h-48" />
          </div>
          <Skeleton className="h-56 sm:h-64" />
        </div>
      </Layout>
    );
  }

  if (error || !result) {
    return (
      <Layout>
        <div className="container px-4 py-24 text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Результаты не найдены</h2>
          <p className="text-muted-foreground">Пройдите опрос, чтобы получить персональный расчёт.</p>
          <Link href="/survey/metabolism"><Button>Пройти опрос</Button></Link>
        </div>
      </Layout>
    );
  }

  const total = result.proteins + result.fats + result.carbs;

  return (
    <Layout>
      <div className="bg-muted/20 py-8 sm:py-12">
        <div className="container px-4 max-w-5xl space-y-6 sm:space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">Ваш метаболический профиль</h1>
            <p className="text-base sm:text-lg text-muted-foreground">Персональный расчёт на основе ваших данных.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-primary text-primary-foreground border-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Target className="h-5 w-5 shrink-0" />
                  Цель: {result.targetCalories} ккал
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">Суточная норма</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {[
                  { label: "Белки", value: result.proteins, color: "bg-blue-300" },
                  { label: "Жиры", value: result.fats, color: "bg-yellow-300" },
                  { label: "Углеводы", value: result.carbs, color: "bg-green-300" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>{m.label}</span>
                      <span className="font-bold">{m.value}г</span>
                    </div>
                    <div className="h-2 rounded-full bg-primary-foreground/20 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${m.color}`}
                        style={{ width: `${Math.round((m.value / total) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Flame className="h-5 w-5 text-orange-500 shrink-0" />
                  Базовый обмен (BMR)
                </CardTitle>
                <CardDescription>Расход в покое</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl sm:text-4xl font-bold">
                  {result.bmr}{" "}
                  <span className="text-base sm:text-lg font-normal text-muted-foreground">ккал</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 sm:mt-3">Столько энергии нужно вашему телу просто для поддержания жизни.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Activity className="h-5 w-5 text-primary shrink-0" />
                  С учётом активности (TDEE)
                </CardTitle>
                <CardDescription>Общий суточный расход</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl sm:text-4xl font-bold">
                  {result.tdee}{" "}
                  <span className="text-base sm:text-lg font-normal text-muted-foreground">ккал</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 sm:mt-3">Реальный расход с учётом активности и образа жизни.</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Scale className="h-5 w-5 text-primary" />
                  Анализ веса
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  { label: "Индекс массы тела (ИМТ)", value: `${result.bmi} — ${result.bmiCategory}` },
                  { label: "До цели осталось", value: `${result.weightToGoal} кг` },
                  { label: "Расчётное время", value: `≈ ${result.estimatedMonths} мес.` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-2.5 border-b last:border-0">
                    <span className="text-muted-foreground text-sm">{row.label}</span>
                    <span className="font-semibold text-sm">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-destructive text-base sm:text-lg">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  Блокаторы прогресса
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.progressBlockers && result.progressBlockers.length > 0 ? (
                  <ul className="space-y-2">
                    {result.progressBlockers.map((b: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-destructive mt-0.5 shrink-0">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Критических блокаторов не выявлено. Отлично!</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="bg-card border rounded-xl p-6 sm:p-8 text-center space-y-4 sm:space-y-6">
            <Brain className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-primary" />
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Готовы к персональному плану?</h3>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
                Укажите вкусовые предпочтения, бюджет и время на готовку — и получите меню, созданное именно для вас.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link href="/survey/nutrition" className="w-full sm:w-auto">
                <Button size="lg" className="px-8 w-full sm:w-auto">Настроить рацион →</Button>
              </Link>
              <Link href="/payment" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="px-8 w-full sm:w-auto">Получить план (без настроек)</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
