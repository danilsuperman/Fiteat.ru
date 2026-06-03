import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useListPlans, useGetMe } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronRight, Activity, Plus } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  
  const { data: user } = useGetMe({
    query: { enabled: isAuthenticated }
  });

  const { data: plans, isLoading } = useListPlans({
    query: { enabled: isAuthenticated }
  });

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Для доступа в панель необходимо войти</h2>
          <Link href="/login">
            <Button>Войти</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const activePlan = plans?.find(p => p.status === 'active');
  const pastPlans = plans?.filter(p => p.status !== 'active') || [];

  return (
    <Layout>
      <div className="container py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Здравствуйте, {user?.name}</h1>
            <p className="text-muted-foreground mt-1">Ваша персональная панель метаболического контроля</p>
          </div>
          <Link href="/results">
            <Button variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Мой метаболизм
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[100px] w-full" />
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4">Текущий план</h2>
              {activePlan ? (
                <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative">
                  <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                    <Activity className="h-64 w-64 -mt-12 -mr-12" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-2xl">Активный план питания</CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                      с {format(new Date(activePlan.startDate), "d MMMM yyyy", { locale: ru })} по {format(new Date(activePlan.endDate), "d MMMM yyyy", { locale: ru })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/plan/${activePlan.id}`}>
                      <Button variant="secondary" size="lg" className="w-full sm:w-auto font-medium">
                        Открыть меню на сегодня
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Calendar className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">У вас нет активного плана</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                      Пройдите короткий опрос и получите персональное меню, настроенное на ваш метаболизм.
                    </p>
                    <Link href="/survey">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Создать план
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </section>

            {pastPlans.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4">История планов</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pastPlans.map(plan => (
                    <Card key={plan.id} className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex justify-between items-center">
                          План {plan.id}
                          <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded-full border">
                            {plan.status === 'expired' ? 'Завершен' : 'Отменен'}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {format(new Date(plan.startDate), "dd.MM.yy")} - {format(new Date(plan.endDate), "dd.MM.yy")}
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
              </section>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
