import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { useSubmitBasicSurvey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import {
  BasicSurveyInputGender,
  BasicSurveyInputGoal,
  BasicSurveyInputHormonalDisorder,
  BasicSurveyInputLifestyle,
} from "@workspace/api-client-react";
import { Loader2, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ─── Types ─── */
type Answers = {
  gender?: string;
  age?: number; height?: number; weight?: number;
  goal?: string; targetWeight?: number; timeline?: string;
  dailySteps?: number; cardioMinutes?: number; strengthMinutes?: number;
  hormonalDisorder?: string;
};

/* ─── Goal mapping ─── */
const GOAL_API_MAP: Record<string, BasicSurveyInputGoal> = {
  fat_loss:     BasicSurveyInputGoal.lose_weight,
  muscle_gain:  BasicSurveyInputGoal.gain_weight,
  recomposition:BasicSurveyInputGoal.maintain_recompose,
  support_form: BasicSurveyInputGoal.maintain_recompose,
  health:       BasicSurveyInputGoal.maintain_recompose,
};

function deriveLifestyle(steps: number): BasicSurveyInputLifestyle {
  if (steps >= 14000) return BasicSurveyInputLifestyle.physical_labor;
  if (steps >= 10000) return BasicSurveyInputLifestyle.intense_training;
  if (steps >=  8000) return BasicSurveyInputLifestyle.on_feet;
  if (steps >=  5000) return BasicSurveyInputLifestyle.office_active;
  return BasicSurveyInputLifestyle.sedentary;
}

/* ─── UI helpers ─── */
function RadioOpt({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm transition-colors ${selected
        ? "border-foreground bg-foreground text-background font-medium"
        : "border-border hover:border-foreground/30 hover:bg-secondary/40"}`}>
      {label}
    </button>
  );
}

function NumInput({ label, hint, value, onChange, min, max, placeholder, unit }:
  { label: string; hint?: string; value: number | ""; onChange: (v: number | "") => void;
    min: number; max: number; placeholder: string; unit: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold">{label}</label>
      {hint && <p className="text-xs text-muted-foreground leading-snug">{hint}</p>}
      <div className="relative">
        <input type="number" min={min} max={max} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value ? Number(e.target.value) : "")}
          className="flex h-12 w-full rounded-xl border border-input bg-background px-4 pr-12 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">{unit}</span>
      </div>
    </div>
  );
}

const STEPS_CONFIG = [
  { id: "gender", part: "Основные данные", label: null },
  { id: "params", part: "Часть 1", label: "Базовые параметры" },
  { id: "goal",   part: "Часть 2", label: "Ваша цель трансформации" },
  { id: "activity",part: "Часть 3",label: "Уровень реальной активности" },
  { id: "metabolic",part: "Часть 4",label: "Метаболические особенности" },
];

/* ─── Main Component ─── */
export default function Survey() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({});
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const mutation = useSubmitBasicSurvey();
  const { toast } = useToast();

  const set = (k: keyof Answers, v: any) => setA(prev => ({ ...prev, [k]: v }));

  const next = () => { setStep(s => s + 1); window.scrollTo({ top: 0 }); };
  const back = () => { setStep(s => Math.max(0, s - 1)); window.scrollTo({ top: 0 }); };

  const finish = () => {
    const steps = a.dailySteps ?? 5000;
    const payload = {
      gender: (a.gender as BasicSurveyInputGender) ?? BasicSurveyInputGender.male,
      goal: GOAL_API_MAP[a.goal ?? "fat_loss"] ?? BasicSurveyInputGoal.lose_weight,
      hormonalDisorder: (a.hormonalDisorder as BasicSurveyInputHormonalDisorder) ?? BasicSurveyInputHormonalDisorder.none,
      lifestyle: deriveLifestyle(steps),
      age: a.age ?? 30,
      height: a.height ?? 170,
      weight: a.weight ?? 70,
      targetWeight: a.targetWeight ?? (a.weight ?? 70),
      dailySteps: steps,
      cardioMinutesPerWeek: a.cardioMinutes ?? 0,
      strengthMinutesPerWeek: a.strengthMinutes ?? 0,
    };

    // Save timeline & goal for display in results
    if (a.timeline) localStorage.setItem("fitit_target_timeline", a.timeline);
    if (a.goal)     localStorage.setItem("fitit_goal_label", a.goal);

    if (isAuthenticated) {
      mutation.mutate({ data: payload as any }, {
        onSuccess: () => setLocation("/result"),
        onError: (err) => toast({ title: "Ошибка", description: err.message || "Не удалось сохранить", variant: "destructive" }),
      });
    } else {
      localStorage.setItem("fitit_pending_survey_1", JSON.stringify(payload));
      setLocation("/register");
    }
  };

  const cfg = STEPS_CONFIG[step];
  const isLast = step === STEPS_CONFIG.length - 1;
  const progress = ((step + 1) / STEPS_CONFIG.length) * 100;

  return (
    <Layout>
      <div className="flex-1 bg-muted/20 py-6 sm:py-10">
        <div className="container max-w-xl px-4">

          {/* Progress */}
          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="font-medium">{cfg.part}</span>
              <span>{step + 1} / {STEPS_CONFIG.length}</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-foreground rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Card */}
          <div className="bg-card border border-border shadow-sm rounded-2xl p-5 sm:p-8 space-y-5">

            {/* ── Step 0: Gender ── */}
            {step === 0 && (
              <>
                <div>
                  <h2 className="text-2xl font-bold">Ваш пол</h2>
                  <p className="text-sm text-muted-foreground mt-1.5">Это повлияет на расчёт обмена веществ</p>
                </div>
                <div className="space-y-2.5">
                  {[
                    { value: BasicSurveyInputGender.male,   label: "Мужской" },
                    { value: BasicSurveyInputGender.female, label: "Женский" },
                  ].map(o => (
                    <RadioOpt key={o.value} label={o.label} selected={a.gender === o.value}
                      onClick={() => { set("gender", o.value); setTimeout(next, 160); }} />
                  ))}
                </div>
              </>
            )}

            {/* ── Step 1: Базовые параметры ── */}
            {step === 1 && (
              <>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Блок 1</p>
                  <h2 className="text-2xl font-bold">Базовые параметры</h2>
                  <p className="text-sm text-muted-foreground mt-1.5">Эти данные формируют основу расчёта обмена веществ и калорийности.</p>
                </div>
                <div className="space-y-4">
                  <NumInput label="Возраст" value={a.age ?? ""} onChange={v => set("age", v)} min={14} max={100} placeholder="30" unit="лет" />
                  <NumInput label="Рост" value={a.height ?? ""} onChange={v => set("height", v)} min={100} max={250} placeholder="170" unit="см" />
                  <NumInput label="Вес" value={a.weight ?? ""} onChange={v => set("weight", v)} min={30} max={300} placeholder="70" unit="кг" />
                </div>
                <Button className="w-full h-12 rounded-xl text-base" onClick={next}
                  disabled={!a.age || !a.height || !a.weight}>
                  Далее →
                </Button>
              </>
            )}

            {/* ── Step 2: Цель ── */}
            {step === 2 && (
              <>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Блок 2</p>
                  <h2 className="text-2xl font-bold">Ваша цель трансформации</h2>
                  <p className="text-sm text-muted-foreground mt-1.5">Определим направление, масштаб изменений и оптимальную стратегию достижения результата.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Основная цель</label>
                  <div className="space-y-2">
                    {[
                      { value: "fat_loss",      label: "Снижение жира" },
                      { value: "muscle_gain",   label: "Набор мышечной массы" },
                      { value: "recomposition", label: "Рекомпозиция (жир ↓, мышцы ↑)" },
                      { value: "support_form",  label: "Поддержка формы" },
                      { value: "health",        label: "Здоровье, энергия, самочувствие" },
                    ].map(o => (
                      <RadioOpt key={o.value} label={o.label} selected={a.goal === o.value} onClick={() => set("goal", o.value)} />
                    ))}
                  </div>
                </div>

                <NumInput label="Желаемый вес" value={a.targetWeight ?? ""} onChange={v => set("targetWeight", v)} min={30} max={300} placeholder={(a.weight ?? 65).toString()} unit="кг" />

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Желаемый срок достижения цели</label>
                  <div className="space-y-2">
                    {[
                      { value: "under_3m",   label: "До 3 месяцев",                sub: "Подходит для быстрого результата." },
                      { value: "3_6m",       label: "3–6 месяцев",                 sub: "Среднесрочная цель с умеренной интенсивностью." },
                      { value: "6plus_m",    label: "Долгосрочная цель (6+ месяцев)", sub: "Для долгосрочной и устойчивой трансформации." },
                    ].map(o => (
                      <button key={o.value} type="button" onClick={() => set("timeline", o.value)}
                        className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm transition-colors ${a.timeline === o.value ? "border-foreground bg-foreground text-background font-medium" : "border-border hover:border-foreground/30 hover:bg-secondary/40"}`}>
                        <span className="font-medium">{o.label}</span>
                        {o.sub && <span className={`block text-xs mt-0.5 ${a.timeline === o.value ? "text-background/60" : "text-muted-foreground"}`}>{o.sub}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <Button className="w-full h-12 rounded-xl text-base" onClick={next}
                  disabled={!a.goal || !a.targetWeight}>
                  Далее →
                </Button>
              </>
            )}

            {/* ── Step 3: Активность ── */}
            {step === 3 && (
              <>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Блок 3</p>
                  <h2 className="text-2xl font-bold">Уровень реальной активности</h2>
                  <p className="text-sm text-muted-foreground mt-1.5">Мы не используем усреднённые коэффициенты — учитываем ваши шаги и тренировки для точного расчёта.</p>
                </div>
                <div className="space-y-4">
                  <NumInput label="Количество шагов в день"
                    hint="Введите средний показатель за месяц (iPhone — «Здоровье», Android — 30 мин ≈ 5000, 60 мин ≈ 10000)"
                    value={a.dailySteps ?? ""} onChange={v => set("dailySteps", v)} min={0} max={50000} placeholder="7000" unit="шаг" />
                  <NumInput label="Кардио тренировки"
                    hint="Укажите общее время в неделю (например, 3×20 мин = 60). Кроссфит — сюда. Если не делаете — 0."
                    value={a.cardioMinutes ?? ""} onChange={v => set("cardioMinutes", v)} min={0} max={1000} placeholder="60" unit="мин/нед" />
                  <NumInput label="Силовые тренировки"
                    hint="Укажите общее время в неделю (например, 3×60 мин = 180). Если не делаете — 0."
                    value={a.strengthMinutes ?? ""} onChange={v => set("strengthMinutes", v)} min={0} max={1000} placeholder="90" unit="мин/нед" />
                </div>
                <Button className="w-full h-12 rounded-xl text-base" onClick={next}
                  disabled={a.dailySteps === "" || a.dailySteps === undefined}>
                  Далее →
                </Button>
              </>
            )}

            {/* ── Step 4: Метаболические особенности ── */}
            {step === 4 && (
              <>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Блок 4</p>
                  <h2 className="text-2xl font-bold">Метаболические особенности</h2>
                  <p className="text-sm text-muted-foreground mt-1.5">Гормональные факторы могут замедлять жиросжигание, набор мышц и влиять на энергию.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Есть ли у вас гормональные нарушения?</label>
                  <div className="space-y-2">
                    {[
                      { value: BasicSurveyInputHormonalDisorder.none,                   label: "Нет или никогда не сдавал(а) анализы" },
                      { value: BasicSurveyInputHormonalDisorder.hypothyroidism,          label: "Гипотиреоз или нарушение обмена веществ" },
                      { value: BasicSurveyInputHormonalDisorder.insulin_leptin_resistance, label: "Лептинорезистентность или инсулинорезистентность" },
                      { value: BasicSurveyInputHormonalDisorder.sex_hormone_deficiency,  label: "Дефициты половых гормонов и компенсаторные механизмы" },
                      { value: BasicSurveyInputHormonalDisorder.other_endocrine,         label: "Различные эндокринные нарушения" },
                    ].map(o => (
                      <RadioOpt key={o.value} label={o.label} selected={a.hormonalDisorder === o.value} onClick={() => set("hormonalDisorder", o.value)} />
                    ))}
                  </div>
                </div>
                <Button className="w-full h-12 rounded-xl text-base" onClick={finish}
                  disabled={!a.hormonalDisorder || mutation.isPending}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Рассчитать метаболизм →
                </Button>
              </>
            )}
          </div>

          {/* Back */}
          {step > 0 && (
            <div className="mt-4 flex justify-center">
              <Button variant="ghost" onClick={back} disabled={mutation.isPending} className="text-muted-foreground gap-1">
                <ChevronLeft className="h-4 w-4" /> Назад
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
