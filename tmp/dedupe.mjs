import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

const API_PRODUCTS = 'api/data/products.json';
const FINAL_PRODUCTS = 'products_final.json';
const IMG_DIR = 'app/public/images-new';

function dedupeProducts(filePath) {
    if (!fs.existsSync(filePath)) return;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const unique = [];
    const seenIds = new Set();
    const seenNames = new Set();

    let removed = 0;
    for (const p of data) {
        if (!seenIds.has(p.id) && !seenNames.has(p.name)) {
            unique.push(p);
            seenIds.add(p.id);
            seenNames.add(p.name);
        } else {
            removed++;
        }
    }

    if (removed > 0) {
        fs.writeFileSync(filePath, JSON.stringify(unique, null, 4));
        console.log(`Removed ${removed} duplicate products from ${filePath}`);
    } else {
        console.log(`No duplicate products found in ${filePath}`);
    }
}

dedupeProducts(API_PRODUCTS);
dedupeProducts(FINAL_PRODUCTS);

// Dedupe images
const files = fs.readdirSync(IMG_DIR);
const hashes = {};
const duplicates = [];

for (const file of files) {
    const filePath = path.join(IMG_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('md5').update(buffer).digest('hex');

    if (!hashes[hash]) {
        hashes[hash] = file; // Canonical
    } else {
        duplicates.push({ duplicate: file, canonical: hashes[hash] });
    }
}

// Update references in products
let mapping = {};
duplicates.forEach(d => {
    mapping[d.duplicate] = d.canonical;
    console.log(`Found duplicate image: ${d.duplicate} -> ${d.canonical}`);
});

function updateReferences(filePath) {
    if (!fs.existsSync(filePath)) return;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let updated = 0;

    data.forEach(p => {
        if (p.heroImages) {
            p.heroImages = p.heroImages.map(img => {
                const name = img.split('/').pop();
                if (mapping[name]) {
                    updated++;
                    return img.replace(name, mapping[name]);
                }
                return img;
            });
            // Also dedupe the array itself
            p.heroImages = [...new Set(p.heroImages)];
        }
        if (p.features) {
            p.features.forEach(f => {
                if (f.image) {
                    const name = f.image.split('/').pop();
                    if (mapping[name]) {
                        updated++;
                        f.image = f.image.replace(name, mapping[name]);
                    }
                }
            });
        }
    });

    if (updated > 0) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        console.log(`Updated ${updated} image references in ${filePath}`);
    }
}

updateReferences(API_PRODUCTS);
updateReferences(FINAL_PRODUCTS);

// Delete duplicate images
let deleted = 0;
duplicates.forEach(d => {
    const filePath = path.join(IMG_DIR, d.duplicate);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deleted++;
    }
});

console.log(`Deleted ${deleted} duplicate images.`);
