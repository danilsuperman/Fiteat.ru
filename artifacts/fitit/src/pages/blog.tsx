import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { ArrowRight, ImageIcon } from "lucide-react";

const STATIC_POSTS = [
  { slug: "bmr-tdee-explained", category: "Наука", date: "28 мая 2026", title: "BMR и TDEE: что это такое и почему они важны для похудения", excerpt: "Базовый метаболизм (BMR) — это количество калорий, которое организм сжигает в состоянии покоя. Понимание этих цифр — ключ к эффективному управлению весом.", readTime: "5 мин", image_url: null },
  { slug: "protein-for-weight-loss", category: "Питание", date: "20 мая 2026", title: "Почему белок — главный нутриент для снижения веса", excerpt: "Высокобелковая диета помогает сохранить мышечную массу при дефиците калорий, снижает аппетит и ускоряет восстановление после тренировок.", readTime: "7 мин", image_url: null },
  { slug: "hormones-and-weight", category: "Гормоны", date: "12 мая 2026", title: "Как гормоны влияют на вес: инсулин, кортизол, лептин", excerpt: "Гормональный фон — один из главных факторов, который определяет скорость обмена веществ и лёгкость снижения веса. Разбираем основные гормоны и их роль.", readTime: "10 мин", image_url: null },
  { slug: "meal-timing", category: "Рацион", date: "5 мая 2026", title: "Режим питания: важно ли когда есть, а не только что?", excerpt: "Исследования показывают, что время приёма пищи влияет на циркадные ритмы и метаболизм. Но насколько это важно по сравнению с общим балансом калорий?", readTime: "6 мин", image_url: null },
  { slug: "water-and-metabolism", category: "Лайфхаки", date: "28 апреля 2026", title: "Вода и метаболизм: сколько пить и когда", excerpt: "Гидратация влияет на скорость метаболизма, аппетит и уровень энергии. Рассказываем, как правильно выстроить питьевой режим.", readTime: "4 мин", image_url: null },
  { slug: "sleep-weight-loss", category: "Образ жизни", date: "21 апреля 2026", title: "Сон и снижение веса: почему 8 часов важнее диеты", excerpt: "Недосыпание повышает уровень кортизола и грелина, вызывает тягу к сладкому и снижает эффективность тренировок. Качественный сон — основа трансформации.", readTime: "8 мин", image_url: null },
];

const CATEGORIES = ["Все", "Наука", "Питание", "Гормоны", "Рацион", "Лайфхаки", "Образ жизни"];

function fmtDate(s: string) {
  try { return new Date(s).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return s; }
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [posts, setPosts] = useState<any[]>(STATIC_POSTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/articles")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.length > 0) {
          const apiPosts = data.map((a: any) => ({
            slug: a.slug,
            category: a.category,
            date: a.published_at ? fmtDate(a.published_at) : "",
            title: a.title,
            excerpt: a.excerpt,
            readTime: a.read_time,
            image_url: a.image_url || null,
          }));
          setPosts(apiPosts);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const filtered = activeCategory === "Все" ? posts : posts.filter(p => p.category === activeCategory);

  return (
    <Layout>
      <div className="py-12 sm:py-16">
        <div className="container px-4 max-w-6xl">
          <div className="mb-10 sm:mb-14">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">Блог</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Научный подход к питанию
            </h1>
            <p className="text-muted-foreground mt-3 max-w-xl">
              Доказательные материалы о метаболизме, нутрициологии и здоровом образе жизни.
            </p>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="group border border-border rounded-2xl overflow-hidden hover:border-foreground/20 transition-colors flex flex-col h-full cursor-pointer bg-background">
                  {post.image_url ? (
                    <div className="w-full h-44 overflow-hidden bg-secondary shrink-0">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-secondary to-secondary/40 flex items-center justify-center shrink-0">
                      <ImageIcon className="h-8 w-8 text-border" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider bg-secondary px-2.5 py-1 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    </div>
                    <h2 className="text-sm font-semibold text-foreground mb-2 leading-snug group-hover:text-accent transition-colors flex-1">
                      {post.title}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                      <span className="text-xs font-medium text-foreground flex items-center gap-1 group-hover:text-accent transition-colors">
                        Читать <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

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
