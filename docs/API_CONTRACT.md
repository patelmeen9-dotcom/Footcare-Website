# API_CONTRACT.md
# API Contract Specification

This document details the HTTP methods, routes, inputs, outputs, and standard status codes for all App Router Route Handlers.

---

## 1. Authentication Routes

### `POST /api/auth/login`
Authenticates admin users and drops a secure session cookie.
* **Request Body:**
  ```json
  {
    "email": "admin@footcare.com",
    "password": "SecurePassword123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "id": "a6b7c8d9-e0f1-2a3b-4c5d-6e7f8a9b0c1d",
      "email": "admin@footcare.com",
      "name": "Super Admin",
      "role": "SUPER_ADMIN"
    }
  }
  ```
* **Response (401 Unauthorized):**
  ```json
  {
    "success": false,
    "error": "Invalid email or password"
  }
  ```

---

## 2. Product Catalogue Routes

### `GET /api/products`
Queries products with active filters and sorting logic.
* **Query Parameters:**
  * `query`: Search string (optional)
  * `brand`: Brand slug comma-separated (optional)
  * `showroom`: Showroom slug comma-separated (optional)
  * `priceMin` / `priceMax`: Numeric range (optional)
  * `sortBy`: `newest` | `priceAsc` | `priceDesc` | `discount` (default: `newest`)
  * `page`: Integer (default: `1`)
* **Response (200 OK):**
  ```json
  {
    "products": [
      {
        "id": "e9c1d2e3-f4a5-6b7c-8d9e-0f1a2b3c4d5e",
        "articleNumber": "NK-AIRMAX-01",
        "name": "Air Max 90",
        "slug": "air-max-90",
        "mrp": 120.00,
        "discount": 10.00,
        "finalPrice": 108.00,
        "available": true,
        "showroom": { "name": "Footcare Kick Sports", "slug": "kick-sports" },
        "brand": { "name": "Nike", "slug": "nike" },
        "images": [{ "url": "https://cloudinary.com/..." }]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 48
    }
  }
  ```

---

## 3. Bulk Inventory Import Routes

### `POST /api/import`
Handles upload of the inventory `.zip` package (containing product Excel sheets and image archives).
* **Request (Multipart Form Data):**
  * `file`: Binary file (.zip package)
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "importId": "d3b07384-d113-4ec8-a5c9-943d3b7642a8",
    "summary": {
      "created": 125,
      "updated": 42,
      "skipped": 2,
      "errors": 0
    },
    "durationMs": 4850
  }
  ```
* **Response (400 Bad Request - Validation Failed):**
  ```json
  {
    "success": false,
    "error": "Missing column 'articleNumber' in products sheet. Rollback executed."
  }
  ```

### `POST /api/import/rollback`
Rolls back a recently executed import.
* **Request Body:**
  ```json
  {
    "importId": "d3b07384-d113-4ec8-a5c9-943d3b7642a8"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Import rolled back successfully. 125 products deleted, 42 product states reverted."
  }
  ```
