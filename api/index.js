const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const https = require('https');
const multer = require('multer');

// Upload destination = app/public/images-new
const UPLOAD_DIR = path.join(__dirname, '../app/public/images-new');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, safe);
    }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ----- IMAGE UPLOAD -----
app.post('/api/upload', upload.array('images', 20), (req, res) => {
    try {
        const paths = req.files.map(f => `/images-new/${f.filename}`);
        res.json({ uploaded: paths });
    } catch (err) {
        res.status(500).json({ error: 'Upload failed' });
    }
});

// List all local images
app.get('/api/images', (_req, res) => {
    try {
        const files = fs.readdirSync(UPLOAD_DIR)
            .filter(f => /\.(jpe?g|png|webp|gif|svg)$/i.test(f))
            .map(f => `/images-new/${f}`);
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: 'Could not list images' });
    }
});

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const getFilePath = (entity) => path.join(DATA_DIR, `${entity}.json`);

const readData = (entity) => {
    const file = getFilePath(entity);
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
};

const writeData = (entity, data) => {
    fs.writeFileSync(getFilePath(entity), JSON.stringify(data, null, 4));
};

// ----- IMAGE PROXY -----
app.get('/api/proxy', (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) return res.status(400).send('URL is required');

    https.get(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (proxyRes) => {
        if (proxyRes.statusCode !== 200) {
            return res.status(proxyRes.statusCode).send('Failed to fetch image');
        }
        res.setHeader('Content-Type', proxyRes.headers['content-type']);
        proxyRes.pipe(res);
    }).on('error', (err) => {
        res.status(500).send('Error fetching image');
    });
});

// ----- CATEGORIES -----

// Get all categories
app.get('/api/categories', (req, res) => {
    try {
        const categories = readData('categories');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: "Failed to read database." });
    }
});

// Create new category
app.post('/api/categories', (req, res) => {
    console.log(`POST /api/categories: ${JSON.stringify(req.body)}`);
    try {
        const categories = readData('categories');
        const id = req.body.id || Date.now().toString();
        if (categories.some(c => c.id === id)) {
            return res.status(409).json({ error: "Category ID already exists." });
        }
        const newCategory = { id, ...req.body };
        categories.push(newCategory);
        writeData('categories', categories);
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(500).json({ error: "Failed to write to database." });
    }
});

// Update category
app.put('/api/categories/:id', (req, res) => {
    console.log(`PUT /api/categories/${req.params.id}`);
    try {
        const categories = readData('categories');
        const index = categories.findIndex(c => c.id === req.params.id);
        if (index === -1) return res.status(404).json({ error: "Category not found" });

        categories[index] = { ...categories[index], ...req.body, id: req.params.id };
        writeData('categories', categories);
        res.json(categories[index]);
    } catch (err) {
        res.status(500).json({ error: "Failed to update category." });
    }
});

// Delete category
app.delete('/api/categories/:id', (req, res) => {
    console.log(`DELETE /api/categories/${req.params.id}`);
    try {
        const categories = readData('categories');
        const filtered = categories.filter(c => c.id !== req.params.id);
        writeData('categories', filtered);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: "Failed to delete category." });
    }
});

// ----- PRODUCTS -----

// Get all products
app.get('/api/products', (req, res) => {
    try {
        const products = readData('products');
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Failed to read database." });
    }
});

// Create new product
app.post('/api/products', (req, res) => {
    console.log(`POST /api/products: ${JSON.stringify(req.body)}`);
    try {
        const products = readData('products');
        const id = req.body.id || Date.now().toString();
        if (products.some(p => p.id === id)) {
            return res.status(409).json({ error: "Product ID already exists." });
        }
        const newProduct = { id, ...req.body };
        products.push(newProduct);
        writeData('products', products);
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: "Failed to write to database." });
    }
});

// Update product
app.put('/api/products/:id', (req, res) => {
    console.log(`PUT /api/products/${req.params.id}`);
    try {
        const products = readData('products');
        const index = products.findIndex(p => p.id === req.params.id);
        if (index === -1) return res.status(404).json({ error: "Product not found" });

        products[index] = { ...products[index], ...req.body, id: req.params.id };
        writeData('products', products);
        res.json(products[index]);
    } catch (err) {
        res.status(500).json({ error: "Failed to update product." });
    }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
    try {
        const products = readData('products');
        const filtered = products.filter(p => p.id !== req.params.id);
        writeData('products', filtered);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: "Failed to delete product." });
    }
});

// Bulk products upload
app.post('/api/products/bulk', (req, res) => {
    try {
        const newProducts = Array.isArray(req.body) ? req.body : [req.body];
        const existingProducts = readData('products');

        // Merge or replace based on ID
        const productMap = new Map(existingProducts.map(p => [p.id, p]));
        newProducts.forEach(p => {
            const id = p.id || Date.now().toString() + Math.random().toString(36).substr(2, 5);
            productMap.set(id, { ...p, id });
        });

        const updatedList = Array.from(productMap.values());
        writeData('products', updatedList);
        res.status(200).json({ count: newProducts.length, total: updatedList.length });
    } catch (err) {
        res.status(500).json({ error: "Failed to perform bulk upload." });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`CMS API is running successfully on http://localhost:${PORT}`);
});
