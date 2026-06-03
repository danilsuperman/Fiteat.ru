import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useGetMe } from "@workspace/api-client-react";
import { LayoutDashboard, LogOut, Menu, X, Activity, ClipboardList } from "lucide-react";

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const { data: user } = useGetMe({ query: { enabled: isAuthenticated } });
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container px-4 flex h-16 items-center justify-between max-w-6xl">
        <Link href="/" className="flex items-center" onClick={closeMenu}>
          <img src="/logo.png" alt="ФИТИТ" className="h-7 w-auto" />
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-sm font-medium ${location.startsWith("/dashboard") ? "bg-secondary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Панель
                </Button>
              </Link>
              <Link href="/result">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-sm font-medium ${location === "/result" ? "bg-secondary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Метаболизм
                </Button>
              </Link>
              <div className="flex items-center gap-2 border-l border-border pl-3 ml-2">
                <span className="text-sm text-muted-foreground">{user?.name}</span>
                <Button variant="ghost" size="icon" onClick={logout} title="Выйти" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Войти
                </Button>
              </Link>
              <Link href="/survey/metabolism">
                <Button size="sm" className="text-sm font-medium rounded-full px-5">
                  Начать бесплатно
                </Button>
              </Link>
            </>
          )}
        </nav>

        <button
          className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-secondary transition-colors text-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-border bg-background">
          <div className="container px-4 py-3 space-y-1 max-w-6xl">
            {isAuthenticated ? (
              <>
                {user?.name && (
                  <div className="px-3 py-2 text-sm text-muted-foreground font-medium border-b border-border mb-2 pb-3">
                    {user.name}
                  </div>
                )}
                <Link href="/dashboard" onClick={closeMenu}>
                  <button className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-secondary ${location.startsWith("/dashboard") ? "bg-secondary" : ""}`}>
                    <LayoutDashboard className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Моя панель
                  </button>
                </Link>
                <Link href="/result" onClick={closeMenu}>
                  <button className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-secondary ${location === "/result" ? "bg-secondary" : ""}`}>
                    <Activity className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Мой метаболизм
                  </button>
                </Link>
                <Link href="/survey/metabolism" onClick={closeMenu}>
                  <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-secondary">
                    <ClipboardList className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Новый план
                  </button>
                </Link>
                <div className="border-t border-border mt-2 pt-2">
                  <button
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                    onClick={() => { logout(); closeMenu(); }}
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Выйти
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 py-2">
                <Link href="/login" onClick={closeMenu}>
                  <Button variant="outline" className="w-full h-12 text-base rounded-xl">Войти</Button>
                </Link>
                <Link href="/survey/metabolism" onClick={closeMenu}>
                  <Button className="w-full h-12 text-base rounded-xl">Начать бесплатно</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
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
      <footer className="py-8 border-t border-border/60">
        <div className="container px-4 max-w-6xl text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ФИТИТ — персональный цифровой нутрициолог</p>
        </div>
      </footer>
    </div>
  );
}
