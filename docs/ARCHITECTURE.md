# ARCHITECTURE.md
# Architecture & Technical Design Document

This document outlines the architectural layers, caching patterns, directory mapping, and security boundaries of the FootCare application.

---

## 1. Application Layers & Route Directory Map

We use Next.js App Router. The application is divided into three key boundaries:
1. **Public Customer Area:** Lightweight Server Components optimized for SEO, speed, and mobile responsiveness.
2. **Secure Admin Portal:** Client-heavy dashboards, data tables, form validations, and status dashboards.
3. **Modular API Route Handlers:** Secure backend endpoints containing validation and Prisma client queries.

### Directory Mapping
```
src/
├── app/
│   ├── (public)/                 # Route group for customer catalogue pages
│   │   ├── page.tsx              # Homepage
│   │   ├── products/
│   │   │   ├── page.tsx          # Product catalogue listing
│   │   │   └── [slug]/page.tsx   # Product detail page
│   │   ├── brands/
│   │   │   └── [slug]/page.tsx   # Brand page
│   │   ├── showrooms/
│   │   │   └── [slug]/page.tsx   # Showroom details page
│   │   ├── offers/page.tsx       # Promotion listing
│   │   ├── contact/page.tsx      # Contact details
│   │   └── about/page.tsx        # About FootCare
│   ├── (admin)/                  # Route group for administration
│   │   ├── admin/
│   │   │   ├── login/page.tsx    # Admin credentials entry
│   │   │   ├── dashboard/page.tsx# Analytics summaries
│   │   │   ├── products/page.tsx # Manual Product CRUD UI
│   │   │   ├── import/page.tsx   # Excel + ZIP file uploader
│   │   │   └── promotions/page.tsx# Banner campaigns scheduler
│   └── api/                      # App Router Route Handlers (REST endpoints)
│       ├── auth/                 # Login & Session endpoints
│       ├── products/             # Catalogue queries & CRUD operations
│       ├── brands/               # Brands data fetch
│       ├── showrooms/            # Showrooms locator list
│       ├── offers/               # Promotional campaigns fetching
│       └── import/               # Excel file processing & ZIP media unzip
```

---

## 2. Caching Patterns & Rendering Strategy

| Path | Rendering Type | Cache Lifetime (Revalidation) | Rationale |
| :--- | :--- | :--- | :--- |
| **`/` (Homepage)** | ISR (Incremental Static Regeneration) | 3600s (1 hour) | Contains static cards, brand icons, and active banners. Rebuilds on background intervals. |
| **`/products`** | Client-Side Hydration (with SSR shell) | Dynamic | Filters, search queries, and sorting run via URL parameters, requiring interactive client fetching. |
| **`/products/[slug]`** | ISR (Incremental Static Regeneration) | 1800s (30 mins) | Fast loading is vital. Binds structured Product JSON-LD statically. On-demand revalidation runs post-imports. |
| **`/brands/[slug]`** | ISR | 86400s (24 hours) | Brand descriptions and logos change rarely. |
| **`/showrooms/[slug]`** | ISR | 86400s (24 hours) | Addresses, map locations, and phone numbers are static. |
| **`/admin/*`** | Client SSR (Private Layout) | Disabled | Admin dashboards require live data and session auth. |

---

## 3. Security Boundaries & Authentication

* **Session Validation:** Admin routes use JSON Web Tokens (JWT) stored in a secure, `HttpOnly`, `SameSite=Strict` cookie.
* **Server-Side Authorization:** Every Route Handler under `/api/admin/*` and Page under `(admin)/admin/*` runs session checks before processing requests or rendering contents.
* **Input Sanitization:** All user inputs (especially search terms and admin forms) are validated using strict Zod schemas before being injected into database queries to prevent SQL Injection and XSS attacks.
* **Prisma Safety:** Parameterized queries are automatically handled by Prisma client, mitigating direct SQL injection risks.
