import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useGetMe } from "@workspace/api-client-react";
import { Dumbbell, LayoutDashboard, LogOut, Menu, X, Activity, ClipboardList } from "lucide-react";

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const { data: user } = useGetMe({ query: { enabled: isAuthenticated } });
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2" onClick={closeMenu}>
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">ФИТИТ</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className={location.startsWith("/dashboard") ? "bg-secondary" : ""}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Панель
                </Button>
              </Link>
              <div className="flex items-center gap-2 border-l pl-3 ml-1">
                <span className="text-sm text-muted-foreground">{user?.name}</span>
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

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex items-center justify-center w-11 h-11 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-t bg-background shadow-xl">
          <div className="container py-3 space-y-1">
            {isAuthenticated ? (
              <>
                {user?.name && (
                  <div className="px-3 py-2 text-sm text-muted-foreground font-medium border-b mb-2 pb-3">
                    {user.name}
                  </div>
                )}
                <Link href="/dashboard" onClick={closeMenu}>
                  <button className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${location.startsWith("/dashboard") ? "bg-secondary text-secondary-foreground" : ""}`}>
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    Моя панель
                  </button>
                </Link>
                <Link href="/result" onClick={closeMenu}>
                  <button className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted ${location === "/result" ? "bg-secondary text-secondary-foreground" : ""}`}>
                    <Activity className="h-4 w-4 shrink-0" />
                    Мой метаболизм
                  </button>
                </Link>
                <Link href="/survey/metabolism" onClick={closeMenu}>
                  <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted">
                    <ClipboardList className="h-4 w-4 shrink-0" />
                    Новый план
                  </button>
                </Link>
                <div className="border-t mt-2 pt-2">
                  <button
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
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
                  <Button variant="outline" className="w-full h-12 text-base">Войти</Button>
                </Link>
                <Link href="/survey/metabolism" onClick={closeMenu}>
                  <Button className="w-full h-12 text-base">Начать бесплатно</Button>
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
      <footer className="py-6 sm:py-8 border-t bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ФИТИТ. Научный подход к питанию.</p>
        </div>
      </footer>
    </div>
  );
}
