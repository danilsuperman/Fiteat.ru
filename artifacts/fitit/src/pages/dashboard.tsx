import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useListPlans, useGetMe } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronRight, Activity, Plus, Scale, Trash2, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ProgressEntry {
  id: number;
  date: string;
  weight?: number | null;
  waistCm?: number | null;
  neckCm?: number | null;
  chestCm?: number | null;
  hipsCm?: number | null;
  notes?: string | null;
}

async function apiFetch(path: string, opts?: RequestInit) {
  const token = localStorage.getItem("fitit_token");
  const res = await fetch(path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function ProgressTab({ isAuthenticated }: { isAuthenticated: boolean }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], weight: "", waistCm: "", notes: "" });

  const { data: entries = [], isLoading } = useQuery<ProgressEntry[]>({
    queryKey: ["progress"],
    queryFn: () => apiFetch("/api/progress"),
    enabled: isAuthenticated,
  });

  const addMutation = useMutation({
    mutationFn: (body: object) => apiFetch("/api/progress", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["progress"] });
      setForm({ date: new Date().toISOString().split("T")[0], weight: "", waistCm: "", notes: "" });
      toast({ title: "Сохранено", description: "Запись прогресса добавлена." });
    },
    onError: () => toast({ title: "Ошибка", description: "Не удалось сохранить запись.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/progress/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["progress"] }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.weight && !form.waistCm) {
      toast({ title: "Укажите хотя бы один параметр", variant: "destructive" });
      return;
    }
    addMutation.mutate({
      date: form.date,
      weight: form.weight ? Number(form.weight) : undefined,
      waistCm: form.waistCm ? Number(form.waistCm) : undefined,
      notes: form.notes || undefined,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Новая запись
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Дата</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Вес (кг)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Талия (см)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="80"
                  value={form.waistCm}
                  onChange={(e) => setForm({ ...form, waistCm: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Комментарий</label>
              <input
                type="text"
                placeholder="Самочувствие, особенности дня..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? "Сохранение..." : "Добавить запись"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-primary" />
          История измерений
        </h3>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
            <Scale className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Записей пока нет. Добавьте первое измерение выше.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-muted-foreground w-24">
                    {format(new Date(entry.date), "d MMM yyyy", { locale: ru })}
                  </div>
                  <div className="flex gap-4 text-sm">
                    {entry.weight && <span className="font-semibold">{entry.weight} кг</span>}
                    {entry.waistCm && <span className="text-muted-foreground">Талия: {entry.waistCm} см</span>}
                    {entry.notes && <span className="text-muted-foreground italic truncate max-w-[200px]">{entry.notes}</span>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(entry.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isAuthenticated } = useAuth();

  const { data: user } = useGetMe({ query: { enabled: isAuthenticated } });
  const { data: plans, isLoading } = useListPlans({ query: { enabled: isAuthenticated } });

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-24 text-center space-y-4">
          <h2 className="text-2xl font-bold">Для доступа в панель необходимо войти</h2>
          <Link href="/login"><Button>Войти</Button></Link>
        </div>
      </Layout>
    );
  }

  const activePlan = plans?.find((p) => p.status === "active");
  const pastPlans = plans?.filter((p) => p.status !== "active") || [];

  return (
    <Layout>
      <div className="container py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Здравствуйте, {user?.name} 👋</h1>
            <p className="text-muted-foreground mt-1">Ваша персональная панель метаболического контроля</p>
          </div>
          <Link href="/result">
            <Button variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Мой метаболизм
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="plan" className="space-y-6">
          <TabsList className="h-11">
            <TabsTrigger value="plan">Мой рацион</TabsTrigger>
            <TabsTrigger value="progress">Прогресс</TabsTrigger>
            <TabsTrigger value="history">История планов</TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="mt-0">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : activePlan ? (
              <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                  <Activity className="h-64 w-64 -mt-12 -mr-12" />
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Активный план питания</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    {format(new Date(activePlan.startDate), "d MMMM yyyy", { locale: ru })} —{" "}
                    {format(new Date(activePlan.endDate), "d MMMM yyyy", { locale: ru })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Link href={`/plan/${activePlan.id}`}>
                    <Button variant="secondary" size="lg">
                      Открыть меню на сегодня
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/plan/${activePlan.id}?tab=shopping`}>
                    <Button variant="secondary" size="lg">
                      Список покупок
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">У вас нет активного плана</h3>
                  <p className="text-muted-foreground max-w-sm mb-6">
                    Пройдите опрос и получите персональное меню, созданное под ваш метаболизм.
                  </p>
                  <Link href="/survey/metabolism">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Создать план
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="mt-0">
            <ProgressTab isAuthenticated={isAuthenticated} />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            {isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : pastPlans.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>История планов пуста.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastPlans.map((plan) => (
                  <Card key={plan.id} className="bg-muted/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex justify-between items-center">
                        План #{plan.id}
                        <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded-full border">
                          {plan.status === "expired" ? "Завершён" : "Отменён"}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {format(new Date(plan.startDate), "dd.MM.yy")} – {format(new Date(plan.endDate), "dd.MM.yy")}
                      </p>
                      <Link href={`/plan/${plan.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Посмотреть архив
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
