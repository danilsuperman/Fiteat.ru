import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useGetMe } from "@workspace/api-client-react";
import { Dumbbell, LayoutDashboard, LogOut } from "lucide-react";

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const { data: user } = useGetMe({ query: { enabled: isAuthenticated } });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">ФИТИТ</span>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className={location.startsWith("/dashboard") ? "bg-secondary" : ""}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Панель
                </Button>
              </Link>
              <div className="flex items-center gap-2 border-l pl-3 ml-1">
                <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>
                <Button variant="ghost" size="icon" onClick={logout} title="Выйти">
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Войти</Button>
              </Link>
              <Link href="/survey/metabolism">
                <Button>Начать бесплатно</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="py-8 border-t bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ФИТИТ. Научный подход к питанию.</p>
        </div>
      </footer>
    </div>
  );
}
