import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { useSubmitPreferencesSurvey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  PreferencesSurveyInput,
  PreferencesSurveyInputMealsPerDay,
  PreferencesSurveyInputDietType,
  PreferencesSurveyInputBudget,
  PreferencesSurveyInputCookingTimeMinutes,
} from "@workspace/api-client-react";
import { Loader2, Check, ChevronLeft } from "lucide-react";

const CUISINES = [
  { value: "russian", label: "Русская" },
  { value: "italian", label: "Итальянская" },
  { value: "asian", label: "Азиатская" },
  { value: "mexican", label: "Мексиканская" },
  { value: "mediterranean", label: "Средиземноморская" },
];

const PROTEIN_SOURCES = [
  { value: "chicken", label: "Курица" },
  { value: "turkey", label: "Индейка" },
  { value: "fish", label: "Рыба" },
  { value: "eggs", label: "Яйца" },
  { value: "beef", label: "Говядина" },
  { value: "seafood", label: "Морепродукты" },
];

type SurveyAnswers = Partial<PreferencesSurveyInput> & {
  favoriteCuisines?: string[];
  preferredProteinSources?: string[];
};

const QUESTIONS = [
  {
    id: "mealsPerDay",
    title: "Сколько раз в день вы предпочитаете есть?",
    type: "choice",
    options: [
      { value: PreferencesSurveyInputMealsPerDay.one_two, label: "1–2 раза (интервальное голодание)" },
      { value: PreferencesSurveyInputMealsPerDay.three, label: "3 раза (завтрак, обед, ужин)" },
      { value: PreferencesSurveyInputMealsPerDay.four_five, label: "4–5 раз (с перекусами)" },
      { value: PreferencesSurveyInputMealsPerDay.six_plus, label: "6+ раз (дробное питание)" },
    ],
  },
  {
    id: "dietType",
    title: "Тип питания",
    type: "choice",
    options: [
      { value: PreferencesSurveyInputDietType.omnivore, label: "Всеядное (ем всё)" },
      { value: PreferencesSurveyInputDietType.vegetarian, label: "Вегетарианское" },
      { value: PreferencesSurveyInputDietType.vegan, label: "Веганское" },
      { value: PreferencesSurveyInputDietType.pescatarian, label: "Пескетарианское (ем рыбу)" },
      { value: PreferencesSurveyInputDietType.gluten_free, label: "Без глютена" },
      { value: PreferencesSurveyInputDietType.keto, label: "Кето / Низкоуглеводное" },
    ],
  },
  {
    id: "favoriteCuisines",
    title: "Любимые кухни мира",
    type: "multiselect",
    subtitle: "Выберите одну или несколько",
    options: CUISINES,
  },
  {
    id: "preferredProteinSources",
    title: "Предпочитаемые источники белка",
    type: "multiselect",
    subtitle: "Выберите один или несколько",
    options: PROTEIN_SOURCES,
  },
  {
    id: "budget",
    title: "Бюджет на продукты",
    type: "choice",
    options: [
      { value: PreferencesSurveyInputBudget.minimal, label: "Минимальный (базовые, сезонные продукты)" },
      { value: PreferencesSurveyInputBudget.medium, label: "Средний (комфортный рацион)" },
      { value: PreferencesSurveyInputBudget.high, label: "Высокий (рыба, суперфуды, премиум)" },
    ],
  },
  {
    id: "cookingTimeMinutes",
    title: "Сколько времени готовы тратить на готовку?",
    type: "choice",
    options: [
      { value: PreferencesSurveyInputCookingTimeMinutes.under_15, label: "До 15 минут (максимально просто)" },
      { value: PreferencesSurveyInputCookingTimeMinutes.fifteen_to_30, label: "15–30 минут" },
      { value: PreferencesSurveyInputCookingTimeMinutes.over_30, label: "Более 30 минут (люблю готовить)" },
    ],
  },
  {
    id: "textPreferences",
    title: "Дополнительные предпочтения",
    type: "inputs",
    fields: [
      { id: "dislikedFoods", label: "Продукты, которые вы не любите", placeholder: "Грибы, лук, изюм..." },
      { id: "favoriteFoods", label: "Любимые продукты", placeholder: "Авокадо, лосось, творог..." },
      { id: "foodAllergyOrIntolerance", label: "Аллергии или непереносимость", placeholder: "Лактоза, орехи..." },
    ],
  },
];

export default function NutritionSurvey() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const submitMutation = useSubmitPreferencesSurvey();
  const { toast } = useToast();

  const currentQuestion = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const handleChoice = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else finishSurvey(newAnswers);
  };

  const handleMultiToggle = (value: string) => {
    const key = currentQuestion.id as "favoriteCuisines" | "preferredProteinSources";
    const current: string[] = (answers[key] as string[]) || [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setAnswers({ ...answers, [key]: next });
  };

  const handleMultiNext = () => {
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else finishSurvey(answers);
  };

  const handleInputsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAnswers = { ...answers };
    currentQuestion.fields?.forEach((field) => {
      const val = formData.get(field.id) as string;
      if (val) (newAnswers as any)[field.id] = val;
    });
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else finishSurvey(newAnswers);
  };

  const finishSurvey = (data: SurveyAnswers) => {
    if (!isAuthenticated) {
      localStorage.setItem("fitit_pending_survey_2", JSON.stringify(data));
      setLocation("/login");
      return;
    }
    submitMutation.mutate(
      { data: data as any },
      {
        onSuccess: () => setLocation("/payment"),
        onError: (err) =>
          toast({ title: "Ошибка", description: err.message || "Не удалось сохранить", variant: "destructive" }),
      },
    );
  };

  const selectedMulti: string[] =
    currentQuestion.type === "multiselect"
      ? ((answers[currentQuestion.id as keyof SurveyAnswers] as string[]) || [])
      : [];

  return (
    <Layout>
      <div className="flex-1 bg-muted/20 py-6 sm:py-12">
        <div className="container max-w-2xl px-4">
          {/* Progress header */}
          <div className="mb-6 sm:mb-8 space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span className="font-medium">Настройка рациона</span>
              <span>{step + 1} / {QUESTIONS.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question card */}
          <div className="bg-card border shadow-sm rounded-xl p-5 sm:p-8 min-h-[280px] sm:min-h-[420px] flex flex-col">
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-center leading-snug">
              {currentQuestion.title}
            </h2>
            {(currentQuestion as any).subtitle && (
              <p className="text-sm text-muted-foreground text-center mb-4 sm:mb-6">
                {(currentQuestion as any).subtitle}
              </p>
            )}
            {!(currentQuestion as any).subtitle && <div className="mb-4 sm:mb-6" />}

            {currentQuestion.type === "choice" && (
              <div className="space-y-2.5 sm:space-y-3 flex-1">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChoice(option.value)}
                    className={`w-full text-left px-4 sm:px-6 py-3.5 sm:py-4 rounded-lg border transition-colors text-sm sm:text-base hover:border-primary hover:bg-primary/5 active:bg-primary/10 ${
                      answers[currentQuestion.id as keyof SurveyAnswers] === option.value
                        ? "border-primary bg-primary/10 font-medium"
                        : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === "multiselect" && (
              <div className="flex-1 flex flex-col">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 flex-1">
                  {currentQuestion.options?.map((option) => {
                    const selected = selectedMulti.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleMultiToggle(option.value)}
                        className={`relative px-3 sm:px-4 py-3 sm:py-4 rounded-lg border text-sm font-medium transition-all ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        {selected && (
                          <Check className="absolute top-2 right-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        )}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <Button
                  onClick={handleMultiNext}
                  className="w-full h-12 text-base mt-5 sm:mt-6"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {step === QUESTIONS.length - 1 ? "Завершить" : "Далее →"}
                </Button>
              </div>
            )}

            {currentQuestion.type === "inputs" && (
              <form onSubmit={handleInputsSubmit} className="space-y-4 flex-1 flex flex-col">
                <div className="flex-1 space-y-4 sm:space-y-5">
                  {currentQuestion.fields?.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <label className="text-sm font-medium">{field.label}</label>
                      <input
                        type="text"
                        name={field.id}
                        placeholder={field.placeholder}
                        defaultValue={(answers as any)[field.id] || ""}
                        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base mt-4"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {step === QUESTIONS.length - 1 ? "Сохранить и продолжить" : "Далее →"}
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
                disabled={submitMutation.isPending}
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
