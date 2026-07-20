# DATABASE.md
# Database Schema & Enterprise Scaling Blueprint

This document details the database layout, relationships, performance indexing strategies, and future expansion paths.

---

## 1. Relational Entity Relationship (ER) Summary

The FootCare catalogue is modeled inside PostgreSQL. One product is located in exactly one showroom, while maintaining relations to brands and categories.

```mermaid
erDiagram
    users {
        uuid id PK
        string email UK
        string passwordHash
        string name
        string role
        boolean active
        datetime createdAt
        datetime updatedAt
    }

    showrooms {
        uuid id PK
        string name
        string slug UK
        string address
        string mapsUrl
        string phone
        string email
        string openingTime
        string closingTime
        string heroImage
        string description
        boolean active
        datetime createdAt
        datetime updatedAt
    }

    brands {
        uuid id PK
        string name
        string slug UK
        string logo
        string banner
        string description
        string metaTitle
        string metaDescription
        boolean active
        datetime createdAt
        datetime updatedAt
    }

    categories {
        uuid id PK
        string name
        string slug UK
        string description
        string image
        boolean active
        datetime createdAt
        datetime updatedAt
    }

    products {
        uuid id PK
        string articleNumber UK
        string name
        string slug UK
        uuid brandId FK
        uuid categoryId FK
        uuid showroomId FK
        string description
        string material
        string careInstructions
        decimal mrp
        decimal discount
        decimal finalPrice
        boolean available
        boolean hotSelling
        string hotSellingBadge
        boolean featured
        boolean newArrival
        string seoTitle
        string seoDescription
        string status
        datetime createdAt
        datetime updatedAt
    }

    product_colors {
        uuid id PK
        uuid productId FK
        string name
        int displayOrder
        datetime createdAt
        datetime updatedAt
    }

    product_sizes {
        uuid id PK
        uuid productId FK
        string value
        int stock
        datetime createdAt
        datetime updatedAt
    }

    product_images {
        uuid id PK
        uuid productId FK
        uuid colorId FK
        string url
        int displayOrder
        string altText
        datetime createdAt
        datetime updatedAt
    }

    promotions {
        uuid id PK
        string name
        string slug UK
        string description
        string type
        string bannerImage
        uuid showroomId FK
        uuid brandId FK
        decimal discountPercentage
        datetime startDate
        datetime endDate
        string status
        int priority
        boolean active
        datetime createdAt
        datetime updatedAt
    }

    import_history {
        uuid id PK
        string zipFileName
        datetime date
        uuid userId FK
        string status
        int summaryCreated
        int summaryUpdated
        int summaryErrors
        int summarySkipped
        int durationMs
        string reportUrl
        datetime rollbackWindowExpiry
        datetime createdAt
        datetime updatedAt
    }

    audit_logs {
        uuid id PK
        datetime timestamp
        uuid userId FK
        string userEmail
        string action
        string entity
        uuid entityId
        jsonb previousValue
        jsonb newValue
        string ipAddress
        string status
        datetime createdAt
    }

    users ||--o{ import_history : "triggers"
    users ||--o{ audit_logs : "creates"
    showrooms ||--o{ products : "contains (1-to-many)"
    showrooms ||--o{ promotions : "gets targeted"
    brands ||--o{ products : "produces"
    brands ||--o{ promotions : "gets targeted"
    categories ||--o{ products : "groups"
    products ||--o{ product_colors : "has"
    products ||--o{ product_sizes : "has"
    products ||--o{ product_images : "has"
    product_colors ||--o{ product_images : "shows"
```

---

## 2. Performance Indexing Strategies

To ensure sub-second search speeds across large collections, we configure the following database indexes:
* **Unique Slugs:** Unique indexes on `slug` columns in `products`, `brands`, `showrooms`, `categories`, and `promotions` for quick key-based page rendering.
* **Foreign Key References:** B-Tree indexes on `products(brandId)`, `products(categoryId)`, and `products(showroomId)` to optimize related product lookups.
* **Search & Filters:**
  * B-Tree index on `products(finalPrice)` for sorting by price.
  * Multi-column index on `products(available, status, newArrival)` for catalog category filtering.
  * GIN (Generalized Inverted Index) on `products(name, articleNumber)` for fuzzy search optimization.

---

## 3. Migration Path to E-Commerce (Future Expansion)

Transitioning to transactional e-commerce will not require redesigning the existing tables. We will expand the schema by adding the following independent tables:
* **`customers`:** Manages registered shoppers, emails, credentials, and default shipping addresses.
* **`baskets` & `basket_items`:** Store client checkout baskets in database state.
* **`orders` & `order_lines`:** Maps an finalized order to products, capturing the actual purchased prices, sizes, and colors at checkout time.
* **`transactions`:** Tracks payment gateway statuses, transaction IDs (Stripe, Razorpay, etc.), and checkout logs.
