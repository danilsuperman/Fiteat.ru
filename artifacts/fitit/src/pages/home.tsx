import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ClipboardList, BarChart3, Settings, UtensilsCrossed, Calculator, Scale, ShoppingCart, FileText, FileDown, RefreshCw } from "lucide-react";
import { Layout } from "@/components/layout";

const HOW_IT_WORKS = [
  { step: "1", title: "Пройти опрос", desc: "Ответьте на вопросы об антропометрии, активности и здоровье", icon: ClipboardList },
  { step: "2", title: "Получить анализ", desc: "Система рассчитает BMR, TDEE, ИМТ и оптимальное КБЖУ", icon: BarChart3 },
  { step: "3", title: "Настроить рацион", desc: "Укажите предпочтения, аллергии, бюджет и время на готовку", icon: Settings },
  { step: "4", title: "Получить меню", desc: "Персональный план питания с рецептами на 7–180 дней", icon: UtensilsCrossed },
];

const WHATS_INCLUDED = [
  { icon: Calculator, label: "Расчёт калорий" },
  { icon: BarChart3, label: "БЖУ" },
  { icon: UtensilsCrossed, label: "Меню с рецептами" },
  { icon: ShoppingCart, label: "Список покупок" },
  { icon: FileDown, label: "PDF" },
  { icon: FileText, label: "DOCX" },
  { icon: RefreshCw, label: "Корректировки" },
];

const TIERS = [
  { label: "7 дней", price: "490 ₽", desc: "Попробовать" },
  { label: "30 дней", price: "1 490 ₽", desc: "Трансформация", highlight: true },
  { label: "90 дней", price: "3 490 ₽", desc: "Фундамент" },
  { label: "180 дней", price: "5 990 ₽", desc: "Образ жизни" },
];

export default function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-14 sm:py-20 lg:py-32 bg-primary/5">
        <div className="container px-4">
          <div className="max-w-[780px] mx-auto text-center space-y-6 sm:space-y-8">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Получите персональный рацион питания за&nbsp;<span className="text-primary">5 минут</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-[560px] mx-auto">
              ИИ рассчитает ваши калории и создаст меню под ваши цели.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-1 sm:pt-2">
              <Link href="/survey/metabolism" className="w-full sm:w-auto">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto">
                  Создать план
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto">
                  Войти
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Как работает */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container px-4">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Как работает</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {HOW_IT_WORKS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative text-center space-y-3 sm:space-y-4">
                  <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <div className="absolute top-0 right-0 h-7 w-7 sm:h-8 sm:w-8 bg-primary text-primary-foreground rounded-full text-xs sm:text-sm font-bold flex items-center justify-center shadow">
                    {item.step}
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed hidden sm:block">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Что входит */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Что входит в план</h2>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-6 max-w-5xl mx-auto">
            {WHATS_INCLUDED.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="text-center hover:border-primary transition-colors">
                  <CardContent className="pt-4 pb-3 px-2 sm:pt-6 sm:pb-4 sm:px-3 space-y-2 sm:space-y-3">
                    <div className="mx-auto h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <p className="text-xs font-medium leading-tight">{item.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Тарифы */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container px-4">
          <div className="text-center mb-10 sm:mb-14 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Тарифы</h2>
            <p className="text-muted-foreground">Выберите подходящую длительность плана</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-5xl mx-auto">
            {TIERS.map((tier) => (
              <Card key={tier.label} className={`relative flex flex-col text-center ${tier.highlight ? "border-primary shadow-lg ring-1 ring-primary" : ""}`}>
                {tier.highlight && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">Популярный</span>
                  </div>
                )}
                <CardContent className="pt-6 sm:pt-8 pb-5 sm:pb-6 px-3 sm:px-4 space-y-3 sm:space-y-4 flex-1 flex flex-col">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">{tier.desc}</p>
                    <p className="text-xl sm:text-2xl font-bold mt-1">{tier.label}</p>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">{tier.price}</p>
                  <div className="mt-auto pt-2 sm:pt-4">
                    <Link href="/survey/metabolism">
                      <Button className="w-full text-sm" variant={tier.highlight ? "default" : "outline"}>
                        Начать
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
