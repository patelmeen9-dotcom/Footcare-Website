"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Tag, MapPin, Menu } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Products", href: "/products", icon: Grid },
    { name: "Brands", href: "/brands", icon: Tag },
    { name: "Showrooms", href: "/showrooms", icon: MapPin },
    { name: "Menu", href: "/contact", icon: Menu }, // menu links to contact/menu page for now
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-sticky border-t border-border bg-background/90 backdrop-blur-md md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors hover:text-accent ${
                isActive ? "text-accent" : "text-foreground/60"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium tracking-wide uppercase">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
