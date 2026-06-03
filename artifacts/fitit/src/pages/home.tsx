import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, Brain, Target, ShieldCheck } from "lucide-react";
import { Layout } from "@/components/layout";

export default function Home() {
  return (
    <Layout>
      <section className="py-20 lg:py-32 bg-primary/5">
        <div className="container">
          <div className="max-w-[800px] mx-auto text-center space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              Научный подход к метаболизму
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground">
              Питание, настроенное на <span className="text-primary">вашу генетику</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-[600px] mx-auto">
              ФИТИТ — это не диета. Это алгоритм метаболической оптимизации, создающий индивидуальный план на основе 30+ биомаркеров и привычек.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/survey">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full">
                  Пройти опрос бесплатно
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Клиническая точность</h3>
              <p className="text-muted-foreground">Рассчитываем BMR и TDEE с учетом гормонального фона и стресса.</p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Умные замены</h3>
              <p className="text-muted-foreground">Не любите брокколи? Алгоритм заменит ингредиент без потери макронутриентов.</p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Предсказуемый результат</h3>
              <p className="text-muted-foreground">Точно знаем, сколько месяцев потребуется для достижения вашей цели.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
