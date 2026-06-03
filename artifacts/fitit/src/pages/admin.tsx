import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Admin() {
  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="container px-4 max-w-sm text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-6">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Административная панель</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Раздел находится в разработке. Доступ будет открыт для администраторов системы.
          </p>
          <Link href="/">
            <Button variant="outline" className="rounded-xl">На главную</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
