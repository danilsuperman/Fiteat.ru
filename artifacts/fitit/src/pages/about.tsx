import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";

const STATS = [
  { value: "2 347+", label: "планов составлено" },
  { value: "94%", label: "пользователей достигают цели" },
  { value: "−4.2 кг", label: "средний результат за 30 дней" },
  { value: "5 мин", label: "время прохождения опроса" },
];

const DEFAULT_CONTENT = `## Наша миссия

Большинство людей, которые хотят изменить фигуру или улучшить самочувствие, сталкиваются с одной и той же проблемой: информации слишком много, она противоречива, а персонального совета не у кого спросить.

Диеты из интернета работают не для всех. Калории без учёта макронутриентов — упрощение. Гормональный фон, качество сна, стресс — факторы, которые врач-нутрициолог обязательно учтёт, а бесплатный калькулятор — нет.

Мы создали сервис, который объединяет клиническую методологию расчёта метаболизма с возможностями современного ИИ — чтобы каждый мог получить действительно персональный план питания за 5 минут.

## Наши принципы

### Персонализация
Никаких универсальных диет. Каждый план строится на реальных данных о вашем организме: метаболизм, активность, здоровье и предпочтения.

### Наука, а не мода
Все расчёты основаны на доказательной нутрициологии: формулы BMR, коэффициенты активности, физиологические нормы КБЖУ.

### Доступность
Персональный нутрициолог стоит 3 000–10 000 ₽ в месяц. Мы даём тот же уровень персонализации за сотни рублей.

### Безопасность данных
Ваши данные хранятся в зашифрованном виде. Мы не передаём личные данные третьим лицам и не используем их для рекламы.`;

export default function About() {
  const [page, setPage] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    fetch("/api/pages/about")
      .then(r => r.json())
      .then(d => { if (d?.content) setPage(d); })
      .catch(() => {});
  }, []);

  const title = page?.title || "О платформе";
  const content = page?.content || DEFAULT_CONTENT;

  return (
    <Layout>
      <div className="py-12 sm:py-20">
        <div className="container px-4 max-w-5xl">

          <div className="max-w-2xl mb-14 sm:mb-20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Компания</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-5">
              {title}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              ФИТИТ.ПРО — персональный цифровой нутрициолог. Мы делаем доказательное питание доступным для каждого.
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

          <div className="mb-16 space-y-1">
            {renderMarkdown(content)}
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
