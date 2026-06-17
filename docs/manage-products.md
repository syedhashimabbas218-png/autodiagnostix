# Managing Products

## Admin Panel

URL: `http://localhost:3000/admin`

Login: `admin@autodiagnostix.com` / `admin123!`

## Add a Product

1. Go to **Products** collection in the sidebar
2. Click **Create New**
3. Fill in:

   | Field | Required | Notes |
   |---|---|---|
   | Name | Yes | e.g., "X-431 PAD9 LINK" |
   | Summary | Yes | Short tagline for cards |
   | Description | Yes | Full product description |
   | Brand | Yes | Select from list or create new |
   | Category | Yes | Select from list or create new |
   | Slug | Auto | URL path — derived from name |
   | heroImages | No | Upload product photos via Media |
   | features | No | Feature blocks with title, description, image |
   | specs | No | Bullet-point specifications |
   | technicalTable | No | Key-value spec table (e.g., "Display: 10.1 inch") |
   | price | No | Leave blank if not for sale |
   | badge | No | e.g., "New", "Popular" |

4. Click **Save**

## Add a Category

1. Go to **Categories** → **Create New**
2. Set **Name** (e.g., "ADAS Equipment"), **Slug**, **Tagline**
3. Save

## Add a Brand

1. Go to **Brands** → **Create New**
2. Set **Name** (e.g., "Launch"), **Slug**
3. Save

## Upload Images

1. Go to **Media** → **Upload**
2. Files go to `cms/public/media/` (persisted via Docker volume in production)
3. After upload, copy the image URL and use it in product **heroImages** or **feature images**

## After Adding

### For production (static site):
The frontend is a static site built at build time. After adding products:

```bash
cd app
VITE_CMS_URL=https://your-cms-url.com npm run build
```

This regenerates all 73 prerendered HTML pages + sitemap with the new data. Deploy `dist/`.

### For development:
Products appear immediately via the CMS API at `localhost:3000`. No rebuild needed.

> **Note:** The prerender script reads from `api/data/products.json` (legacy). For new products to appear in prerendered pages, update that file or run the seed script.
