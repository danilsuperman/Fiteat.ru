import { useState } from "react";
import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const POSTS = [
  {
    slug: "bmr-tdee-explained",
    category: "Наука",
    date: "28 мая 2026",
    title: "BMR и TDEE: что это такое и почему они важны для похудения",
    excerpt: "Базовый метаболизм (BMR) — это количество калорий, которое организм сжигает в состоянии покоя. Понимание этих цифр — ключ к эффективному управлению весом.",
    readTime: "5 мин",
  },
  {
    slug: "protein-for-weight-loss",
    category: "Питание",
    date: "20 мая 2026",
    title: "Почему белок — главный нутриент для снижения веса",
    excerpt: "Высокобелковая диета помогает сохранить мышечную массу при дефиците калорий, снижает аппетит и ускоряет восстановление после тренировок.",
    readTime: "7 мин",
  },
  {
    slug: "hormones-and-weight",
    category: "Гормоны",
    date: "12 мая 2026",
    title: "Как гормоны влияют на вес: инсулин, кортизол, лептин",
    excerpt: "Гормональный фон — один из главных факторов, который определяет скорость обмена веществ и лёгкость снижения веса. Разбираем основные гормоны и их роль.",
    readTime: "10 мин",
  },
  {
    slug: "meal-timing",
    category: "Рацион",
    date: "5 мая 2026",
    title: "Режим питания: важно ли когда есть, а не только что?",
    excerpt: "Исследования показывают, что время приёма пищи влияет на циркадные ритмы и метаболизм. Но насколько это важно по сравнению с общим балансом калорий?",
    readTime: "6 мин",
  },
  {
    slug: "water-and-metabolism",
    category: "Лайфхаки",
    date: "28 апреля 2026",
    title: "Вода и метаболизм: сколько пить и когда",
    excerpt: "Гидратация влияет на скорость метаболизма, аппетит и уровень энергии. Рассказываем, как правильно выстроить питьевой режим.",
    readTime: "4 мин",
  },
  {
    slug: "sleep-weight-loss",
    category: "Образ жизни",
    date: "21 апреля 2026",
    title: "Сон и снижение веса: почему 8 часов важнее диеты",
    excerpt: "Недосыпание повышает уровень кортизола и грелина, вызывает тягу к сладкому и снижает эффективность тренировок. Качественный сон — основа трансформации.",
    readTime: "8 мин",
  },
];

const CATEGORIES = ["Все", "Наука", "Питание", "Гормоны", "Рацион", "Лайфхаки", "Образ жизни"];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("Все");
  const filtered = activeCategory === "Все" ? POSTS : POSTS.filter(p => p.category === activeCategory);

  return (
    <Layout>
      <div className="py-12 sm:py-16">
        <div className="container px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-10 sm:mb-14">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">Блог</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Научный подход к питанию
            </h1>
            <p className="text-muted-foreground mt-3 max-w-xl">
              Доказательные материалы о метаболизме, нутрициологии и здоровом образе жизни.
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  activeCategory === cat
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="group border border-border rounded-2xl p-6 hover:border-foreground/20 transition-colors flex flex-col h-full cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider bg-secondary px-2.5 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <h2 className="text-base font-semibold text-foreground mb-3 leading-snug group-hover:text-accent transition-colors flex-1">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                    <span className="text-xs font-medium text-foreground flex items-center gap-1 group-hover:text-accent transition-colors">
                      Читать <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 text-center border-t border-border pt-12">
            <p className="text-muted-foreground mb-4">Готовы начать свой путь к цели?</p>
            <Link href="/calculator">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors">
                Рассчитать метаболизм бесплатно
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
