import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useGetMetabolicResult } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity, Flame, ShieldAlert, Target, Scale, Brain,
  TrendingDown, TrendingUp, Minus, ChevronDown, ChevronUp, Pencil,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

/* ─── Goal selector config ─── */
const GOALS = [
  { value: "lose_weight",        label: "Похудение",    icon: TrendingDown },
  { value: "maintain_recompose", label: "Рекомпозиция", icon: Minus },
  { value: "gain_weight",        label: "Набор массы",  icon: TrendingUp },
];

function calcMacros(targetCalories: number, proteins: number) {
  const fats  = Math.round((targetCalories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((targetCalories - proteins * 4 - fats * 9) / 4));
  return { fats, carbs };
}

/* ─── Label maps ─── */
const GENDER_LABELS: Record<string, string> = { male: "Мужской", female: "Женский" };
const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Снижение жира", gain_weight: "Набор мышечной массы",
  maintain_recompose: "Рекомпозиция / Поддержка",
  fat_loss: "Снижение жира", muscle_gain: "Набор мышечной массы",
  recomposition: "Рекомпозиция", support_form: "Поддержка формы",
  health: "Здоровье и энергия",
};
const HORMONAL_LABELS: Record<string, string> = {
  none: "Нет / анализы не сдавал(а)", hypothyroidism: "Гипотиреоз / нарушение обмена",
  insulin_leptin_resistance: "Инсулино/лептинорезистентность",
  sex_hormone_deficiency: "Дефицит половых гормонов",
  other_endocrine: "Другие эндокринные нарушения",
};
const TIMELINE_LABELS: Record<string, string> = {
  under_3m: "До 3 месяцев", "3_6m": "3–6 месяцев", "6plus_m": "6+ месяцев",
};
const FREQ_LABELS: Record<string, string> = {
  rarely: "Редко", sometimes: "Иногда", regularly: "Регулярно",
};
const FREQ3_LABELS: Record<string, string> = {
  never: "Нет", sometimes: "Иногда", often: "Часто",
  none: "Нет", once: "1 раз", two_plus: "2+ раза",
  rested: "Отдохнувшим(ей)", medium: "Средне", tired: "Уставшим(ей)",
};
const STRESS_LABELS: Record<number, string> = {
  1: "Минимальный", 2: "Ниже среднего", 3: "Умеренный",
  4: "Высокий", 5: "Очень высокий",
};
const FALL_ASLEEP: Record<string, string> = {
  easy: "Легко", slow_30_60: "30–60 мин", insomnia: "Не могу уснуть",
};
const SLEEP_WAKEUPS: Record<string, string> = {
  none: "Нет", once: "1 раз", two_plus: "2+ раза",
};
const BUDGET_LABELS: Record<string, string> = {
  minimal: "Минимальный", medium: "Средний", high: "Высокий",
};
const COOK_LABELS: Record<string, string> = {
  under_15: "До 15 минут", "15_30": "15–30 минут", over_30: "Более 30 минут",
};
const CARB_LABELS: Record<string, string> = {
  fast: "В основном быстрые", complex: "В основном сложные", mixed: "Смешанные",
};
const WATER_LABELS: Record<string, string> = {
  under_1: "< 1 л", "1_1_5": "1–1,5 л", "2plus": "2+ л",
};
const MEALS_LABELS: Record<string, string> = {
  "1_2": "1–2 раза", "3": "3 раза", "4_5": "4–5 раз", "6plus": "6+ раз",
};

function L(map: Record<string, string>, v: any, fallback = "—") {
  if (v == null || v === "") return fallback;
  return map[String(v)] ?? String(v);
}

/* ─── Data fetching hooks ─── */
function useProfileData(enabled: boolean) {
  const token = localStorage.getItem("fitit_token");
  return useQuery({
    queryKey: ["survey-profile"],
    enabled,
    queryFn: async () => {
      const r = await fetch("/api/survey/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return null;
      return r.json();
    },
  });
}

function useExtendedSurvey(enabled: boolean) {
  const token = localStorage.getItem("fitit_token");
  return useQuery({
    queryKey: ["extended-survey"],
    enabled,
    queryFn: async () => {
      const r = await fetch("/api/survey/extended", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return null;
      return r.json();
    },
  });
}

/* ─── Collapsible data block ─── */
interface DataRow { label: string; value: string }

function DataBlock({
  title, subtitle, rows, editHref, open, onToggle,
}: {
  title: string; subtitle?: string; rows: DataRow[];
  editHref: string; open: boolean; onToggle: () => void;
}) {
  const filled = rows.filter(r => r.value && r.value !== "—").length;
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-secondary/40 transition-colors text-left"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold leading-none">{title}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${filled > 0 ? "bg-foreground/10 text-foreground" : "bg-secondary text-muted-foreground"}`}>
            {filled > 0 ? `${filled} заполнено` : "Не заполнено"}
          </span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-border px-5 sm:px-6 pb-5">
          {rows.length > 0 ? (
            <div className="mt-4 divide-y divide-border">
              {rows.map((row, i) => (
                <div key={i} className="flex justify-between items-start gap-4 py-2.5">
                  <span className="text-sm text-muted-foreground leading-snug shrink-0">{row.label}</span>
                  <span className={`text-sm font-medium text-right leading-snug ${row.value === "—" ? "text-muted-foreground" : ""}`}>{row.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Данные пока не заполнены.</p>
          )}
          <div className="mt-4 pt-4 border-t border-border">
            <Link href={editHref}>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                <Pencil className="h-3.5 w-3.5" />
                Изменить данные
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
export default function Result() {
  const { isAuthenticated } = useAuth();
  const { data: result, isLoading, error } = useGetMetabolicResult({
    query: { enabled: isAuthenticated },
  });
  const { data: profile } = useProfileData(isAuthenticated);
  const { data: extData } = useExtendedSurvey(isAuthenticated);

  const [selectedGoal,   setSelectedGoal]   = useState<string | null>(null);
  const [selectedMonths, setSelectedMonths] = useState(3);
  const [openBlock, setOpenBlock] = useState<number | null>(0);

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
      targetCalories = goal === "lose_weight" ? Math.max(1200, tdee - dailyChange) : tdee + dailyChange;
    }
    const { fats, carbs } = calcMacros(targetCalories, proteins);
    return { targetCalories, proteins, fats, carbs };
  }, [result, goal, selectedMonths]);

  /* ── Build row arrays for data blocks ── */
  const anthropometricRows: DataRow[] = profile ? [
    { label: "Пол",                  value: L(GENDER_LABELS, profile.gender) },
    { label: "Возраст",              value: profile.age ? `${profile.age} лет` : "—" },
    { label: "Рост",                 value: profile.height ? `${profile.height} см` : "—" },
    { label: "Вес",                  value: profile.weight ? `${profile.weight} кг` : "—" },
    { label: "Желаемый вес",         value: profile.targetWeight ? `${profile.targetWeight} кг` : "—" },
    { label: "Цель",                 value: L(GOAL_LABELS, localStorage.getItem("fitit_goal_label") ?? profile.goal) },
    { label: "Срок достижения",      value: L(TIMELINE_LABELS, localStorage.getItem("fitit_target_timeline")) },
    { label: "ИМТ",                  value: profile.bmi ? `${profile.bmi} — ${profile.bmiCategory ?? ""}` : "—" },
    { label: "Гормональные нарушения", value: L(HORMONAL_LABELS, profile.hormonalDisorder) },
    { label: "Шагов в день",         value: profile.dailySteps != null ? `${profile.dailySteps} шаг/день` : "—" },
    { label: "Кардио",               value: profile.cardioMinutesPerWeek != null ? `${profile.cardioMinutesPerWeek} мин/нед` : "—" },
    { label: "Силовые",              value: profile.strengthMinutesPerWeek != null ? `${profile.strengthMinutesPerWeek} мин/нед` : "—" },
  ] : [];

  const healthRows: DataRow[] = extData ? [
    { label: "Энергия утром",         value: extData.energyMorning    ? `${extData.energyMorning}/5`    : "—" },
    { label: "Энергия днём",          value: extData.energyAfternoon  ? `${extData.energyAfternoon}/5`  : "—" },
    { label: "Энергия вечером",       value: extData.energyEvening    ? `${extData.energyEvening}/5`    : "—" },
    { label: "Засыпание",             value: L(FALL_ASLEEP, extData.sleepFallAsleep) },
    { label: "Ночные пробуждения",    value: L(SLEEP_WAKEUPS, extData.sleepWakeUps) },
    { label: "Ощущение с утра",       value: L(FREQ3_LABELS, extData.sleepRest) },
    { label: "Хронический стресс",    value: extData.stressLevel ? L(STRESS_LABELS, Number(extData.stressLevel)) : "—" },
    { label: "Вздутие после еды",     value: L(FREQ3_LABELS, extData.bloating) },
    { label: "Тяжесть после еды",     value: L(FREQ3_LABELS, extData.heaviness) },
    { label: "ОРВИ в год",            value: L({ rare: "1 раз или реже", moderate: "2–3 раза", often: "4+ раза" }, extData.illnessFreq) },
    { label: "Изменения кожи/волос",  value: Array.isArray(extData.skinSigns) && extData.skinSigns.length ? extData.skinSigns.join(", ") : "—" },
    { label: "Частота белка",         value: L(FREQ_LABELS, extData.freqTable?.freqProtein) },
    { label: "Частота овощей",        value: L(FREQ_LABELS, extData.freqTable?.freqVeggies) },
    { label: "Углеводы",              value: L(CARB_LABELS, extData.carbType) },
    { label: "Вода (по опросу)",      value: L(WATER_LABELS, extData.waterIntake) },
  ] : [];

  const nutritionRows: DataRow[] = extData ? [
    { label: "Приёмов пищи в день",   value: L(MEALS_LABELS, extData.mealsPerDay) },
    { label: "Тип питания",           value: Array.isArray(extData.dietTypes) && extData.dietTypes.length ? extData.dietTypes.join(", ") : "—" },
    { label: "Религиозные ограничения",value: extData.culturalRestrictions === "yes" ? (extData.culturalRestrictionsText || "Да") : "Нет" },
    { label: "Любимые продукты",      value: extData.likedFoods === "yes" ? (extData.likedFoodsText || "Указано") : "Нет" },
    { label: "Нелюбимые продукты",    value: extData.dislikedFoods === "yes" ? (extData.dislikedFoodsText || "Указано") : "Нет" },
    { label: "Пищевая аллергия",      value: extData.foodAllergy === "yes" ? (extData.foodAllergyText || "Да") : "Нет" },
    { label: "Хронические болезни",   value: extData.chronicDiseases === "yes" ? (extData.chronicDiseasesText || "Да") : "Нет" },
    { label: "Постоянные лекарства",  value: extData.medications === "yes" ? (extData.medicationsText || "Да") : "Нет" },
    { label: "Тяга к сладкому",       value: L({ daily: "Каждый день", few_week: "Несколько раз в нед.", rarely: "Редко", never: "Нет" }, extData.sweetFreq) },
    { label: "Зависимость от сладкого",value: L({ no: "Нет", yes: "Да" }, extData.sweetAddiction) },
    { label: "Бюджет на питание",     value: L(BUDGET_LABELS, extData.budget) },
    { label: "Время на готовку",      value: L(COOK_LABELS, extData.cookingTime) },
    { label: "Кофе/чай в день",       value: L({ "0": "0 чашек", "1_2": "1–2 чашки", "3_4": "3–4 чашки", "5plus": "5+ чашек" }, extData.coffeePerDay) },
    { label: "Вода в день",           value: L({ "0": "Почти не пью", "0_5": "0,5 л", "1_2": "1–2 л", "2_3": "2–3 л" }, extData.waterPerDay) },
  ] : [];

  const toggleBlock = (i: number) => setOpenBlock(prev => prev === i ? null : i);

  /* ── Render states ── */
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
  const dailyChange = needsSlider ? Math.round((result.weightToGoal * 7700) / (selectedMonths * 30)) : 0;

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
                  <button key={g.value}
                    onClick={() => { setSelectedGoal(g.value); setSelectedMonths(3); }}
                    className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border text-sm font-medium transition-colors ${active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/30 hover:bg-secondary/50"}`}>
                    <Icon className="h-5 w-5" />
                    <span className="text-xs sm:text-sm leading-tight text-center">{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeline slider */}
          {needsSlider && (
            <div className="border border-border rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Срок достижения цели</p>
                <span className="text-sm font-semibold">{selectedMonths} {selectedMonths === 1 ? "месяц" : selectedMonths < 5 ? "месяца" : "месяцев"}</span>
              </div>
              <input type="range" min={1} max={12} value={selectedMonths}
                onChange={(e) => setSelectedMonths(Number(e.target.value))}
                className="w-full h-2 rounded-full accent-foreground cursor-pointer" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 мес.</span><span>6 мес.</span><span>12 мес.</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[
                  { label: "До цели",          value: `${result.weightToGoal} кг` },
                  { label: "Дефицит/профицит", value: `${dailyChange} ккал` },
                  { label: "TDEE",             value: String(result.tdee) },
                ].map(r => (
                  <div key={r.label} className="bg-secondary/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{r.label}</p>
                    <p className="text-lg font-bold">{r.value}</p>
                  </div>
                ))}
                <div className="bg-foreground text-background rounded-xl p-3 text-center">
                  <p className="text-xs text-background/60 mb-1">Цель ккал/день</p>
                  <p className="text-lg font-bold">{adjusted.targetCalories}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      <div className={`h-full rounded-full ${m.color}`}
                        style={{ width: `${Math.round((m.value / macroTotal) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                  { label: "ИМТ",            value: `${result.bmi} — ${result.bmiCategory}` },
                  { label: "До цели",         value: `${result.weightToGoal} кг` },
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

          {/* ── Three data summary blocks ── */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Мои данные</p>
            <div className="space-y-3">
              <DataBlock
                title="Антропометрические данные"
                subtitle="Базовые параметры из первого опроса"
                rows={anthropometricRows}
                editHref="/survey/metabolism"
                open={openBlock === 0}
                onToggle={() => toggleBlock(0)}
              />
              <DataBlock
                title="Состояние здоровья"
                subtitle="Энергия, сон, стресс, пищеварение, гормональные маркеры"
                rows={healthRows}
                editHref="/survey/extended"
                open={openBlock === 1}
                onToggle={() => toggleBlock(1)}
              />
              <DataBlock
                title="Формат питания"
                subtitle="Режим, предпочтения, аллергии, бюджет, бытовые условия"
                rows={nutritionRows}
                editHref="/survey/extended"
                open={openBlock === 2}
                onToggle={() => toggleBlock(2)}
              />
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
