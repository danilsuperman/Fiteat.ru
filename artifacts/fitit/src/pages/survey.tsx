import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { useSubmitBasicSurvey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { BasicSurveyInput, BasicSurveyInputGender, BasicSurveyInputGoal, BasicSurveyInputHormonalDisorder, BasicSurveyInputLifestyle } from "@workspace/api-client-react";
import { Progress } from "@/components/ui/progress";

// Simplified survey for the prompt
const QUESTIONS = [
  {
    id: "gender",
    title: "Ваш пол?",
    type: "choice",
    options: [
      { value: BasicSurveyInputGender.male, label: "Мужской" },
      { value: BasicSurveyInputGender.female, label: "Женский" }
    ]
  },
  {
    id: "goal",
    title: "Какая у вас цель?",
    type: "choice",
    options: [
      { value: BasicSurveyInputGoal.lose_weight, label: "Похудеть" },
      { value: BasicSurveyInputGoal.maintain_recompose, label: "Поддержать вес / Рекомпозиция" },
      { value: BasicSurveyInputGoal.gain_weight, label: "Набрать мышечную массу" }
    ]
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
      { value: BasicSurveyInputHormonalDisorder.other_endocrine, label: "Другие эндокринные нарушения" }
    ]
  },
  {
    id: "lifestyle",
    title: "Ваш образ жизни?",
    type: "choice",
    options: [
      { value: BasicSurveyInputLifestyle.sedentary, label: "Сидячий (менее 5000 шагов)" },
      { value: BasicSurveyInputLifestyle.office_active, label: "Офисный, но активный (5-8 тыс. шагов)" },
      { value: BasicSurveyInputLifestyle.on_feet, label: "Работа на ногах (8-12 тыс. шагов)" },
      { value: BasicSurveyInputLifestyle.intense_training, label: "Интенсивные тренировки (ежедневно)" },
      { value: BasicSurveyInputLifestyle.physical_labor, label: "Тяжелый физический труд" }
    ]
  },
  {
    id: "measurements",
    title: "Ваши параметры",
    type: "inputs",
    fields: [
      { id: "age", label: "Возраст (лет)", type: "number", min: 18, max: 100 },
      { id: "height", label: "Рост (см)", type: "number", min: 100, max: 250 },
      { id: "weight", label: "Текущий вес (кг)", type: "number", min: 30, max: 300 },
      { id: "targetWeight", label: "Желаемый вес (кг)", type: "number", min: 30, max: 300 }
    ]
  },
  {
    id: "activity",
    title: "Ваша активность",
    type: "inputs",
    fields: [
      { id: "dailySteps", label: "Шагов в день", type: "number", min: 0, max: 50000, defaultValue: 5000 },
      { id: "cardioMinutesPerWeek", label: "Кардио (минут в неделю)", type: "number", min: 0, max: 1000, defaultValue: 0 },
      { id: "strengthMinutesPerWeek", label: "Силовые тренировки (минут в неделю)", type: "number", min: 0, max: 1000, defaultValue: 0 }
    ]
  }
];

export default function Survey() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<BasicSurveyInput>>({});
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const submitSurveyMutation = useSubmitBasicSurvey();

  const currentQuestion = QUESTIONS[step];

  const handleChoice = (value: any) => {
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
    
    currentQuestion.fields?.forEach(field => {
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
      submitSurveyMutation.mutate({ data }, {
        onSuccess: () => {
          setLocation("/results");
        }
      });
    } else {
      localStorage.setItem("fitit_pending_survey_1", JSON.stringify(data));
      setLocation("/register");
    }
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
                      min={field.min}
                      max={field.max}
                      defaultValue={answers[field.id as keyof BasicSurveyInput] as number || field.defaultValue || ""}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                ))}
                <div className="pt-4">
                  <Button type="submit" className="w-full h-12 text-lg">
                    {step === QUESTIONS.length - 1 ? "Завершить" : "Далее"}
                  </Button>
                </div>
              </form>
            )}
          </div>
          
          {step > 0 && (
            <div className="mt-4 flex justify-center">
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Назад
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
