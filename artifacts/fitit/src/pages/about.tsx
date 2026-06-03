import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { ArrowRight, Target, Users, Zap, Shield } from "lucide-react";

const VALUES = [
  {
    icon: Target,
    title: "Персонализация",
    desc: "Никаких универсальных диет. Каждый план строится на реальных данных о вашем организме: метаболизм, активность, здоровье и предпочтения.",
  },
  {
    icon: Zap,
    title: "Наука, а не мода",
    desc: "Все расчёты основаны на доказательной нутрициологии: формулы BMR, коэффициенты активности, физиологические нормы КБЖУ.",
  },
  {
    icon: Users,
    title: "Доступность",
    desc: "Персональный нутрициолог стоит 3 000–10 000 ₽ в месяц. Мы даём тот же уровень персонализации за сотни рублей.",
  },
  {
    icon: Shield,
    title: "Безопасность данных",
    desc: "Ваши данные хранятся в зашифрованном виде. Мы не передаём личные данные третьим лицам и не используем их для рекламы.",
  },
];

const STATS = [
  { value: "2 347+", label: "планов составлено" },
  { value: "94%", label: "пользователей достигают цели" },
  { value: "−4.2 кг", label: "средний результат за 30 дней" },
  { value: "5 мин", label: "время прохождения опроса" },
];

export default function About() {
  return (
    <Layout>
      <div className="py-12 sm:py-20">
        <div className="container px-4 max-w-5xl">

          <div className="max-w-2xl mb-14 sm:mb-20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Компания</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-5">
              О платформе
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              ФИТИТ.ПРО — персональный цифровой нутрициолог. Мы делаем доказательное питание доступным для каждого, без дорогих консультаций и универсальных диет.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border mb-16 rounded-2xl overflow-hidden">
            {STATS.map((s) => (
              <div key={s.label} className="bg-background p-6 sm:p-8 text-center">
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">{s.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Наша миссия</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
              <p className="text-base leading-relaxed">
                Большинство людей, которые хотят изменить фигуру или улучшить самочувствие, сталкиваются с одной и той же проблемой: информации слишком много, она противоречива, а персонального совета не у кого спросить.
              </p>
              <p className="text-base leading-relaxed">
                Диеты из интернета работают не для всех. Калории без учёта макронутриентов — упрощение. Гормональный фон, качество сна, стресс — факторы, которые врач-нутрициолог обязательно учтёт, а бесплатный калькулятор — нет.
              </p>
              <p className="text-base leading-relaxed">
                Мы создали сервис, который объединяет клиническую методологию расчёта метаболизма с возможностями современного ИИ — чтобы каждый мог получить действительно персональный план питания за 5 минут.
              </p>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Наши принципы</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {VALUES.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.title} className="bg-background border border-border rounded-2xl p-6 flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-foreground/70" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">{v.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-foreground rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-bold text-background mb-3">Начните прямо сейчас</h2>
            <p className="text-background/60 mb-6 max-w-sm mx-auto">
              Опрос занимает 5 минут. Базовый анализ метаболизма — бесплатно.
            </p>
            <Link href="/survey/metabolism">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background text-foreground text-sm font-medium hover:bg-background/90 transition-colors">
                Создать план
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

        </div>
      </div>
    </Layout>
  );
}
