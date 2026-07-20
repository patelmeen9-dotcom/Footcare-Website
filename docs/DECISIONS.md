# DECISIONS.md
# Architectural Decisions Ledger

This document registers the key architectural choices, trade-offs, and justifications made during the system design phase.

---

## [ADR-001] Next.js Route Handlers vs. NestJS Backend

* **Context:** The system requires a backend layer for API access, database queries, and Excel file parsing.
* **Decision:** Use built-in Next.js Route Handlers instead of building a separate NestJS server.
* **Rationale:**
  * **Unified Codebase:** Simplifies hosting, deployments, and dependency configuration (single `package.json`).
  * **Efficiency:** Minimizes networking overhead between frontend components and backend controllers.
  * **Scaling:** Serverless-ready architecture matching hosting providers like Vercel or Netlify.

---

## [ADR-002] 1-to-1 Product-Showroom Relationship

* **Context:** The catalog displays products. The business requested indicating which showroom holds each item.
* **Decision:** Model product-showroom as a direct relationship where one product belongs to exactly one showroom.
* **Rationale:**
  * Simple and robust import template design.
  * Keeps database normalization high.
  * If a physical shoe model is available at multiple stores, they are imported as separate rows with unique article numbers (e.g., store-specific barcodes), ensuring perfect local stock alignment.

---

## [ADR-003] Tailwind CSS v4 and CSS-First Theme Configuration

* **Context:** Project uses Tailwind CSS for visual presentation. The new Next.js template installs Tailwind CSS v4.
* **Decision:** Embrace Tailwind v4's CSS-first theme configuration using the `@theme` directive inside `globals.css` rather than setting up a legacy JS-based `tailwind.config.ts`.
* **Rationale:**
  * Aligns with the modern React compile-safe tooling stack.
  * Marginally faster compile times.
  * Declares CSS variables natively, making dark mode transitions seamless.

---

## [ADR-004] Server-Side Session Verification API for Layout Guards

* **Context:** The admin panel cookie `admin_session` is marked as `httpOnly` for maximum security (XSS prevention). Since client-side JS (`document.cookie`) cannot read httpOnly cookies, layouts cannot verify sessions directly in client code.
* **Decision:** Implement a server-side route handler `/api/auth/verify` that inspects and validates the JWT cookie. The admin layout guard queries this API route dynamically.
* **Rationale:**
  * **Security First:** Retains the security benefits of `httpOnly: true` (which prevents unauthorized scripts from reading session tokens).
  * **Unified Validation:** Keeps session decryption, JWT verification, and expiration validation logic isolated on the server in a single place.
