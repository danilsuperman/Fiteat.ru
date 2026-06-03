import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { useSubmitBasicSurvey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import {
  BasicSurveyInput,
  BasicSurveyInputGender,
  BasicSurveyInputGoal,
  BasicSurveyInputHormonalDisorder,
  BasicSurveyInputLifestyle,
} from "@workspace/api-client-react";
import { Progress } from "@/components/ui/progress";
import { Loader2, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QUESTIONS = [
  {
    id: "gender",
    title: "Ваш пол?",
    type: "choice",
    options: [
      { value: BasicSurveyInputGender.male, label: "Мужской" },
      { value: BasicSurveyInputGender.female, label: "Женский" },
    ],
  },
  {
    id: "goal",
    title: "Какая у вас цель?",
    type: "choice",
    options: [
      { value: BasicSurveyInputGoal.lose_weight, label: "Похудеть" },
      { value: BasicSurveyInputGoal.maintain_recompose, label: "Поддержать вес / Рекомпозиция тела" },
      { value: BasicSurveyInputGoal.gain_weight, label: "Набрать мышечную массу" },
    ],
  },
  {
    id: "hormonalDisorder",
    title: "Есть ли у вас диагностированные гормональные нарушения?",
    type: "choice",
    options: [
      { value: BasicSurveyInputHormonalDisorder.none, label: "Нет" },
      { value: BasicSurveyInputHormonalDisorder.hypothyroidism, label: "Гипотиреоз" },
      { value: BasicSurveyInputHormonalDisorder.insulin_leptin_resistance, label: "Инсулино/Лептинорезистентность" },
      { value: BasicSurveyInputHormonalDisorder.sex_hormone_deficiency, label: "Дефицит половых гормонов" },
      { value: BasicSurveyInputHormonalDisorder.other_endocrine, label: "Другие эндокринные нарушения" },
    ],
  },
  {
    id: "lifestyle",
    title: "Опишите ваш образ жизни:",
    type: "choice",
    options: [
      { value: BasicSurveyInputLifestyle.sedentary, label: "Сидячий (менее 5 000 шагов/день)" },
      { value: BasicSurveyInputLifestyle.office_active, label: "Офисный, активный (5–8 тыс. шагов)" },
      { value: BasicSurveyInputLifestyle.on_feet, label: "Работа на ногах (8–12 тыс. шагов)" },
      { value: BasicSurveyInputLifestyle.intense_training, label: "Интенсивные ежедневные тренировки" },
      { value: BasicSurveyInputLifestyle.physical_labor, label: "Тяжёлый физический труд" },
    ],
  },
  {
    id: "measurements",
    title: "Ваши параметры",
    type: "inputs",
    fields: [
      { id: "age", label: "Возраст (лет)", type: "number", min: 14, max: 100, placeholder: "30" },
      { id: "height", label: "Рост (см)", type: "number", min: 100, max: 250, placeholder: "170" },
      { id: "weight", label: "Текущий вес (кг)", type: "number", min: 30, max: 300, placeholder: "70" },
      { id: "targetWeight", label: "Желаемый вес (кг)", type: "number", min: 30, max: 300, placeholder: "65" },
    ],
  },
  {
    id: "activity",
    title: "Ваша физическая активность",
    type: "inputs",
    fields: [
      { id: "dailySteps", label: "Шагов в день", type: "number", min: 0, max: 50000, placeholder: "7000" },
      { id: "cardioMinutesPerWeek", label: "Кардио (минут в неделю)", type: "number", min: 0, max: 1000, placeholder: "60" },
      { id: "strengthMinutesPerWeek", label: "Силовые тренировки (минут в неделю)", type: "number", min: 0, max: 1000, placeholder: "90" },
    ],
  },
];

export default function Survey() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<BasicSurveyInput>>({});
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const submitSurveyMutation = useSubmitBasicSurvey();
  const { toast } = useToast();

  const currentQuestion = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const handleChoice = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      finishSurvey(newAnswers as BasicSurveyInput);
    }
  };

  const handleInputsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAnswers = { ...answers };
    currentQuestion.fields?.forEach((field) => {
      newAnswers[field.id as keyof BasicSurveyInput] = Number(formData.get(field.id)) as any;
    });
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      finishSurvey(newAnswers as BasicSurveyInput);
    }
  };

  const finishSurvey = (data: BasicSurveyInput) => {
    if (isAuthenticated) {
      submitSurveyMutation.mutate(
        { data },
        {
          onSuccess: () => setLocation("/result"),
          onError: (err) =>
            toast({ title: "Ошибка", description: err.message || "Не удалось сохранить ответы", variant: "destructive" }),
        },
      );
    } else {
      localStorage.setItem("fitit_pending_survey_1", JSON.stringify(data));
      setLocation("/register");
    }
  };

  return (
    <Layout>
      <div className="flex-1 bg-muted/20 py-6 sm:py-12">
        <div className="container max-w-2xl px-4">
          {/* Progress header */}
          <div className="mb-6 sm:mb-8 space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span className="font-medium">Метаболический анализ</span>
              <span>{step + 1} / {QUESTIONS.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question card */}
          <div className="bg-card border shadow-sm rounded-xl p-5 sm:p-8 min-h-[280px] sm:min-h-[420px] flex flex-col">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center leading-snug">
              {currentQuestion.title}
            </h2>

            {currentQuestion.type === "choice" && (
              <div className="space-y-2.5 sm:space-y-3 flex-1">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChoice(option.value)}
                    className={`w-full text-left px-4 sm:px-6 py-3.5 sm:py-4 rounded-lg border transition-colors duration-150 text-sm sm:text-base hover:border-primary hover:bg-primary/5 active:bg-primary/10 ${
                      answers[currentQuestion.id as keyof BasicSurveyInput] === option.value
                        ? "border-primary bg-primary/10 font-medium"
                        : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === "inputs" && (
              <form onSubmit={handleInputsSubmit} className="space-y-4 flex-1 flex flex-col">
                <div className="flex-1 space-y-4 sm:space-y-5">
                  {currentQuestion.fields?.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <label className="text-sm font-medium">{field.label}</label>
                      <input
                        type={field.type}
                        name={field.id}
                        min={field.min}
                        max={field.max}
                        placeholder={field.placeholder}
                        defaultValue={
                          (answers[field.id as keyof BasicSurveyInput] as number) || ""
                        }
                        required
                        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base mt-4"
                  disabled={submitSurveyMutation.isPending}
                >
                  {submitSurveyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {step === QUESTIONS.length - 1 ? "Рассчитать результат" : "Далее →"}
                </Button>
              </form>
            )}
          </div>

          {/* Back button */}
          {step > 0 && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                disabled={submitSurveyMutation.isPending}
                className="text-muted-foreground"
              >
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
