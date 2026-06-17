# Autodiagnostix React CMS Guide

The website has been architected with **Template Pages** (`CategoryPage` and `ProductPage`) to function seamlessly as a Headless CMS frontend. This means the visual layout is completely decoupled from the data.

## How the Templates Work

Both `src/pages/CategoryPage.jsx` and `src/pages/ProductPage.jsx` accept data through React `props`. By default, they contain dummy fallback data so the pages render without crashing, but you can dynamically pass real data from any database or CMS (like Sanity, Strapi, Contentful, or local JSON files).

### 1. Adding a New Product

To render a new product page, you utilize the `ProductPage` layout component and pass the appropriate data properties to it.

**Configurable `ProductPage` Props:**
*   `title` *(String)*: e.g. "LAUNCH PAD 9 LINK"
*   `tagline` *(String)*: e.g. "Professional Grade Diagnostics"
*   `description` *(String)*: Overarching product summary.
*   `heroImages` *(Array of Strings)*: URLs to the product images for the image slider.
*   `features` *(Array of Objects)*: The feature display blocks stacked down the page.
    *   `title`
    *   `highlight` (Colored accent text)
    *   `description`
    *   `points` (Array of up to 2 short highlight strings)
    *   `icons` (Array of 2 material symbol strings - e.g. `memory` or `speed`)
    *   `image` (Image URL for the feature)
    *   `bg` (Tailwind background class for alternating colors, e.g. `bg-surface`)
    *   `reverse` (Boolean - setting to true flips the image to the other side)
*   `specs` *(Array of Objects)*: Made up of `{ label: "OS", value: "Android 10.0" }`

### 2. Adding a New Category

Category collections are rendered via `src/pages/CategoryPage.jsx`.

**Configurable `CategoryPage` Props:**
*   `title` *(String)*: e.g. "Diagnostic Scanners"
*   `subtitle` *(String)*: e.g. "Professional"
*   `products` *(Array of Objects)*: The product cards that populate the category grid.
    *   `id` *(String)*: The slug utilized for the "View Specs" link (which routes to `/product/{id}`).
    *   `name`, `description`, `tier`
    *   `badge` *(Optional String - e.g. "Flagship")*
    *   `badgeColor` *(Optional String - e.g. "bg-primary")*
    *   `image` *(String URL)*

---

## Next Steps: Connecting to Real Data Sources

Right now, the routes in `App.jsx` dump you straight into the templates which utilize their default fallback props for preview purposes. To integrate your CMS data based on URLs, you should embrace the "Wrapper" pattern.

### Option A: Local JSON Databases

You can create `src/data/products.json`. Then, create a wrapper component that reads the URL parameter, finds the matching product, and passes the data to the template:

```jsx
// src/pages/ProductWrapper.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import ProductPage from './ProductPage';
import productsData from '../data/products.json';

export default function ProductWrapper() {
  const { id } = useParams(); // Retrieves the ID from /product/:id
  const product = productsData.find(p => p.id === id); // Look up the product in your database
  
  if (!product) return <div>Product Not Found</div>;
  
  // Pass the entire product JSON object as props to the CMS template
  return <ProductPage {...product} />;
}
```

You would then simply update your `App.jsx` router to use your dynamic wrapper:
```jsx
// App.jsx
<Route path="/product/:id" element={<ProductWrapper />} />
```

### Option B: Headless CMS API (Strapi, Sanity, etc.)
The wrapper structure remains the exact same, but instead of finding data from a local JSON, you would use a `useEffect` to execute a `fetch()` call to your CMS API endpoint using the `id` from the URL, and store the result in React State. Once the fetch finishes loading, you render `<ProductPage {...fetchedData} />`.
