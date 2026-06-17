const fs = require('fs');
const targetPath = '/home/syedhashimabbas/autodiagnostix/site-design-antigravity/api/data/products.json';

function fix() {
    try {
        const data = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

        data.forEach(p => {
            if (p.id === 'launch-pad-9-link') {
                p.heroImages = [
                    '/images-new/x-431-pad9-link.jpg',
                    '/images-new/x-431-pad9-link-1.jpg',
                    '/images-new/x-431-pad9-link-2.jpg'
                ];
            }
            if (p.id === 'launch-crt-511s-v2' || p.id === 'creader-tpms-511s-v2') {
                p.heroImages = [
                    '/images-new/creader-tpms-511s-v2.jpg',
                    '/images-new/creader-tpms-511s-v2-1.jpg'
                ];
            }
            if (p.id === 'launch-i-tpms') {
                p.heroImages = [
                    '/images-new/i-tpms-1.png',
                    '/images-new/i-tpms-2.png'
                ];
            }
            if (p.id === 'launch-pro-3-link') {
                p.heroImages = [
                    '/images-new/x-431-pro3-link.jpg'
                ];
            }
        });

        fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));
        console.log('Specific fixes applied.');
    } catch (err) {
        console.error(err);
    }
}
fix();
