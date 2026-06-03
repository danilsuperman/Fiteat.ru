import { Link } from "wouter";
import { useGetMetabolicResult } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Flame, ShieldAlert, Target, Scale, Brain } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Results() {
  const { isAuthenticated } = useAuth();
  const { data: result, isLoading, error } = useGetMetabolicResult({
    query: { enabled: isAuthenticated }
  });

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Для просмотра результатов необходимо войти</h2>
          <Link href="/login">
            <Button>Войти</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 space-y-8">
          <Skeleton className="h-12 w-3/4 max-w-lg" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </Layout>
    );
  }

  if (error || !result) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Ошибка загрузки результатов</h2>
          <p className="text-muted-foreground mb-8">Пожалуйста, попробуйте обновить страницу или пройти опрос заново.</p>
          <Link href="/survey">
            <Button>Пройти опрос</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted/20 py-12">
        <div className="container max-w-5xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Ваш метаболический профиль</h1>
            <p className="text-lg text-muted-foreground">Мы проанализировали ваши данные. Вот что говорит наука.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-primary text-primary-foreground border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Цель: {result.targetCalories} ккал
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">Суточная норма</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Белки</span>
                      <span className="font-bold">{result.proteins}г</span>
                    </div>
                    <Progress value={result.proteins / (result.proteins + result.fats + result.carbs) * 100} className="h-2 bg-primary-foreground/20" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Жиры</span>
                      <span className="font-bold">{result.fats}г</span>
                    </div>
                    <Progress value={result.fats / (result.proteins + result.fats + result.carbs) * 100} className="h-2 bg-primary-foreground/20" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Углеводы</span>
                      <span className="font-bold">{result.carbs}г</span>
                    </div>
                    <Progress value={result.carbs / (result.proteins + result.fats + result.carbs) * 100} className="h-2 bg-primary-foreground/20" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-accent" />
                  Базовый обмен (BMR)
                </CardTitle>
                <CardDescription>Расход в покое</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{result.bmr} <span className="text-lg font-normal text-muted-foreground">ккал</span></div>
                <p className="text-sm text-muted-foreground mt-2">Столько энергии нужно вашему телу просто для поддержания жизни.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-chart-3" />
                  С учетом активности (TDEE)
                </CardTitle>
                <CardDescription>Общий суточный расход</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{result.tdee} <span className="text-lg font-normal text-muted-foreground">ккал</span></div>
                <p className="text-sm text-muted-foreground mt-2">Ваш реальный расход энергии с учетом выбранного образа жизни.</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-chart-4" />
                  Анализ веса
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Индекс массы тела (BMI)</span>
                  <span className="font-bold">{result.bmi} ({result.bmiCategory})</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Осталось до цели</span>
                  <span className="font-bold">{result.weightToGoal} кг</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Расчетное время</span>
                  <span className="font-bold">~{result.estimatedMonths} мес.</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <ShieldAlert className="h-5 w-5" />
                  Блокаторы прогресса
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.progressBlockers.length > 0 ? (
                  <ul className="space-y-3">
                    {result.progressBlockers.map((blocker, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-destructive mt-0.5">•</span>
                        <span className="text-sm">{blocker}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Критических факторов, замедляющих прогресс, не выявлено. Отлично!</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="bg-card border rounded-xl p-8 text-center space-y-6">
            <Brain className="h-12 w-12 mx-auto text-primary" />
            <div>
              <h3 className="text-2xl font-bold mb-2">Готовы к персональному плану?</h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Чтобы составить меню, которое вам действительно понравится, нам нужно узнать о ваших вкусовых предпочтениях, бюджете и времени на готовку.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/survey/preferences">
                <Button size="lg" className="px-8">
                  Настроить план питания
                </Button>
              </Link>
              <Link href="/plan/purchase">
                <Button size="lg" variant="outline" className="px-8">
                  Получить план (пропустить настройки)
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
