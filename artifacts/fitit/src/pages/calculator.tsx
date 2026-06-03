import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, ChevronLeft, RotateCcw, TrendingDown, TrendingUp } from "lucide-react";

interface CalcData {
  gender: string;
  goal: string;
  hormonalDisorder: string;
  lifestyle: string;
  age: number;
  height: number;
  weight: number;
  targetWeight: number;
  dailySteps: number;
  cardioMinutesPerWeek: number;
  strengthMinutesPerWeek: number;
}

interface CalcResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteins: number;
  fats: number;
  carbs: number;
  bmi: number;
  bmiCategory: string;
  weightToGoal: number;
  estimatedMonths: number;
  moderateDeficit: number;
}

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Недостаточная масса тела";
  if (bmi < 25) return "Норма";
  if (bmi < 30) return "Избыточная масса тела";
  if (bmi < 35) return "Ожирение I степени";
  if (bmi < 40) return "Ожирение II степени";
  return "Ожирение III степени";
}

function getBmiColor(bmi: number): string {
  if (bmi < 18.5) return "text-accent";
  if (bmi < 25) return "text-green-600";
  if (bmi < 30) return "text-accent";
  return "text-destructive";
}

function calculate(data: CalcData): CalcResult {
  const hormonalFactor =
    data.hormonalDisorder === "hypothyroidism" ? 0.88 :
    data.hormonalDisorder === "insulin_leptin_resistance" ? 0.93 :
    data.hormonalDisorder === "sex_hormone_deficiency" ? 0.90 :
    data.hormonalDisorder === "other_endocrine" ? 0.92 : 1.0;

  const goalFactor =
    data.goal === "lose_weight" ? 0.85 :
    data.goal === "gain_weight" ? 1.12 : 1.0;

  let bmr = data.gender === "male"
    ? 10 * data.weight + 6.25 * data.height - 5 * data.age + 5
    : 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;
  bmr = Math.round(bmr);

  const stepCalories = Math.round(data.dailySteps * 0.05);
  const cardioCalories = Math.round(data.cardioMinutesPerWeek * 3);
  const strengthCalories = Math.round(data.strengthMinutesPerWeek * 4.3);
  const tdee = Math.round((bmr + stepCalories + cardioCalories + strengthCalories) * hormonalFactor);
  const targetCalories = Math.round(tdee * goalFactor);

  const proteins = Math.round(data.weight * 2.0);
  const fats = Math.round((targetCalories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((targetCalories - proteins * 4 - fats * 9) / 4));

  const heightM = data.height / 100;
  const bmi = Math.round((data.weight / (heightM * heightM)) * 10) / 10;
  const bmiCategory = getBmiCategory(bmi);
  const weightToGoal = Math.abs(data.weight - data.targetWeight);
  const moderateDeficit = tdee - 450;

  let estimatedMonths = 0;
  if (data.goal === "lose_weight") {
    estimatedMonths = Math.ceil((weightToGoal * 7700) / (450 * 30));
  } else if (data.goal === "gain_weight") {
    estimatedMonths = Math.ceil((weightToGoal * 7700) / (400 * 30));
  } else {
    estimatedMonths = 3;
  }

  return { bmr, tdee, targetCalories, proteins, fats, carbs, bmi, bmiCategory, weightToGoal, estimatedMonths, moderateDeficit };
}

const STEPS = [
  {
    id: "gender",
    title: "Ваш пол",
    type: "choice" as const,
    options: [
      { value: "male", label: "Мужской" },
      { value: "female", label: "Женский" },
    ],
  },
  {
    id: "goal",
    title: "Ваша цель",
    type: "choice" as const,
    options: [
      { value: "lose_weight", label: "Похудеть" },
      { value: "maintain_recompose", label: "Поддержать вес / Рекомпозиция" },
      { value: "gain_weight", label: "Набрать мышечную массу" },
    ],
  },
  {
    id: "hormonalDisorder",
    title: "Гормональные нарушения",
    type: "choice" as const,
    options: [
      { value: "none", label: "Нет" },
      { value: "hypothyroidism", label: "Гипотиреоз" },
      { value: "insulin_leptin_resistance", label: "Инсулино/Лептинорезистентность" },
      { value: "sex_hormone_deficiency", label: "Дефицит половых гормонов" },
      { value: "other_endocrine", label: "Другие эндокринные нарушения" },
    ],
  },
  {
    id: "lifestyle",
    title: "Образ жизни",
    type: "choice" as const,
    options: [
      { value: "sedentary", label: "Сидячий (менее 5 000 шагов/день)" },
      { value: "office_active", label: "Офисный, активный (5–8 тыс. шагов)" },
      { value: "on_feet", label: "Работа на ногах (8–12 тыс. шагов)" },
      { value: "intense_training", label: "Интенсивные ежедневные тренировки" },
      { value: "physical_labor", label: "Тяжёлый физический труд" },
    ],
  },
  {
    id: "measurements",
    title: "Параметры тела",
    type: "inputs" as const,
    fields: [
      { id: "age", label: "Возраст (лет)", min: 14, max: 100, placeholder: "30" },
      { id: "height", label: "Рост (см)", min: 100, max: 250, placeholder: "170" },
      { id: "weight", label: "Текущий вес (кг)", min: 30, max: 300, placeholder: "70" },
      { id: "targetWeight", label: "Желаемый вес (кг)", min: 30, max: 300, placeholder: "65" },
    ],
  },
  {
    id: "activity",
    title: "Физическая активность",
    type: "inputs" as const,
    fields: [
      { id: "dailySteps", label: "Шагов в день", min: 0, max: 50000, placeholder: "7000" },
      { id: "cardioMinutesPerWeek", label: "Кардио (мин/неделю)", min: 0, max: 1000, placeholder: "60" },
      { id: "strengthMinutesPerWeek", label: "Силовые (мин/неделю)", min: 0, max: 1000, placeholder: "90" },
    ],
  },
];

function calcAdjusted(base: CalcResult, goal: string, months: number) {
  const { tdee, proteins, weightToGoal } = base;
  let targetCalories: number;
  if (goal === "maintain_recompose") {
    targetCalories = tdee;
  } else {
    const dailyChange = Math.round((weightToGoal * 7700) / (months * 30));
    targetCalories = goal === "lose_weight"
      ? Math.max(1200, tdee - dailyChange)
      : tdee + dailyChange;
  }
  const fats  = Math.round((targetCalories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((targetCalories - proteins * 4 - fats * 9) / 4));
  return { targetCalories, proteins, fats, carbs };
}

export default function Calculator() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<CalcData>>({});
  const [result, setResult] = useState<CalcResult | null>(null);
  const [selectedMonths, setSelectedMonths] = useState(3);

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const handleChoice = (value: string) => {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    if (step < STEPS.length - 1) setStep(step + 1);
    else setResult(calculate(next as CalcData));
  };

  const handleInputs = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next = { ...answers } as any;
    current.fields?.forEach((f) => { next[f.id] = Number(fd.get(f.id)); });
    setAnswers(next);
    if (step < STEPS.length - 1) setStep(step + 1);
    else { setResult(calculate(next as CalcData)); setSelectedMonths(3); }
  };

  const reset = () => { setStep(0); setAnswers({}); setResult(null); setSelectedMonths(3); };

  const goal = (answers.goal as string) || "maintain_recompose";
  const needsSlider = goal !== "maintain_recompose";

  const adjusted = useMemo(() => {
    if (!result) return null;
    return calcAdjusted(result, goal, selectedMonths);
  }, [result, goal, selectedMonths]);

  if (result && adjusted) {
    const macroTotal = adjusted.proteins + adjusted.fats + adjusted.carbs;
    const dailyChange = needsSlider
      ? Math.round((result.weightToGoal * 7700) / (selectedMonths * 30))
      : 0;

    return (
      <Layout>
        <div className="py-10 sm:py-14">
          <div className="container px-4 max-w-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-1">Бесплатный калькулятор</p>
                <h1 className="text-2xl sm:text-3xl font-bold">Ваш результат</h1>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" /> Пересчитать
              </Button>
            </div>

            {/* BMR + TDEE */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-border rounded-2xl p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Базовый обмен (BMR)</p>
                <p className="text-3xl font-bold">{result.bmr}</p>
                <p className="text-xs text-muted-foreground mt-1">ккал/сутки</p>
              </div>
              <div className="border border-border rounded-2xl p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">С активностью (TDEE)</p>
                <p className="text-3xl font-bold">{result.tdee}</p>
                <p className="text-xs text-muted-foreground mt-1">ккал/сутки</p>
              </div>
            </div>

            {/* Slider */}
            {needsSlider && (
              <div className="border border-border rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {goal === "lose_weight" ? <TrendingDown className="h-4 w-4 text-muted-foreground" /> : <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                    <p className="text-sm font-semibold">Срок достижения цели</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {selectedMonths} {selectedMonths === 1 ? "месяц" : selectedMonths < 5 ? "месяца" : "месяцев"}
                  </span>
                </div>
                <input
                  type="range" min={1} max={12} value={selectedMonths}
                  onChange={(e) => setSelectedMonths(Number(e.target.value))}
                  className="w-full h-2 rounded-full accent-foreground cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 мес.</span><span>6 мес.</span><span>12 мес.</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="bg-secondary/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">До цели</p>
                    <p className="text-base font-bold">{result.weightToGoal} кг</p>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{goal === "lose_weight" ? "Дефицит" : "Профицит"}</p>
                    <p className="text-base font-bold">{dailyChange} ккал</p>
                  </div>
                  <div className="bg-foreground text-background rounded-xl p-3 text-center">
                    <p className="text-xs text-background/60 mb-1">Цель</p>
                    <p className="text-base font-bold">{adjusted.targetCalories}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Target calories */}
            <div className="border border-foreground bg-foreground text-background rounded-2xl p-6 space-y-4">
              <div>
                <p className="text-xs text-background/60 uppercase tracking-wider mb-1">Целевые калории в день</p>
                <p className="text-5xl font-bold">{adjusted.targetCalories}</p>
                <p className="text-sm text-background/60 mt-1">ккал</p>
              </div>
              <div className="space-y-2.5 pt-2 border-t border-background/20">
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

            {/* BMI + goal */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-border rounded-2xl p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ИМТ</p>
                <p className={`text-3xl font-bold ${getBmiColor(result.bmi)}`}>{result.bmi}</p>
                <p className="text-xs text-muted-foreground mt-1">{result.bmiCategory}</p>
              </div>
              {needsSlider && (
                <div className="border border-border rounded-2xl p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">До цели</p>
                  <p className="text-3xl font-bold">{result.weightToGoal} кг</p>
                  <p className="text-xs text-muted-foreground mt-1">≈ {selectedMonths} мес. по вашему плану</p>
                </div>
              )}
            </div>

            <div className="bg-secondary/40 border border-border rounded-2xl p-5 text-sm text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground mb-1">Это базовый расчёт</p>
              Персональный план учитывает более 80 параметров: предпочтения, аллергии, режим дня, гормональный статус.
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/survey/metabolism" className="flex-1">
                <Button className="w-full h-12 rounded-xl text-sm font-medium">
                  Получить персональный план <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-10 sm:py-14">
        <div className="container px-4 max-w-xl">
          <div className="mb-6">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Бесплатный калькулятор</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Рассчитайте ваш метаболизм</h1>
          </div>

          {/* Progress */}
          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Шаг {step + 1} из {STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="border border-border rounded-2xl p-6 sm:p-8 bg-background">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-6">{current.title}</h2>

            {current.type === "choice" && (
              <div className="space-y-2">
                {current.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleChoice(opt.value)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-colors duration-150 ${
                      answers[current.id as keyof CalcData] === opt.value
                        ? "border-foreground bg-foreground text-background font-medium"
                        : "border-border hover:border-foreground/30 hover:bg-secondary/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {current.type === "inputs" && (
              <form onSubmit={handleInputs} className="space-y-4">
                {current.fields?.map((f) => (
                  <div key={f.id} className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">{f.label}</label>
                    <input
                      type="number"
                      name={f.id}
                      min={f.min}
                      max={f.max}
                      placeholder={f.placeholder}
                      defaultValue={(answers as any)[f.id] || ""}
                      required
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-colors"
                    />
                  </div>
                ))}
                <Button type="submit" className="w-full h-11 rounded-xl text-sm font-medium mt-2">
                  {step === STEPS.length - 1 ? "Рассчитать" : "Продолжить"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}
          </div>

          {step > 0 && (
            <div className="mt-4 flex justify-center">
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} className="text-muted-foreground text-sm">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Назад
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
