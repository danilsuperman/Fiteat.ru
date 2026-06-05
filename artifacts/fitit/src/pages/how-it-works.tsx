import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";

const DEFAULT_CONTENT = `## 01. Антропометрические данные

Вы указываете пол, возраст, рост и вес — базовые параметры для расчёта обмена веществ по формулам Миффлина-Сан Жеора и Харриса-Бенедикта.

Это позволяет точно определить ваш базальный метаболизм (BMR) — количество калорий, которое организм тратит в покое.

## 02. Цель и активность

Вы выбираете цель (похудеть, набрать массу, рекомпозиция или поддержание) и указываете реальный уровень активности: шаги в день, кардио и силовые тренировки.

На основе этих данных рассчитывается TDEE — суточный расход калорий с учётом образа жизни.

## 03. Состояние здоровья

Опрос охватывает гормональный фон, качество сна, уровень стресса, пищеварение и иммунитет. Эти факторы напрямую влияют на скорость обмена веществ.

## 04. Формат питания

Вы указываете предпочтения (вегетарианство, кето, безглютеновое), аллергии, нелюбимые продукты, бюджет и время на готовку.

## 05. ИИ-анализ

Языковая модель обрабатывает все ваши параметры и составляет персональный рацион: меню с рецептами, список покупок и рекомендации по режиму питания.

## 06. Прогресс и корректировки

В личном кабинете вы фиксируете вес и замеры. При необходимости создаёте скорректированный план без повторного прохождения опроса.`;

const TECH = [
  { label: "Формула BMR", value: "Миффлин-Сан Жеор + поправки" },
  { label: "Коэффициент активности", value: "Шаги + кардио + силовые" },
  { label: "Гормональные поправки", value: "5 категорий нарушений" },
  { label: "Языковая модель", value: "GPT-4 класс" },
  { label: "База продуктов", value: "USDA + российские источники" },
  { label: "Форматы экспорта", value: "PDF, DOCX" },
];

export default function HowItWorks() {
  const [page, setPage] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    fetch("/api/pages/how-it-works")
      .then(r => r.json())
      .then(d => { if (d?.content) setPage(d); })
      .catch(() => {});
  }, []);

  const title = page?.title || "Как это работает";
  const content = page?.content || DEFAULT_CONTENT;

  return (
    <Layout>
      <div className="py-12 sm:py-20">
        <div className="container px-4 max-w-5xl">
          <div className="mb-12 sm:mb-16 max-w-2xl">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Сервис</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              {title}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              От опроса до готового плана — за 5 минут. Никаких обобщённых диет: только расчёт под ваш организм.
            </p>
          </div>

          <div className="border border-border rounded-2xl p-6 sm:p-10 mb-12 space-y-1">
            {renderMarkdown(content)}
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
