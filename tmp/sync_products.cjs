const fs = require('fs');
const path = require('path');

const targetPath = '/home/syedhashimabbas/autodiagnostix/site-design-antigravity/api/data/products.json';
const sourcePath = '/home/syedhashimabbas/autodiagnostix/site-design-antigravity/products_final.json';
const imagesDir = '/home/syedhashimabbas/autodiagnostix/site-design-antigravity/app/public/images-new';

function sync() {
    try {
        const targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
        const availableImages = fs.readdirSync(imagesDir);

        console.log(`Available local images: ${availableImages.length}`);

        const result = [...targetData];

        sourceData.forEach(sourceProd => {
            const index = result.findIndex(p => p.id === sourceProd.id);

            // Map images to local paths if they exist
            if (sourceProd.heroImages) {
                sourceProd.heroImages = sourceProd.heroImages.map(img => {
                    if (typeof img !== 'string') return img;
                    const filename = path.basename(img);
                    if (availableImages.includes(filename)) {
                        return `/images-new/${filename}`;
                    }
                    return img;
                });
            }

            if (sourceProd.features) {
                sourceProd.features = sourceProd.features.map(f => {
                    if (f.image) {
                        const filename = path.basename(f.image);
                        if (availableImages.includes(filename)) {
                            f.image = `/images-new/${filename}`;
                        }
                    }
                    return f;
                });
            }

            if (index !== -1) {
                console.log(`Updating existing product: ${sourceProd.id}`);
                result[index] = { ...result[index], ...sourceProd };
            } else {
                console.log(`Adding new product: ${sourceProd.id}`);
                result.push(sourceProd);
            }
        });

        fs.writeFileSync(targetPath, JSON.stringify(result, null, 2));
        console.log(`Sync complete. Total products: ${result.length}`);
    } catch (err) {
        console.error('Error during sync:', err);
    }
}

sync();
