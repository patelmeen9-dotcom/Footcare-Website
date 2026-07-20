# PROJECT_AUDIT.md
# Project Audit - FootCare Multi-Showroom Digital Catalogue

## 1. Technical Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Prisma Connection Pooling in Serverless/API** | High | Medium | Implement a singleton Prisma client instance (`src/lib/db.ts`) with appropriate connection pool limits. |
| **Cloudinary Media Upload Failures** | Medium | Medium | Implement client-side size checking (<10MB), server-side signature validation, and database transaction rollbacks if image upload fails but product insertion crashes. |
| **Data Inconsistency from Bulk Imports** | High | Low | Parse Excel templates inside transactions. Validate all rows (article number uniqueness, brand/showroom exists) before database write. Implement "Rollback Window" (ImportHistory status PENDING_APPROVAL). |
| **Tailwind v4 Setup Compatibility** | Low | Low | Adhere strictly to the new Tailwind v4 CSS-first theme configuration using `@theme` in `globals.css` instead of deprecated tailwind.config.ts. |

---

## 2. Accessibility Audit (WCAG 2.1 AA Goals)
* **Keyboard Navigation:** All interactive elements (buttons, inputs, links) must have clear `:focus-visible` outline styles using the Accent (Electric Blue) color.
* **Screen Reader Support:** Maintain proper semantic structure (`<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`). Include descriptive `aria-label` attributes on icon-only buttons (e.g., Hamburger, Close button, Call Store).
* **Color Contrast:** Ensure all body text, heading text, and badges maintain a contrast ratio of at least 4.5:1 against their backgrounds. For example, White text on Charcoal Black (`#121212`) has an excellent contrast ratio of 21:1.
* **Alt Texts:** Automatically require `alt` text fields in the bulk Excel import template for product images. Admin dashboard must include `Alt Text` inputs for image uploads.

---

## 3. SEO & Metadata Strategy
* **Semantic Hierarchy:** Single `<h1>` per page (typically the page or hero title). Main body headings use `<h2>` and `<h3>`.
* **Meta Specifications:**
  * Title tags must include keywords (e.g., `Brand Name | Product Name | FootCare Bhuj`).
  * Meta descriptions should be rich in local keywords (e.g., "Browse Nike running shoes available at FootCare Kick Sports in College Road, Bhuj.").
* **Structured Data (JSON-LD):**
  * Homepage: `Organization` schema with physical address in Bhuj, contact details, and sub-locations (the three showrooms).
  * Product Page: `Product` schema detailing `name`, `image`, `description`, `brand`, `offers` (pricing, availability, seller as FootCare showroom).
  * Showroom Pages: `LocalBusiness` schema with geographical coordinates, opening hours, address, and phone number.

---

## 4. Open Questions & Validation Checks
* **Question 1:** Are there specific SEO keywords the client wishes to prioritize for the Bhuj/Gujarat area?
  * *Status:* Resolved. Configured keywords including "footwear Bhuj", "branded sports shoes Bhuj", and sitemap XML metadata targeting local shoppers.
* **Question 2:** Will store manager roles have access to bulk import or is that reserved for the super admin?
  * *Status:* Resolved. Access limits are managed via Super Admin configurations.
* **Validation Check:**
  * Verify all form fields (e.g., Admin Login, Product Creation, Banners edit) are fully validated using HTML5 form bounds, TypeScript union limits, and JSON parameters verification. [RESOLVED - Active]
