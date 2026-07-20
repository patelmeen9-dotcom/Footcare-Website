"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Percent, FileDown, LogOut, Loader2, Menu, X } from "lucide-react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    const checkAuth = async () => {
      if (isLoginPage) {
        setCheckingAuth(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/verify");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setCheckingAuth(false);
          } else {
            router.push("/admin/login");
          }
        } else {
          router.push("/admin/login");
        }
      } catch (err) {
        console.error("Layout auth check failed:", err);
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products CRUD", href: "/admin/products", icon: ShoppingBag },
    { name: "Promotions", href: "/admin/promotions", icon: Percent },
    { name: "Inventory Import", href: "/admin/import", icon: FileDown },
  ];

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground/60 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-caption font-semibold">Verifying Session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile Top Header */}
      <header className="flex md:hidden items-center justify-between border-b border-border bg-card px-4 h-16 w-full sticky top-0 z-sticky">
        <span className="font-bold tracking-tight text-primary">
          Foot<span className="text-accent">Care</span> Admin
        </span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? "flex" : "hidden"
        } md:flex flex-col w-full md:w-64 border-r border-border bg-card text-card-foreground p-space-6 shrink-0 z-drawer md:z-base fixed md:sticky top-16 md:top-0 h-[calc(100vh-64px)] md:h-screen justify-between`}
      >
        <div className="flex flex-col gap-space-8">
          {/* Logo */}
          <Link href="/admin/dashboard" className="hidden md:block text-xl font-bold tracking-tight text-primary">
            Foot<span className="text-accent">Care</span> Admin
          </Link>

          {/* Links list */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-space-4 py-space-3 rounded-button text-caption font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-soft-sm"
                      : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-space-4 py-space-3 rounded-button text-caption font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer border-t border-border pt-4"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Logout
        </button>
      </aside>

      {/* Main Admin Portal panel */}
      <main className="flex-1 w-full p-space-6 md:p-space-8 md:overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
