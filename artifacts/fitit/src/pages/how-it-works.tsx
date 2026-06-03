import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { ArrowRight, Brain, Calculator, ChefHat, LineChart, Shield, Zap } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Calculator,
    title: "Антропометрические данные",
    desc: "Вы указываете пол, возраст, рост и вес — базовые параметры для расчёта обмена веществ по формулам Миффлина-Сан Жеора и Харриса-Бенедикта.",
    detail: "Это позволяет точно определить ваш базальный метаболизм (BMR) — количество калорий, которое организм тратит в покое.",
  },
  {
    number: "02",
    icon: Zap,
    title: "Цель и активность",
    desc: "Вы выбираете цель (похудеть, набрать массу, рекомпозиция или поддержание) и указываете реальный уровень активности: шаги в день, кардио и силовые тренировки.",
    detail: "На основе этих данных рассчитывается TDEE — суточный расход калорий с учётом образа жизни.",
  },
  {
    number: "03",
    icon: Shield,
    title: "Состояние здоровья",
    desc: "Опрос охватывает гормональный фон, качество сна, уровень стресса, пищеварение и иммунитет. Эти факторы напрямую влияют на скорость обмена веществ.",
    detail: "Например, гипотиреоз снижает BMR на 15–30%, а хронический стресс повышает уровень кортизола, что влияет на накопление жира.",
  },
  {
    number: "04",
    icon: ChefHat,
    title: "Формат питания",
    desc: "Вы указываете предпочтения (вегетарианство, кето, безглютеновое), аллергии, нелюбимые продукты, бюджет и время на готовку.",
    detail: "Это гарантирует, что план будет не только эффективным, но и комфортным для соблюдения в долгосрочной перспективе.",
  },
  {
    number: "05",
    icon: Brain,
    title: "ИИ-анализ",
    desc: "Языковая модель обрабатывает все ваши параметры и составляет персональный рацион: меню с рецептами, список покупок и рекомендации по режиму питания.",
    detail: "Каждое блюдо подбирается с учётом вашего КБЖУ, вкусовых предпочтений и целей трансформации.",
  },
  {
    number: "06",
    icon: LineChart,
    title: "Прогресс и корректировки",
    desc: "В личном кабинете вы фиксируете вес и замеры. При необходимости создаёте скорректированный план без повторного прохождения опроса.",
    detail: "Тело меняется — план меняется вместе с ним.",
  },
];

const TECH = [
  { label: "Формула BMR", value: "Миффлин-Сан Жеор + поправки" },
  { label: "Коэффициент активности", value: "Шаги + кардио + силовые" },
  { label: "Гормональные поправки", value: "5 категорий нарушений" },
  { label: "Языковая модель", value: "GPT-4 класс" },
  { label: "База продуктов", value: "USDA + российские источники" },
  { label: "Форматы экспорта", value: "PDF, DOCX" },
];

export default function HowItWorks() {
  return (
    <Layout>
      <div className="py-12 sm:py-20">
        <div className="container px-4 max-w-5xl">
          <div className="mb-12 sm:mb-16 max-w-2xl">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Сервис</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              Как это работает
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              От опроса до готового плана — за 5 минут. Никаких обобщённых диет: только расчёт под ваш организм.
            </p>
          </div>

          <div className="space-y-0 mb-16">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className={`flex gap-6 sm:gap-10 py-8 sm:py-10 ${i < STEPS.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="shrink-0">
                    <div className="h-12 w-12 rounded-2xl bg-foreground/5 flex items-center justify-center border border-border">
                      <Icon className="h-5 w-5 text-foreground/70" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-xs font-bold text-muted-foreground/50 tracking-widest">{step.number}</span>
                      <h2 className="text-lg font-bold text-foreground">{step.title}</h2>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-2">{step.desc}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-secondary/40 rounded-2xl p-6 sm:p-10 mb-10">
            <h2 className="text-xl font-bold mb-6">Технологии и методология</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TECH.map((item) => (
                <div key={item.label} className="bg-background rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link href="/survey/metabolism">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors">
                Попробовать бесплатно
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
