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
  PreferencesSurveyInputCookingTimeMinutes
} from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";

const QUESTIONS = [
  {
    id: "mealsPerDay",
    title: "Сколько раз в день вы предпочитаете есть?",
    type: "choice",
    options: [
      { value: PreferencesSurveyInputMealsPerDay.one_two, label: "1-2 раза (интервальное голодание)" },
      { value: PreferencesSurveyInputMealsPerDay.three, label: "3 раза (завтрак, обед, ужин)" },
      { value: PreferencesSurveyInputMealsPerDay.four_five, label: "4-5 раз (с перекусами)" },
      { value: PreferencesSurveyInputMealsPerDay.six_plus, label: "6+ раз (дробное питание)" }
    ]
  },
  {
    id: "dietType",
    title: "Тип питания",
    type: "choice",
    options: [
      { value: PreferencesSurveyInputDietType.omnivore, label: "Всеядное (ем все)" },
      { value: PreferencesSurveyInputDietType.vegetarian, label: "Вегетарианское" },
      { value: PreferencesSurveyInputDietType.vegan, label: "Веганское" },
      { value: PreferencesSurveyInputDietType.pescatarian, label: "Пескетарианское (ем рыбу)" },
      { value: PreferencesSurveyInputDietType.gluten_free, label: "Без глютена" },
      { value: PreferencesSurveyInputDietType.keto, label: "Кето / Низкоуглеводное" }
    ]
  },
  {
    id: "budget",
    title: "Бюджет на продукты",
    type: "choice",
    options: [
      { value: PreferencesSurveyInputBudget.minimal, label: "Минимальный (базовые продукты, сезонные овощи)" },
      { value: PreferencesSurveyInputBudget.medium, label: "Средний (комфортный рацион)" },
      { value: PreferencesSurveyInputBudget.high, label: "Высокий (премиум продукты, свежая рыба, суперфуды)" }
    ]
  },
  {
    id: "cookingTimeMinutes",
    title: "Сколько времени готовы тратить на готовку?",
    type: "choice",
    options: [
      { value: PreferencesSurveyInputCookingTimeMinutes.under_15, label: "До 15 минут (максимально просто)" },
      { value: PreferencesSurveyInputCookingTimeMinutes.fifteen_to_30, label: "15-30 минут" },
      { value: PreferencesSurveyInputCookingTimeMinutes.over_30, label: "Более 30 минут (люблю готовить)" }
    ]
  },
  {
    id: "textPreferences",
    title: "Дополнительные предпочтения",
    type: "inputs",
    fields: [
      { id: "dislikedFoods", label: "Продукты, которые вы не любите", type: "text", placeholder: "Грибы, лук, изюм..." },
      { id: "favoriteFoods", label: "Любимые продукты", type: "text", placeholder: "Авокадо, лосось, творог..." },
      { id: "foodAllergyOrIntolerance", label: "Аллергии или непереносимость", type: "text", placeholder: "Лактоза, орехи..." }
    ]
  }
];

export default function PreferencesSurvey() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<PreferencesSurveyInput>>({});
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const submitPreferencesMutation = useSubmitPreferencesSurvey();
  const { toast } = useToast();

  const currentQuestion = QUESTIONS[step];

  const handleChoice = (value: any) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      finishSurvey(newAnswers as PreferencesSurveyInput);
    }
  };

  const handleInputsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newAnswers = { ...answers };
    
    currentQuestion.fields?.forEach(field => {
      const val = formData.get(field.id) as string;
      if (val) {
        newAnswers[field.id as keyof PreferencesSurveyInput] = val as any;
      }
    });
    
    setAnswers(newAnswers);
    
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      finishSurvey(newAnswers as PreferencesSurveyInput);
    }
  };

  const finishSurvey = (data: PreferencesSurveyInput) => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    submitPreferencesMutation.mutate({ data }, {
      onSuccess: () => {
        setLocation("/plan/purchase");
      },
      onError: (err) => {
        toast({
          title: "Ошибка",
          description: err.message || "Не удалось сохранить предпочтения",
          variant: "destructive",
        });
      }
    });
  };

  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <Layout>
      <div className="flex-1 bg-muted/20 py-12">
        <div className="container max-w-2xl">
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <div className="text-sm text-muted-foreground mt-2 text-right">
              Вопрос {step + 1} из {QUESTIONS.length}
            </div>
          </div>

          <div className="bg-card border shadow-sm rounded-xl p-8 min-h-[400px]">
            <h2 className="text-2xl font-bold mb-8 text-center">{currentQuestion.title}</h2>

            {currentQuestion.type === "choice" && (
              <div className="space-y-3">
                {currentQuestion.options?.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleChoice(option.value)}
                    className="w-full text-left px-6 py-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors duration-200"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === "inputs" && (
              <form onSubmit={handleInputsSubmit} className="space-y-6">
                {currentQuestion.fields?.map(field => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-sm font-medium">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.id}
                      placeholder={field.placeholder}
                      defaultValue={answers[field.id as keyof PreferencesSurveyInput] as string || ""}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                ))}
                <div className="pt-4">
                  <Button type="submit" className="w-full h-12 text-lg" disabled={submitPreferencesMutation.isPending}>
                    {submitPreferencesMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {step === QUESTIONS.length - 1 ? "Сохранить и продолжить" : "Далее"}
                  </Button>
                </div>
              </form>
            )}
          </div>
          
          {step > 0 && (
            <div className="mt-4 flex justify-center">
              <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={submitPreferencesMutation.isPending}>
                Назад
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
