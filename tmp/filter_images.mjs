import fs from 'fs';
import path from 'path';

const IMG_DIR = path.join(process.cwd(), 'app/public/images-new');
const PRODUCTS_API = path.join(process.cwd(), 'api/data/products.json');
const PRODUCTS_FINAL = path.join(process.cwd(), 'products_final.json');

const availableImages = new Set(fs.readdirSync(IMG_DIR));

function cleanImagePath(imgPath) {
    if (!imgPath) return null;
    let cln = imgPath;
    if (cln.startsWith('/')) cln = cln.substring(1);
    if (cln.startsWith('images-new/')) cln = cln.substring('images-new/'.length);
    return cln;
}

function processProductsFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    console.log(`Processing: ${filePath}`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let modified = 0;

    data.forEach(product => {
        // Clean heroImages
        if (product.heroImages && Array.isArray(product.heroImages)) {
            const originalLength = product.heroImages.length;
            product.heroImages = product.heroImages.filter(img => {
                const imgName = cleanImagePath(img);
                return imgName && availableImages.has(imgName);
            });
            if (originalLength !== product.heroImages.length) modified++;
        }

        // Clean feature images
        if (product.features && Array.isArray(product.features)) {
            product.features.forEach(feature => {
                if (feature.image) {
                    const imgName = cleanImagePath(feature.image);
                    if (!imgName || !availableImages.has(imgName)) {
                        // Assuming missing feature image might need to be empty string or null, or we leave it empty. Let's set it to empty.
                        feature.image = '';
                        modified++;
                    }
                }
            });
        }
    });

    if (modified > 0) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        console.log(`Updated ${filePath}. Changed ${modified} items.`);
    } else {
        console.log(`No missing images found in ${filePath}.`);
    }
}

processProductsFile(PRODUCTS_API);
processProductsFile(PRODUCTS_FINAL);
