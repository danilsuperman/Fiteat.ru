import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useGetMetabolicResult } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Flame, ShieldAlert, Target, Scale, Brain, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const GOALS = [
  { value: "lose_weight",       label: "Похудение",     icon: TrendingDown },
  { value: "maintain_recompose",label: "Рекомпозиция",  icon: Minus },
  { value: "gain_weight",       label: "Набор массы",   icon: TrendingUp },
];

function calcMacros(targetCalories: number, proteins: number) {
  const fats  = Math.round((targetCalories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((targetCalories - proteins * 4 - fats * 9) / 4));
  return { fats, carbs };
}

export default function Result() {
  const { isAuthenticated } = useAuth();
  const { data: result, isLoading, error } = useGetMetabolicResult({
    query: { enabled: isAuthenticated },
  });

  const [selectedGoal,   setSelectedGoal]   = useState<string | null>(null);
  const [selectedMonths, setSelectedMonths] = useState(3);

  const goal = selectedGoal ?? result?.goal ?? "lose_weight";
  const needsSlider = goal !== "maintain_recompose";

  const adjusted = useMemo(() => {
    if (!result) return null;
    const { tdee, proteins, weightToGoal } = result;
    let targetCalories: number;

    if (goal === "maintain_recompose") {
      targetCalories = tdee;
    } else {
      const dailyChange = Math.round((weightToGoal * 7700) / (selectedMonths * 30));
      targetCalories = goal === "lose_weight"
        ? Math.max(1200, tdee - dailyChange)
        : tdee + dailyChange;
    }

    const { fats, carbs } = calcMacros(targetCalories, proteins);
    return { targetCalories, proteins, fats, carbs };
  }, [result, goal, selectedMonths]);

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container px-4 py-24 text-center space-y-4">
          <h2 className="text-2xl font-bold">Для просмотра результатов необходимо войти</h2>
          <Link href="/login"><Button>Войти</Button></Link>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container px-4 py-10 max-w-5xl space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      </Layout>
    );
  }

  if (error || !result || !adjusted) {
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

  const macroTotal = adjusted.proteins + adjusted.fats + adjusted.carbs;
  const dailyChange = needsSlider
    ? Math.round((result.weightToGoal * 7700) / (selectedMonths * 30))
    : 0;

  return (
    <Layout>
      <div className="py-8 sm:py-12">
        <div className="container px-4 max-w-5xl space-y-6">

          {/* Header */}
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Мой метаболизм</p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Персональный профиль</h1>
          </div>

          {/* Goal selector */}
          <div className="border border-border rounded-2xl p-4 sm:p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Изменить цель</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {GOALS.map((g) => {
                const Icon = g.icon;
                const active = goal === g.value;
                return (
                  <button
                    key={g.value}
                    onClick={() => { setSelectedGoal(g.value); setSelectedMonths(3); }}
                    className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border text-sm font-medium transition-colors ${
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/30 hover:bg-secondary/50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs sm:text-sm leading-tight text-center">{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeline slider (shown when not maintain) */}
          {needsSlider && (
            <div className="border border-border rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Срок достижения цели</p>
                <span className="text-sm font-semibold">{selectedMonths} {selectedMonths === 1 ? "месяц" : selectedMonths < 5 ? "месяца" : "месяцев"}</span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                value={selectedMonths}
                onChange={(e) => setSelectedMonths(Number(e.target.value))}
                className="w-full h-2 rounded-full accent-foreground cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 мес.</span>
                <span>6 мес.</span>
                <span>12 мес.</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-secondary/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">До цели</p>
                  <p className="text-lg font-bold">{result.weightToGoal} кг</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Дефицит/профицит</p>
                  <p className="text-lg font-bold">{dailyChange} ккал</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">TDEE</p>
                  <p className="text-lg font-bold">{result.tdee}</p>
                </div>
                <div className="bg-foreground text-background rounded-xl p-3 text-center">
                  <p className="text-xs text-background/60 mb-1">Цель ккал/день</p>
                  <p className="text-lg font-bold">{adjusted.targetCalories}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Target calories */}
            <div className="sm:col-span-1 border border-foreground bg-foreground text-background rounded-2xl p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-background/60" />
                  <p className="text-xs text-background/60 uppercase tracking-wider font-medium">Целевые калории</p>
                </div>
                <p className="text-4xl font-bold">{adjusted.targetCalories}</p>
                <p className="text-sm text-background/60">ккал в день</p>
              </div>
              <div className="space-y-3 pt-2 border-t border-background/20">
                {[
                  { label: "Белки", value: adjusted.proteins, color: "bg-blue-400" },
                  { label: "Жиры",  value: adjusted.fats,    color: "bg-yellow-400" },
                  { label: "Углеводы", value: adjusted.carbs, color: "bg-green-400" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-background/80">{m.label}</span>
                      <span className="font-semibold">{m.value} г</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-background/20 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${m.color}`}
                        style={{ width: `${Math.round((m.value / macroTotal) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BMR + TDEE */}
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Flame className="h-4 w-4 text-accent" />
                  <p className="text-xs uppercase tracking-wider font-medium">Базовый обмен (BMR)</p>
                </div>
                <p className="text-4xl font-bold">{result.bmr}</p>
                <p className="text-sm text-muted-foreground mt-1">ккал/сутки в покое</p>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">Минимальная энергия для поддержания жизни без какой-либо активности</p>
              </div>
              <div className="border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Activity className="h-4 w-4" />
                  <p className="text-xs uppercase tracking-wider font-medium">С активностью (TDEE)</p>
                </div>
                <p className="text-4xl font-bold">{result.tdee}</p>
                <p className="text-sm text-muted-foreground mt-1">ккал/сутки реальных</p>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">Фактический расход с учётом образа жизни и тренировок</p>
              </div>
            </div>
          </div>

          {/* Weight analysis + blockers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold">Анализ веса</p>
              </div>
              <div className="space-y-0">
                {[
                  { label: "ИМТ", value: `${result.bmi} — ${result.bmiCategory}` },
                  { label: "До цели",  value: `${result.weightToGoal} кг` },
                  { label: "Расчётное время", value: `≈ ${selectedMonths} мес.` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className="text-sm font-semibold">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                <p className="text-sm font-semibold">Блокаторы прогресса</p>
              </div>
              {result.progressBlockers?.length > 0 ? (
                <ul className="space-y-2.5">
                  {result.progressBlockers.map((b: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-destructive mt-0.5 shrink-0 text-xs">•</span>
                      <span className="text-muted-foreground leading-snug">{b}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Критических блокаторов не выявлено.</p>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="border border-border rounded-2xl p-6 sm:p-8 text-center space-y-4">
            <Brain className="h-10 w-10 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-xl font-bold mb-2">Готовы к персональному плану?</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Укажите вкусовые предпочтения, бюджет и время на готовку — получите меню именно для вас.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/survey/extended">
                <Button className="px-8 rounded-xl w-full sm:w-auto">Настроить рацион →</Button>
              </Link>
              <Link href="/payment">
                <Button variant="outline" className="px-8 rounded-xl w-full sm:w-auto">Получить план</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
