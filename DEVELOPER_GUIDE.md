# Autodiagnostix Developer Guide

Welcome to the Autodiagnostix Developer Guide. This document provides a comprehensive overview of the site's architecture, its directory structure, and instructions on how to edit and manage content, components, and data.

---

## 🏗️ Architecture Overview

The project is structured as a **Monorepo** containing two main parts:
1. **Frontend (`app/`)**: A React single-page application built with Vite and styled using Tailwind CSS.
2. **Backend API (`api/`)**: A lightweight Node.js Express server that serves JSON data to the frontend.

Both parts are managed via a unified script in the root `package.json`. When you run `npm run dev` from the root, it automatically starts both the React frontend and the Express API server concurrently.

---

## 📂 Directory Structure

```text
site-design-antigravity/
├── api/                        # Backend API Server
│   ├── data/                   # JSON databases (products.json, categories.json)
│   ├── index.js                # Express server entry point
│   └── package.json            # API dependencies
├── app/                        # Frontend React Application
│   ├── public/                 # Static assets (served at root /)
│   │   ├── images-new/         # Product images
│   │   ├── images/             # Category and placeholder images
│   │   └── logo-full.png       # Site logos
│   ├── src/                    # React Source Code
│   │   ├── components/         # Reusable UI components
│   │   ├── data/               # Frontend static configurations
│   │   ├── pages/              # Route entry points (Pages)
│   │   ├── App.jsx             # React Router configuration
│   │   ├── main.jsx            # React mounting point
│   │   └── index.css           # Global Tailwind CSS input
│   ├── package.json            # Frontend dependencies
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── vite.config.js          # Vite build configuration
└── package.json                # Root package.json (proxies scripts to app/)
```

---

## 🛠️ How to Edit the Site

### 1. Modifying Pages and Routes
All main views are located in `app/src/pages/`. 
- **Homepage (`HomePage.jsx`)**: Contains the hero section, categories, new arrivals, and footer.
- **Product Catalog (`AllProductsPage.jsx`, `CategoryPage.jsx`, `BrandsPage.jsx`)**: These pages fetch data from the API and pass it down to the `ProductGrid.jsx` component.
- **Admin Dashboard (`AdminDashboard.jsx`)**: The secure area for managing products, categories, and images.

*To add a new page:* Create the component in `pages/` and add the new `<Route>` to `app/src/App.jsx`.

### 2. Modifying UI Components
Reusable site blocks are located in `app/src/components/`.
- **Header/Footer**: Modify `Header.jsx` for navigation links and the search bar. Modify `HomeComponents.jsx` (specifically the Footer export) for the site footer.
- **Product Display**: `ProductGrid.jsx` handles filtering, searching, and sorting of products. `ProductCard` styles are embedded here or in dedicated card components.
- **Icons**: Icons are centrally managed in `Icons.jsx` or inline SVG definitions (like `IconMap` in `CategoryNav.jsx` and `HomeComponents.jsx`). If you need to change a missing icon, replace it with a valid SVG snippet in these maps, avoiding external icon fonts where possible to prevent rendering issues.

### 3. Modifying Data and Content
The site dynamically renders content driven by JSON data.
- **Products & Categories**: The master database is stored in `api/data/products.json` and `api/data/categories.json`. To add, edit, or delete items, use the **Admin Dashboard** (`/admin`), which features a visual CRUD interface that writes directly to these JSON files via the Express API.
- **Static Homepage Content**: Text, stats, and certification logos for the homepage are stored in `app/src/data/homepage-content.json` and `app/src/data/hero-section.json`. Edit these files to change static marketing copy without touching the React code.

### 4. Managing Images
Images are entirely self-hosted in the `app/public/` directory.
- **Product Images**: Should be uploaded to `app/public/images-new/`.
- **Using the Admin Dashboard**: You can manage images using the `ImageManager.jsx` component inside the Admin Dashboard. It allows you to select, upload, and assign images to products without touching the file system manually.
- **Pathing**: Under the hood, images saved in the API use relative paths (e.g., `images-new/product-name.jpg`). In the frontend, they are rendered natively since Vite mounts the `public` folder at the root `/`.

---

## 🚀 Running the Project

1. **Development Mode**: 
   From the root project folder (`site-design-antigravity/`), run:
   ```bash
   npm run dev
   ```
   This script triggers `app/package.json`, which uses `concurrently` to spin up the Vite frontend (`http://localhost:5173`) and the Express API (`http://localhost:3000`).

2. **Styling (Tailwind CSS)**:
   All styling is dictated by utility classes in the JSX. If you need to add custom colors or design tokens, edit `app/tailwind.config.js`.

3. **Building for Production**:
   To bundle the React frontend, run:
   ```bash
   npm run build
   ```
   The output will be placed in `app/dist/`. The Express API will need a separate host environment (like PM2 or Docker) to serve the backend JSON alongside the static frontend.
