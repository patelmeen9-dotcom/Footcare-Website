import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-primary text-primary-foreground border-t border-border mt-auto pb-20 md:pb-0">
      <div className="container-custom py-space-12 grid grid-cols-1 gap-space-8 md:grid-cols-3">
        {/* FootCare Identity */}
        <div className="flex flex-col gap-space-3">
          <h2 className="text-xl font-bold tracking-tight">
            Foot<span className="text-accent">Care</span>
          </h2>
          <p className="text-caption text-primary-foreground/75 max-w-xs leading-relaxed">
            Discover original, premium international brands across our three digital catalogs and physical showrooms in Bhuj, Gujarat.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-space-3">
          <h3 className="text-body font-semibold tracking-wide uppercase text-accent">
            Quick Links
          </h3>
          <ul className="flex flex-col gap-space-2 text-caption text-primary-foreground/80">
            <li>
              <Link href="/products" className="hover:text-accent transition-colors">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/brands" className="hover:text-accent transition-colors">
                Shop By Brand
              </Link>
            </li>
            <li>
              <Link href="/showrooms" className="hover:text-accent transition-colors">
                Our Showrooms
              </Link>
            </li>
            <li>
              <Link href="/offers" className="hover:text-accent transition-colors">
                Special Offers
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-space-3">
          <h3 className="text-body font-semibold tracking-wide uppercase text-accent">
            Our Showrooms
          </h3>
          <ul className="flex flex-col gap-space-2 text-caption text-primary-foreground/80">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              <span>College Road, Bhuj, Gujarat</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-accent" />
              <span>+91 98794 59303</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent" />
              <span>footcarebhuj@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Admin and Legal bar */}
      <div className="border-t border-primary-foreground/10 bg-primary/90">
        <div className="container-custom py-space-4 flex flex-col items-center justify-between gap-space-3 text-label-small text-primary-foreground/50 md:flex-row">
          <span>
            © {new Date().getFullYear()} FootCare. All rights reserved.
          </span>
          <div className="flex items-center gap-space-4">
            <Link href="/privacy" className="hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/admin/login" className="hover:text-accent transition-colors font-medium">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
