# COMPONENT_INVENTORY.md
# Component Inventory Specification

This document inventories core UI primitives, interactive cards, layouts, and indicators defining the FootCare design system.

---

## 1. UI Primitives

### `Button`
* **Path:** `src/components/ui/button.tsx`
* **Props:**
  * `variant`: `"primary" | "secondary" | "outline" | "danger" | "ghost"`
  * `size`: `"sm" | "md" | "lg" | "icon"`
  * `children`: `React.ReactNode`
* **Aesthetics:** `rounded-[14px]` (0.875rem), high contrast focus states (`focus-visible:ring-2 focus-visible:ring-accent`), and snappy hover overlays.
* **Micro-interactions:** Hover translates element upwards by `-1px` with a transition duration of `200ms` (easing: `ease-out-quint`).

### `Input`
* **Path:** `src/components/ui/input.tsx`
* **Props:** Standard HTML `<input>` elements + optional `error` message string.
* **Aesthetics:** `rounded-[16px]` (1rem), subtle light border, focusing to `accent` (Electric Blue) border with `shadow-soft-sm`.

---

## 2. Common Presentation Components

### `ProductCard`
* **Path:** `src/components/common/product-card.tsx`
* **Props:**
  * `product`: `ProductObject`
* **Aesthetics:** `rounded-[20px]`, image-heavy structure, floating badge for "Hot Selling" and "Discount" percentages.
* **Accessibility:** Fully keyboard tabbable. Alt tags must reflect "`[Brand] [Product Name] in [Color]`".

### `ShowroomCard`
* **Path:** `src/components/common/showroom-card.tsx`
* **Props:**
  * `showroom`: `ShowroomObject`
* **Aesthetics:** Features hero image of showroom, business hours, and primary CTA buttons (`Call Store` and `Get Directions`).
* **Interactions:** "Get Directions" deep-links directly to Google Maps. "Call Store" triggers `tel:` device dialer.

---

## 3. Structural Layout Components

### `Navbar`
* **Path:** `src/components/layout/navbar.tsx`
* **Props:** None
* **Behavior:** Sticky desktop header navigating to Homepage, Catalogue, Brands, Showrooms. Transforms to thin top panel on mobile layout.

### `BottomNav`
* **Path:** `src/components/layout/bottom-nav.tsx`
* **Props:** None
* **Behavior:** Sticky mobile bottom navigation (Home, Products, Brands, Showrooms, Menu), sitting at `z-sticky` overlay. Thumb-friendly layout.
