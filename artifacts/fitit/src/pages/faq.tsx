import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { ChevronDown } from "lucide-react";
import { Link } from "wouter";

function parseFAQ(content: string): { q: string; a: string }[] {
  const result: { q: string; a: string }[] = [];
  const parts = content.split(/\n## /);
  for (const part of parts) {
    const trimmed = part.startsWith("## ") ? part.slice(3) : part;
    const nl = trimmed.indexOf("\n");
    if (nl === -1) continue;
    const q = trimmed.slice(0, nl).trim().replace(/\?$/, "").trim() + "?";
    const a = trimmed.slice(nl + 1).trim();
    if (q && a) result.push({ q, a });
  }
  return result;
}

const DEFAULT_FAQS = [
  { q: "Как работает персональный план питания?", a: "Вы проходите опрос из 5 блоков: базовые параметры (пол, возраст, рост, вес), цель (похудеть, набрать массу и т.д.), уровень активности, метаболические особенности и предпочтения в еде. На основе ваших данных ИИ рассчитывает BMR, TDEE и составляет меню с рецептами и списком покупок на выбранный период." },
  { q: "Что такое BMR и TDEE?", a: "BMR (базальный метаболизм) — количество калорий, которое организм тратит в полном покое. TDEE (суточный расход энергии) — BMR с учётом вашей физической активности. Именно от TDEE отталкивается расчёт вашего рациона." },
  { q: "Я могу начать бесплатно?", a: "Да. Опрос и базовый анализ метаболизма бесплатны. Вы сразу получаете расчёт BMR, TDEE, ИМТ и рекомендации по КБЖУ. Для получения полного плана питания с меню и рецептами нужно выбрать один из тарифов." },
  { q: "Насколько безопасны рекомендации?", a: "ФИТИТ.ПРО — это инструмент для персонализации питания, а не медицинский сервис. Все планы составляются в рамках физиологических норм. Тем не менее, если у вас есть хронические заболевания или вы принимаете лекарства, рекомендуем согласовывать изменения рациона с врачом." },
  { q: "Что входит в план питания?", a: "В план входит: меню на каждый день с конкретными блюдами и рецептами, расчёт КБЖУ по каждому приёму пищи, список покупок, рекомендации по перекусам. В зависимости от тарифа — от 7 до 180 дней." },
  { q: "Поддерживаются ли вегетарианские и другие типы питания?", a: "Да. При заполнении расширенного опроса вы указываете предпочтения: всеядность, вегетарианство, веганство, пескетарианство, безглютеновая диета, кето." },
  { q: "Как удалить аккаунт или данные?", a: "Для удаления аккаунта и всех связанных данных обратитесь в поддержку через страницу «Поддержка». Запрос обрабатывается в течение 3 рабочих дней." },
  { q: "Можно ли скачать план в PDF?", a: "Функция экспорта в PDF и DOCX доступна на тарифах от 30 дней. После получения плана вы найдёте кнопку «Экспортировать» на странице плана." },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="text-sm sm:text-base font-medium text-foreground group-hover:text-accent transition-colors">
          {q}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="text-sm text-muted-foreground leading-relaxed pb-5">{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  const [page, setPage] = useState<{ title: string; content: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/pages/faq")
      .then(r => r.json())
      .then(d => { if (d?.content) setPage(d); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const title = page?.title || "Вопросы и ответы";
  const faqs = page?.content ? parseFAQ(page.content) : (loaded ? DEFAULT_FAQS : []);

  return (
    <Layout>
      <div className="py-12 sm:py-20">
        <div className="container px-4 max-w-3xl">
          <div className="mb-10 sm:mb-14">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Помощь</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="text-muted-foreground mt-3 max-w-xl">
              Всё, что нужно знать о сервисе. Не нашли ответ?{" "}
              <Link href="/support" className="text-foreground underline underline-offset-4 hover:text-accent transition-colors">
                Напишите нам
              </Link>
            </p>
          </div>

          {!loaded ? (
            <div className="bg-background rounded-2xl border border-border px-5 sm:px-8 py-8 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-5 bg-secondary rounded animate-pulse" style={{ width: `${60 + (i % 4) * 10}%` }} />
              ))}
            </div>
          ) : (
            <div className="bg-background rounded-2xl border border-border px-5 sm:px-8">
              {faqs.length > 0 ? (
                faqs.map((item) => (
                  <Item key={item.q} q={item.q} a={item.a} />
                ))
              ) : (
                <p className="py-8 text-sm text-muted-foreground text-center">Вопросы ещё не добавлены.</p>
              )}
            </div>
          )}

          <div className="mt-12 bg-secondary/40 rounded-2xl p-6 sm:p-8 text-center">
            <p className="font-semibold mb-1">Остались вопросы?</p>
            <p className="text-sm text-muted-foreground mb-4">Команда поддержки ответит в течение 24 часов</p>
            <Link href="/support">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors">
                Написать в поддержку
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
