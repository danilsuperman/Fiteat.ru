import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, Star } from "lucide-react";
import { Layout } from "@/components/layout";

/* ─── Home Reviews Section ─── */
function HomeReviewsSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews?limit=3")
      .then(r => r.json())
      .then(d => setReviews(d.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && reviews.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-secondary/30">
      <div className="container px-4 max-w-6xl">
        <div className="flex items-end justify-between gap-4 mb-10 sm:mb-14">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Отзывы</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Реальные результаты</h2>
          </div>
          <Link href="/reviews" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap flex items-center gap-1">
            Все отзывы <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-secondary animate-pulse" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-5">
            {reviews.map(r => (
              <div key={r.id} className="bg-background rounded-2xl border border-border p-5 flex flex-col gap-3">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{r.text}</p>
                {r.photos?.length > 0 && (
                  <img src={r.photos[0]} alt="" className="w-full aspect-video object-cover rounded-xl" />
                )}
                <div className="mt-auto pt-2 border-t border-border/60">
                  <p className="text-sm font-semibold">{r.user_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const STEPS = [
  {
    number: "01",
    title: "Опрос о здоровье",
    desc: "Антропометрия, уровень активности, сон, гормональный фон и пищевые привычки",
  },
  {
    number: "02",
    title: "Метаболический анализ",
    desc: "Расчёт BMR, TDEE, ИМТ и оптимального соотношения белков, жиров и углеводов",
  },
  {
    number: "03",
    title: "Настройка рациона",
    desc: "Предпочтения, аллергии, бюджет, кухни мира и время на приготовление",
  },
  {
    number: "04",
    title: "Персональный план",
    desc: "Меню с рецептами и списком покупок на 7–180 дней в форматах PDF и DOCX",
  },
];

const INCLUDED = [
  "Расчёт КБЖУ",
  "Меню с рецептами",
  "Список покупок",
  "PDF и DOCX",
  "Корректировки",
  "Анализ прогресса",
];

const TIERS = [
  { label: "7 дней", price: "490 ₽", desc: "Попробовать", highlight: false },
  { label: "30 дней", price: "1 490 ₽", desc: "Трансформация", highlight: true },
  { label: "90 дней", price: "3 490 ₽", desc: "Фундамент", highlight: false },
  { label: "180 дней", price: "5 990 ₽", desc: "Образ жизни", highlight: false },
];

const STATS = [
  { value: "2 347", label: "планов создано" },
  { value: "94%", label: "достигают цели" },
  { value: "−4.2 кг", label: "средний результат за 30 дней" },
];

export default function Home() {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
        <div className="container px-4 max-w-6xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground border border-border rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              Персональный цифровой нутрициолог
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              Персональный рацион питания за{" "}
              <span className="text-accent">5 минут</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl">
              ИИ рассчитает ваш метаболизм и составит меню с рецептами под ваши цели, предпочтения и образ жизни.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/survey/metabolism" className="w-full sm:w-auto">
                <Button size="lg" className="h-13 px-8 text-base rounded-full w-full sm:w-auto font-medium">
                  Создать план
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-13 px-8 text-base rounded-full w-full sm:w-auto font-medium border-border">
                  Войти
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 border-y border-border/60">
        <div className="container px-4 max-w-6xl">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">{s.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28">
        <div className="container px-4 max-w-6xl">
          <div className="mb-12 sm:mb-16">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">Как работает</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              От опроса до готового меню
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {STEPS.map((step) => (
              <div key={step.number} className="bg-background p-6 sm:p-8 space-y-4">
                <span className="text-3xl font-bold text-foreground/10 tracking-tight">{step.number}</span>
                <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-20 sm:py-28 bg-secondary/40">
        <div className="container px-4 max-w-6xl">
          <div className="mb-12">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">Что входит</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Всё необходимое в одном плане
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {INCLUDED.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-background text-sm font-medium text-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <HomeReviewsSection />

      {/* Pricing */}
      <section className="py-20 sm:py-28">
        <div className="container px-4 max-w-6xl">
          <div className="mb-12 sm:mb-16">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">Тарифы</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Выберите длительность
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {TIERS.map((tier) => (
              <div
                key={tier.label}
                className={`relative rounded-2xl p-6 sm:p-8 flex flex-col gap-4 border transition-shadow ${
                  tier.highlight
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold bg-accent text-accent-foreground px-3 py-1 rounded-full whitespace-nowrap">
                    Популярный
                  </span>
                )}
                <div>
                  <p className={`text-xs font-medium mb-1 ${tier.highlight ? "text-background/60" : "text-muted-foreground"}`}>
                    {tier.desc}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight">{tier.label}</p>
                </div>
                <p className={`text-xl sm:text-2xl font-bold ${tier.highlight ? "text-background" : "text-foreground"}`}>
                  {tier.price}
                </p>
                <Link href="/survey/metabolism" className="mt-auto">
                  <Button
                    className={`w-full rounded-xl text-sm font-medium ${
                      tier.highlight
                        ? "bg-background text-foreground hover:bg-background/90"
                        : ""
                    }`}
                    variant={tier.highlight ? "ghost" : "outline"}
                  >
                    Начать
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-foreground">
        <div className="container px-4 max-w-6xl text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-background tracking-tight mb-4">
            Начните сегодня — бесплатно
          </h2>
          <p className="text-background/60 text-base sm:text-lg mb-8 max-w-md mx-auto">
            Опрос занимает 5 минут. Первый анализ доступен сразу после прохождения.
          </p>
          <Link href="/survey/metabolism">
            <Button
              size="lg"
              className="h-13 px-10 text-base rounded-full bg-background text-foreground hover:bg-background/90 font-medium"
            >
              Создать план бесплатно
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
