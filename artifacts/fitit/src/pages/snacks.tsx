import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Apple } from "lucide-react";

const ALL_TAGS = ["белок", "углеводы", "жиры", "клетчатка", "орехи", "молочное", "фрукты", "овощи", "кето", "веган", "быстро", "перед тренировкой"];

interface Snack {
  id: number;
  name: string;
  description: string;
  calories: number;
  proteins: string;
  fats: string;
  carbs: string;
  photo_url?: string;
  tags: string[];
}

export default function SnacksPage() {
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const url = activeTag ? `/api/snacks/all?tag=${encodeURIComponent(activeTag)}` : "/api/snacks/all";
    fetch(url).then(r => r.json()).then(setSnacks).catch(() => {}).finally(() => setLoading(false));
  }, [activeTag]);

  return (
    <Layout>
      <div className="container px-4 py-8 sm:py-12 max-w-5xl">
        <div className="mb-8 sm:mb-10">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Питание</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Полезные перекусы</h1>
          <p className="text-muted-foreground">Идеи для лёгкого и питательного перекуса между основными приёмами пищи</p>
        </div>

        {/* Tags filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActiveTag(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${!activeTag ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/40"}`}>
            Все
          </button>
          {ALL_TAGS.map(tag => (
            <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${activeTag === tag ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/40"}`}>
              {tag}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-52 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : snacks.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Apple className="h-12 w-12 mx-auto mb-3 text-border" />
            <p>Перекусы по этому тегу не найдены</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {snacks.map(s => (
              <div key={s.id} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                {s.photo_url ? (
                  <img src={s.photo_url} alt={s.name} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-24 bg-secondary/50 flex items-center justify-center">
                    <Apple className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
                <div className="p-4 flex flex-col gap-2.5 flex-1">
                  <div>
                    <h3 className="font-semibold leading-tight">{s.name}</h3>
                    {s.description && (
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
                    )}
                  </div>
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-base">{s.calories} ккал</span>
                      <span className="text-xs text-muted-foreground">
                        Б {parseFloat(s.proteins)}г · Ж {parseFloat(s.fats)}г · У {parseFloat(s.carbs)}г
                      </span>
                    </div>
                    {s.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {s.tags.map(tag => (
                          <button key={tag} onClick={() => setActiveTag(tag)}
                            className="text-xs px-2 py-0.5 bg-secondary rounded-full hover:bg-secondary/80 transition-colors">
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
