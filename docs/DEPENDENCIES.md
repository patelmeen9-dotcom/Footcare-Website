# DEPENDENCIES.md
# Project Dependencies Ledger

This document inventories the npm dependencies and devDependencies, detailing their rationales.

---

## 1. Production Dependencies

| Dependency | Purpose | Rationale |
| :--- | :--- | :--- |
| **`next`** | App Core | React framework powering SSR/ISR routing and API endpoints. |
| **`react` & `react-dom`** | UI Library | Render core components and handle hydration. |
| **`@prisma/client`** | Database Client | Direct database interface using auto-generated types and parameterized queries. |
| **`framer-motion`** | Animations | Controls smooth micro-interactions (hover, fade-in, drawer sliders) matching Phenomenon Studio style. |
| **`lucide-react`** | Outlined Icons | Lightweight, premium, outline-styled icon catalog with custom scaling support. |
| **`zod`** | Data Validation | Form validations and API request body parsing. |

---

## 2. Dev Dependencies

| Dependency | Purpose | Rationale |
| :--- | :--- | :--- |
| **`prisma`** | ORM Tooling | Database migration management and client auto-generation. |
| **`typescript`** | Type Safety | Enforces strict compile-time checks (preventing runtime crashes). |
| **`tailwindcss`** | Visual Layout | Utility-first CSS compiling library (Tailwind v4). |
| **`@tailwindcss/postcss`**| CSS Compiling | Integrates Tailwind CSS v4 into Next.js PostCSS build pipeline. |
| **`eslint` & `eslint-config-next`**| Code Linting | Verifies compliance with React best practices and coding standards. |
