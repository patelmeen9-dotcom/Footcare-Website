# FOLDER_STRUCTURE.md
# Folder Structure & Placement Conventions

This document specifies the location and conventions for creating new files and folders.

---

## 1. Directory Blueprint

```
e:\Website_Foot_care_Anti_gravity\
├── docs/                      # Single Source of Truth documentation
├── prisma/                    # Prisma DB schema & migrations
│   └── schema.prisma          # Database definitions
├── public/                    # Static images, assets, default brand logos
└── src/
    ├── app/                   # Next.js App Router Page components
    │   ├── api/               # API Route Handlers (REST controllers)
    │   ├── (public)/          # Public customer facing routes
    │   └── (admin)/           # Private admin portal dashboards
    ├── components/            # Reusable React components
    │   ├── ui/                # UI atomic elements (buttons, inputs)
    │   ├── common/            # Presentation blocks (cards, bars)
    │   └── layout/            # Layout wrappers (navbar, footer)
    ├── features/              # Complex hooks, forms, state containers
    ├── hooks/                 # Global React hooks
    ├── services/              # Logic wrappers (Cloudinary, Excel parsers)
    ├── utils/                 # Pure helper functions
    ├── types/                 # Shared TypeScript models
    └── lib/                   # Integrations (db client initializer)
```

---

## 2. File Placement Rules

* **Atomic UI Components:** Place base inputs, buttons, switches, checkboxes under `src/components/ui/`.
* **Shared Presentation Elements:** Cards, carousels, lists that display records without handling complex data-fetching states belong in `src/components/common/`.
* **State & Operations:** Complex state logic, hook integrations, React Hook Forms (e.g., login forms, import forms) go in `src/features/[feature_name]/`.
* **Utility Helpers:** Write pure mathematical or formatting functions (e.g., date conversion, currency formatting) under `src/utils/`. Do not put database calls or side-effects in utilities.
