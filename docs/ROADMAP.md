# ROADMAP.md
# Roadmap & Execution Schedule - FootCare Multi-Showroom Digital Catalogue

This document outlines the milestones, timelines, complexities, and checkpoints for each phase of the FootCare project.

---

## Phase 0: Project Foundation & Enterprise Setup
* **Goal:** Initialize project, set up dev environment, define global configurations, structure Prisma schema, establish theme tokens, and build base layout components.
* **Duration:** 1 Week (Current Phase)
* **Milestones:**
  * Git repository initialized & files moved to root.
  * Node dependencies (Prisma, Framer Motion, Lucide, Zod) installed.
  * `PROJECT_AUDIT.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API_CONTRACT.md`, `COMPONENT_INVENTORY.md`, `DECISIONS.md`, `FOLDER_STRUCTURE.md`, `DEPENDENCIES.md` written in `/docs`.
  * Prisma schema configured with Postgres models.
  * Design tokens structured in `src/app/globals.css`.
  * Base layout components (Navbar, BottomNav, Footer, PageContainer) built.

---

## Phase 1: Public Website (Frontend Shell)
* **Goal:** Establish public routing, static page layouts, responsive navigations, navigation header/footer, and basic hero sections.
* **Duration:** 2 Weeks
* **Milestones:**
  * Responsive header navigation and sticky bottom mobile navigation.
  * Homepage layout shell: Hero section, Search input trigger, Brands carousel, Categories grid, Featured Showrooms.
  * Static page routing for Brands, Showrooms, About, and Contact.
  * Basic local map integrations on Contact and Showroom pages.

---

## Phase 2: Catalogue & Product Discovery
* **Goal:** Connect public site to dynamic product catalogue database. Implement search, filtering, detailed product views, and the signature Smart Store Finder.
* **Duration:** 3 Weeks
* **Milestones:**
  * API endpoints for Brand, Category, Showroom, and Product queries.
  * Product grid with sorting (price, discount, newness) and infinite scroll / pagination.
  * Sidebar filters (gender, showroom, brand, category, size, color, discount, availability).
  * Product Details Page: swipeable gallery, color-switching logic, Smart Store Finder card with direct Google Maps deep link and click-to-call CTAs.

---

## Phase 3: Secure Admin Portal
* **Goal:** Build the secure management system for imports, promotions, showrooms, and catalogue additions.
* **Duration:** 3 Weeks
* **Milestones:**
  * JWT-based session authentication for admin accounts.
  * Excel parse and validation engine using `xlsx` in Route Handlers.
  * Rollback interface showing import history (Success, Failure, Undo options).
  * CRUD panels for manual product edit, active status toggling, and promotion scheduling.
  * Cloudinary integration for single/multiple image uploads mapped to color codes.

---

## Phase 4: Optimization, Auditing & Launch
* **Goal:** Ensure WCAG AA compliance, SEO optimization, and page speed compliance prior to staging deployment.
* **Duration:** 1 Week
* **Milestones:**
  * Structured Data Schema JSON-LD generation for all pages.
  * Lighthouse score verification (targeting >90 in Performance, SEO, and Accessibility).
  * Edge caching configuration (ISR for products/brands, SSR for locator map, client-side queries for live stock availability).
  * Staging deployment and manual client walkthrough.
