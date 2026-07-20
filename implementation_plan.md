# Implementation Plan - Phase 0: Project Foundation & Enterprise Setup

This implementation plan presents the proposed directory layout, database schema, documentation plan, and design tokens for the FootCare digital catalogue. 

No code will be generated until you review and approve these specifications.

---

## 1. Proposed Folder Structure
We will use a modular directory structure under a unified `src/` directory in Next.js (App Router). This aligns with enterprise scaling, makes the codebase future-ready for e-commerce expansion, and cleanly groups UI, layout, common, and feature files.

```
e:\Website_Foot_care_Anti_gravity\
├── docs/                      # Single Source of Truth & newly created documentation files
│   ├── PRD.md                 # (Existing)
│   ├── AI_AGENT.md            # (Existing)
│   ├── UI_RULES.md            # (Existing)
│   ├── CODING_STANDARDS.md    # (Existing)
│   ├── TASKS.md               # (Existing)
│   ├── PROJECT_AUDIT.md       # [NEW] Audit of requirements, risks, SEO & accessibility
│   ├── ROADMAP.md             # [NEW] Phase timelines, complexity, milestones
│   ├── ARCHITECTURE.md        # [NEW] Application layers, state, scaling plan
│   ├── DATABASE.md            # [NEW] Database ER details & normalization strategy
│   ├── API_CONTRACT.md        # [NEW] Request/Response schema for Route Handlers
│   ├── COMPONENT_INVENTORY.md  # [NEW] Reusable component declarations & properties
│   ├── DECISIONS.md           # [NEW] Documented architectural trade-offs & decisions
│   ├── FOLDER_STRUCTURE.md    # [NEW] Purpose of directories
│   └── DEPENDENCIES.md        # [NEW] Explicit rationales for npm packages
├── prisma/                    # Prisma DB setup
│   └── schema.prisma          # Database schema containing production-ready models
├── public/                    # Static assets (logos, icons, default images)
└── src/
    ├── app/                   # Next.js Pages & API Route Handlers
    │   ├── layout.tsx         # Root layout configuring fonts & providers
    │   ├── page.tsx           # Page landing (empty/stub until Phase 1)
    │   ├── api/               # Next.js App Router Route Handlers (modular backend)
    │   │   ├── auth/          # Login/Session routes
    │   │   ├── products/      # Product catalogue endpoints
    │   │   ├── brands/        # Brand catalogue endpoints
    │   │   ├── showrooms/     # Showroom locator endpoints
    │   │   ├── offers/        # Promotion management endpoints
    │   │   └── import/        # Excel + ZIP Import endpoints
    │   ├── (public)/          # Route group for customer catalogue pages
    │   └── (admin)/           # Route group for admin portal pages
    ├── components/            # Three-tier component layout
    │   ├── ui/                # Base UI primitive components (Radix / custom styled)
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── dialog.tsx
    │   │   ├── accordion.tsx
    │   │   ├── tooltip.tsx
    │   │   └── dropdown-menu.tsx
    │   ├── common/            # Shared, feature-agnostic presentation components
    │   │   ├── product-card.tsx
    │   │   ├── brand-card.tsx
    │   │   ├── showroom-card.tsx
    │   │   ├── offer-banner.tsx
    │   │   ├── search-bar.tsx
    │   │   ├── skeleton-loader.tsx
    │   │   ├── empty-state.tsx
    │   │   ├── loading-spinner.tsx
    │   │   └── error-display.tsx
    │   └── layout/            # Layout structure and wrapping containers
    │       ├── navbar.tsx         # Desktop sticky top nav
    │       ├── bottom-nav.tsx     # Mobile sticky bottom nav
    │       ├── footer.tsx         # Universal footer
    │       ├── drawer.tsx         # Hamburger menu wrapper
    │       ├── page-container.tsx # Consistent content bounds wrapper
    │       └── responsive-grid.tsx# Standard grid layout wrapper
    ├── features/              # Feature-specific state, queries, forms, and custom hooks
    │   ├── auth/              # Admin login forms, auth hooks
    │   ├── catalogue/         # Product grids, sorting, filtering hooks
    │   ├── showrooms/         # Store cards, interactive locator map logic
    │   ├── import/            # Import forms, drag-and-drop validation UI
    │   └── offers/            # Banner rotators, seasonal listing lists
    ├── hooks/                 # Global hooks (e.g. useMediaQuery, useLocalStorage)
    ├── services/              # Third-party & internal logic classes
    │   ├── cloudinary.ts      # Cloudinary upload and URL generation
    │   ├── excel-parser.ts    # XLSX parsing & validation service
    │   └── logger.ts          # Central audit logging wrapper
    ├── utils/                 # Pure utility helper functions (e.g. formatCurrency)
    ├── types/                 # Shared TypeScript models and interfaces
    ├── constants/             # Static configurations (menus, validation boundaries)
    ├── config/                # Environment configuration & Zod env validator
    ├── animations/            # Reusable Framer Motion animation configurations
    ├── providers/             # React Context Providers (Theme, QueryClient, Toast)
    ├── styles/                # Global styles, Tailwind directives, font injections
    ├── seo/                   # JSON-LD schemas, OpenGraph metadata builders
    └── lib/                   # Shared client initializers (db.ts for Prisma client)
```

---

## 2. Prisma Schema Overview (Production-Ready Models)
In compliance with your instruction, one product belongs to exactly one showroom. We model this via a direct relation between `Product` and `Showroom`. 

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String          @id @default(uuid()) @db.Uuid
  email        String          @unique
  passwordHash String
  name         String
  role         String          @default("SUPER_ADMIN") // SUPER_ADMIN, STORE_MANAGER
  active       Boolean         @default(true)
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  imports      ImportHistory[]
  auditLogs    AuditLog[]

  @@map("users")
}

model Showroom {
  id          String      @id @default(uuid()) @db.Uuid
  name        String
  slug        String      @unique
  address     String
  mapsUrl     String
  phone       String
  email       String
  openingTime String      // e.g. "09:00 AM"
  closingTime String      // e.g. "09:00 PM"
  heroImage   String
  description String
  active      Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  products    Product[]
  promotions  Promotion[] // Banners or offers targeted at this store

  @@map("showrooms")
}

model Brand {
  id              String      @id @default(uuid()) @db.Uuid
  name            String
  slug            String      @unique
  logo            String      // Cloudinary URL
  banner          String      // Cloudinary URL
  description     String
  metaTitle       String?
  metaDescription String?
  active          Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  products        Product[]
  promotions      Promotion[] // Brand-specific campaigns

  @@map("brands")
}

model Category {
  id          String    @id @default(uuid()) @db.Uuid
  name        String
  slug        String    @unique
  description String?
  image       String?
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  products    Product[]

  @@map("categories")
}

model Product {
  id              String         @id @default(uuid()) @db.Uuid
  articleNumber   String         @unique
  name            String
  slug            String         @unique
  brandId         String         @db.Uuid
  categoryId      String         @db.Uuid
  showroomId      String         @db.Uuid
  description     String         @db.Text
  material        String?
  careInstructions String?
  mrp             Decimal        @db.Decimal(10, 2)
  discount        Decimal        @default(0) @db.Decimal(5, 2) // Stored as percentage, e.g. 20.00 for 20%
  finalPrice      Decimal        @db.Decimal(10, 2)            // Redundant store for search optimization
  available       Boolean        @default(true)
  hotSelling      Boolean        @default(false)
  hotSellingBadge String?        // "TRENDING", "BEST_SELLER", "SELLING_FAST"
  featured        Boolean        @default(false)
  newArrival      Boolean        @default(false)
  seoTitle        String?
  seoDescription  String?
  status          String         @default("ACTIVE")            // "ACTIVE", "ARCHIVED", "DRAFT"
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  brand           Brand          @relation(fields: [brandId], references: [id])
  category        Category       @relation(fields: [categoryId], references: [id])
  showroom        Showroom       @relation(fields: [showroomId], references: [id])
  colors          ProductColor[]
  sizes           ProductSize[]
  images          ProductImage[]

  @@map("products")
}

model ProductColor {
  id           String         @id @default(uuid()) @db.Uuid
  productId    String         @db.Uuid
  name         String         // e.g. "White", "Black"
  displayOrder Int            @default(0)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  product      Product        @relation(fields: [productId], references: [id], onDelete: Cascade)
  images       ProductImage[]

  @@map("product_colors")
}

model ProductSize {
  id        String   @id @default(uuid()) @db.Uuid
  productId String   @db.Uuid
  value     String   // e.g. "UK 8", "L"
  stock     Int      @default(0) // Future-ready inventory counting
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_sizes")
}

model ProductImage {
  id           String       @id @default(uuid()) @db.Uuid
  productId    String       @db.Uuid
  colorId      String       @db.Uuid
  url          String       // Cloudinary URL
  displayOrder Int          @default(0)
  altText      String?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  product      Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  color        ProductColor @relation(fields: [colorId], references: [id], onDelete: Cascade)

  @@map("product_images")
}

model Promotion {
  id                 String    @id @default(uuid()) @db.Uuid
  name               String
  slug               String    @unique
  description        String?
  type               String    // "SHOWROOM", "BRAND", "GLOBAL"
  bannerImage        String    // Cloudinary URL
  showroomId         String?   @db.Uuid
  brandId            String?   @db.Uuid
  discountPercentage Decimal?  @db.Decimal(5, 2)
  startDate          DateTime
  endDate            DateTime
  status             String    @default("ACTIVE") // "ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"
  priority           Int       @default(0)
  active             Boolean   @default(true)
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  showroom           Showroom? @relation(fields: [showroomId], references: [id])
  brand              Brand?    @relation(fields: [brandId], references: [id])

  @@map("promotions")
}

model ImportHistory {
  id                   String    @id @default(uuid()) @db.Uuid
  zipFileName          String
  date                 DateTime  @default(now())
  userId               String    @db.Uuid
  status               String    // "SUCCESS", "FAILED", "UNDONE", "PENDING_APPROVAL"
  summaryCreated       Int       @default(0)
  summaryUpdated       Int       @default(0)
  summaryErrors        Int       @default(0)
  summarySkipped       Int       @default(0)
  durationMs           Int
  reportUrl            String?
  rollbackWindowExpiry DateTime?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  user                 User      @relation(fields: [userId], references: [id])

  @@map("import_history")
}

model AuditLog {
  id            String   @id @default(uuid()) @db.Uuid
  timestamp     DateTime @default(now())
  userId        String?  @db.Uuid
  userEmail     String?
  action        String   // e.g. "PRODUCT_CREATE", "PROMOTION_EXPIRE"
  entity        String   // e.g. "Product", "Promotion"
  entityId      String?
  previousValue Json?
  newValue      Json?
  ipAddress     String?
  status        String   // "SUCCESS", "FAILED"
  createdAt     DateTime @default(now())

  user          User?    @relation(fields: [userId], references: [id])

  @@map("audit_logs")
}
```

---

## 3. Documentation Structure
We will create a structured and cohesive documentation suite inside the `/docs` folder:

* **PROJECT_AUDIT.md:** Details technical risks, accessibility, SEO audits, open questions, and validation checks.
* **ROADMAP.md:** Phase schedules (Phase 0 Foundation, Phase 1 Public Site, Phase 2 catalogue, Phase 3 Admin Panel, Phase 4 Optimization & Launch), milestones, build sequences, and checkpoints.
* **ARCHITECTURE.md:** Detailed Next.js route structures, caching patterns (ISR/SSR/Client), service abstractions, security boundaries, and modular backend API blueprints.
* **DATABASE.md:** Full DB layout, ER relationships, indexes, indexing strategies for search, and migration path from Catalogue to E-Commerce (adding orders, lines, payment transactions, customers, baskets).
* **API_CONTRACT.md:** Formally defines inputs, outputs, error codes, and HTTP methods for all App Router Route Handlers (Auth, Products, Brands, Offers, Showrooms, Imports).
* **COMPONENT_INVENTORY.md:** Exhaustive specification of properties, visual variants, animations, and accessibility roles for the design system components.
* **DECISIONS.md:** Chronological ledger of architectural trade-offs (e.g. Next.js Route Handlers vs NestJS, keeping the 1-to-1 Product-Showroom relation, PostgreSQL selection, Tailwind CSS layout).
* **FOLDER_STRUCTURE.md:** High-level description of codebase structure and rules for file placement.
* **DEPENDENCIES.md:** Justifies every package in `package.json` to prevent bundle bloating.

---

## 4. Design Token Hierarchy
These design tokens will be implemented inside `tailwind.config.ts` and global styles to enforce the premium, Phenomenon Studio-inspired typography, spacing, and animations:

### Color Tokens
* `background`: `#ffffff` | Dark mode: `#121212` (deep charcoal)
* `foreground`: `#121212` | Dark mode: `#f5f5f7` (soft white)
* `card`: `#ffffff` | Dark mode: `#1e1e1e` (graphite black)
* `card-foreground`: `#121212` | Dark mode: `#f5f5f7`
* `border`: `#e5e7eb` | Dark mode: `#2a2a2a` (soft border gray)
* `primary`: `#121212` (Charcoal Black)
* `primary-foreground`: `#ffffff`
* `secondary`: `#f3f4f6` | Dark mode: `#2c2c2e`
* `secondary-foreground`: `#121212` | Dark mode: `#f5f5f7`
* `accent` (Electric Blue): `#0052ff` | Hover: `#0040d0`
* `accent-foreground`: `#ffffff`
* `success` (Emerald): `#10b981` | Background: `#ecfdf5`
* `warning` (Amber): `#f59e0b` | Background: `#fef3c7`
* `error` (Crimson): `#e11d48` | Background: `#fff1f2`

### Typography Tokens (Editorial Pairing)
* **Font Families:**
  * Heading: `var(--font-inter-display)`, `Inter`, sans-serif (tracking-tight, bold weight)
  * Body: `var(--font-inter)`, `Inter`, sans-serif (leading-relaxed)
* **Font Sizes & Line Heights:**
  * `hero`: `fontSize: 3.5rem` to `4.5rem` (56px - 72px) | `lineHeight: 1.1`
  * `page-title`: `fontSize: 2.5rem` (40px) | `lineHeight: 1.2`
  * `section-title`: `fontSize: 1.75rem` (28px) | `lineHeight: 1.3`
  * `subtitle`: `fontSize: 1.375rem` (22px) | `lineHeight: 1.4`
  * `body-large`: `fontSize: 1.125rem` (18px) | `lineHeight: 1.5`
  * `body`: `fontSize: 1rem` (16px) | `lineHeight: 1.5`
  * `caption`: `fontSize: 0.875rem` (14px) | `lineHeight: 1.4`
  * `label-small`: `fontSize: 0.75rem` (12px) | `lineHeight: 1.3`

### Spacing Tokens (8pt Grid)
* `space-1`: `4px` (`0.25rem`)
* `space-2`: `8px` (`0.5rem`)
* `space-3`: `12px` (`0.75rem`)
* `space-4`: `16px` (`1rem`)
* `space-6`: `24px` (`1.5rem`)
* `space-8`: `32px` (`2rem`)
* `space-12`: `48px` (`3rem`)
* `space-16`: `64px` (`4rem`)
* `space-24`: `96px` (`6rem`)
* `space-32`: `128px` (`8rem`)

### Border Radius Tokens (Custom curves)
* `rounded-button`: `14px` (`0.875rem`)
* `rounded-input`: `16px` (`1rem`)
* `rounded-card`: `20px` (`1.25rem`)
* `rounded-image`: `24px` (`1.5rem`)
* `rounded-hero`: `32px` (`2rem`)

### Shadow Tokens (Floating & Premium)
* `shadow-soft-sm`: `0 2px 8px -2px rgba(18, 18, 18, 0.04)`
* `shadow-soft-md`: `0 8px 24px -4px rgba(18, 18, 18, 0.06), 0 4px 12px -2px rgba(18, 18, 18, 0.03)`
* `shadow-soft-lg`: `0 20px 48px -8px rgba(18, 18, 18, 0.08), 0 8px 24px -4px rgba(18, 18, 18, 0.04)`

### Animation & Transition Tokens (Framer Motion Easing)
* **Duration:** Standard micro-interactions set to `200ms` (hover states) to `350ms` (drawers, modals).
* **Easing:** Custom Bezier curves matching Phenomenon UI physics:
  * `ease-out-quint`: `cubic-bezier(0.16, 1, 0.3, 1)` (snappy entry animation)
  * `ease-in-out-standard`: `cubic-bezier(0.4, 0, 0.2, 1)` (standard interactive morphs)

### Responsive Breakpoint Tokens
* `sm`: `640px` (standard mobile boundaries)
* `md`: `768px` (tablets and dual-pane views)
* `lg`: `1024px` (laptops and small desktops)
* `xl`: `1280px` (desktop catalogue grid views)
* `2xl`: `1536px` (maximum containment layout)

### z-index Tokens
* `z-base`: `0`
* `z-dropdown`: `1000`
* `z-sticky`: `1100` (mobile bottom navigation bar stays above all page content)
* `z-overlay`: `1200`
* `z-drawer`: `1300` (hamburger overlay)
* `z-modal`: `1350`
* `z-toast`: `1400`
* `z-tooltip`: `1500`

### Opacity Tokens
* `opacity-disabled`: `0.5`
* `opacity-hover-overlay`: `0.04` (very subtle overlay for button states)
* `opacity-muted`: `0.6` (secondary subtitles, labels)

### Container Tokens
* `max-w-container`: `1280px`
* `padding-container-mobile`: `1rem`
* `padding-container-desktop`: `2rem`
