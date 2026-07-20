"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Percent, Phone } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Brands", href: "/brands" },
    { name: "Showrooms", href: "/showrooms" },
  ];

  return (
    <header className="sticky top-0 z-sticky hidden w-full border-b border-border bg-background/80 backdrop-blur-md md:block">
      <div className="container-custom flex h-16 items-center justify-between">
        {/* Logo */}
        {/*<Link href="/" className="text-xl font-bold tracking-tight text-primary">
          Foot<span className="text-accent">Care</span>
        </Link>*/}
        <a href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="FootCare"
            width={300}
            height={160}
            priority
            className="h-30 w-auto"
          />
        </a>
        {/* Navigation Links */}
        <nav className="flex items-center gap-space-8">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-body select-none font-medium transition-colors hover:text-accent ${isActive ? "text-accent font-semibold" : "text-foreground/80"
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-space-4">
          <Link
            href="/products?search=true"
            className="rounded-full p-space-2 text-foreground/80 hover:bg-secondary hover:text-accent transition-colors"
            aria-label="Search Catalog"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/offers"
            className="rounded-full p-space-2 text-foreground/80 hover:bg-secondary hover:text-accent transition-colors"
            aria-label="Promotions"
          >
            <Percent className="h-5 w-5" />
          </Link>
          <Link
            href="/contact"
            className="rounded-full p-space-2 text-foreground/80 hover:bg-secondary hover:text-accent transition-colors"
            aria-label="Contact Us"
          >
            <Phone className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
