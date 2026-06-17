const fs = require('fs');
const path = require('path');

const targetPath = '/home/syedhashimabbas/autodiagnostix/site-design-antigravity/api/data/products.json';
const imagesDir = '/home/syedhashimabbas/autodiagnostix/site-design-antigravity/app/public/images-new';

function sync() {
    try {
        const targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
        const availableImages = fs.readdirSync(imagesDir);

        console.log(`Available local images: ${availableImages.length}`);

        targetData.forEach(p => {
            // Fuzzy match based on product ID or name
            const id = p.id;
            const name = p.name.toLowerCase();

            // Try to find an image that matches the ID
            let match = availableImages.find(img => img.toLowerCase().includes(id.toLowerCase()) && !img.includes('-1') && !img.includes('-2'));

            // Special cases
            if (!match && id === 'launch-pad-9-link') match = 'x-431-pad9-link.jpg';
            if (!match && id === 'creader-tpms-511s-v2') match = 'creader-tpms-511s-v2.jpg';
            if (!match && name.includes('adas pro plus')) match = 'adas-pro-plus-v2.jpg';
            if (!match && name.includes('vsp-800')) match = 'vsp-800.jpg';
            if (!match && name.includes('vsp-828')) match = 'vsp-828.jpg';
            if (!match && name.includes('ac519')) match = 'ac519.jpg';

            if (match && availableImages.includes(match)) {
                console.log(`Mapping ${id} to /images-new/${match}`);
                p.heroImages = [`/images-new/${match}`, ...(p.heroImages || []).filter(img => !img.startsWith('/images-new/'))];

                // Also try to find secondary images
                const secondary = availableImages.filter(img => img.toLowerCase().includes(id.toLowerCase()) && (img.includes('-1') || img.includes('-2')));
                if (secondary.length > 0) {
                    p.heroImages = [...new Set([...p.heroImages, ...secondary.map(s => `/images-new/${s}`)])];
                }
            }
        });

        fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2));
        console.log(`Fuzzy sync complete.`);
    } catch (err) {
        console.error('Error during fuzzy sync:', err);
    }
}

sync();
