# Autodiagnostix CMS API Documentation

This is a lightweight Express REST API that handles the creation and retrieval of Products and Categories for the Headless React frontend. It uses a local JSON file system (`/api/data/*.json`) for persistent storage without requiring an external database.

## Base URL
`http://localhost:3000/api`

---

## 1. Categories

### Get All Categories
- **Endpoint**: `GET /categories`
- **Description**: Returns an array of all saved categories.
- **Example Response Component Map (Postman/Fetch)**:
```json
[
  {
    "id": "1711684345231",
    "name": "Diagnostic Scanners",
    "icon": "terminal",
    "href": "/category/scanners"
  }
]
```

### Create a Category
- **Endpoint**: `POST /categories`
- **Headers**: `Content-Type: application/json`
- **Body Example**:
```json
{
  "name": "Diagnostic Scanners",
  "icon": "terminal",
  "href": "/category/scanners"
}
```
- **Returns**: The successfully created category object mapped with an auto-generated timestamp `id` (or the explicit `id` if passed).

---

## 2. Products

### Get All Products
- **Endpoint**: `GET /products`
- **Description**: Returns an array of all products. Allows frontend dynamic routing to map IDs seamlessly to pages (`/product/:id`).

### Create a Product
- **Endpoint**: `POST /products`
- **Headers**: `Content-Type: application/json`
- **Body Example**: (Note: The JSON payload maps 1-to-1 with the React `ProductPage` template `props`)
```json
{
  "id": "launch-pad-9-link",
  "title": "LAUNCH PAD 9 LINK",
  "tagline": "Professional Grade Diagnostics",
  "description": "Advanced vehicle intelligence. Seamless cloud communication.",
  "heroImages": ["https://url-to-image-1.jpg", "https://url-to-image-2.jpg"],
  "features": [
    {
      "title": "Master the Brain.",
      "highlight": "Advanced ECU Coding.",
      "description": "The PAD 9 LINK unlocks manufacturer-level customization.",
      "points": ["Online Coding & Parameterization", "Unlock Hidden Features"],
      "icons": ["memory", "settings_suggest"],
      "image": "https://url-to-feature-image.jpg",
      "reverse": false,
      "bg": "bg-surface"
    }
  ],
  "specs": [
    { "label": "Processor", "value": "Octa-core 2.0GHz" },
    { "label": "OS", "value": "Android 10.0" }
  ]
}
```
- **Returns**: The created product JSON object with status `201`.

---

## Starting the API

To run the API server locally:

1. Open your terminal.
2. Navigate to the `api` root directory:
   ```bash
   cd api
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```

You will see `CMS API is running successfully on http://localhost:3000`.
