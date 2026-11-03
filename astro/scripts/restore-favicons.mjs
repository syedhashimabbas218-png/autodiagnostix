// Re-encode the existing approved AX artwork; do not redraw the brand.
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const publicDir = new URL('../public/', import.meta.url);
const source = await readFile(new URL('favicon.png', publicDir));
const square = size => sharp(source).resize(size, size, {
  fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 },
}).png().toBuffer();

for (const size of [32, 48]) {
  await writeFile(new URL(`favicon-${size}x${size}.png`, publicDir), await square(size));
}
const touchIcon = await square(180);
await writeFile(new URL('apple-touch-icon.png', publicDir), touchIcon);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><title>AutoDiagnostix AX</title><image width="180" height="180" href="data:image/png;base64,${touchIcon.toString('base64')}"/></svg>\n`;
await writeFile(new URL('favicon.svg', publicDir), svg);
// The legacy AutoDiagnostix client also referenced the framework-default SVG.
await writeFile(new URL('../../app/public/favicon.svg', import.meta.url), svg);

// ICO directory with PNG-encoded 16/32/48 frames (supported by modern browsers).
const sizes = [16, 32, 48];
const frames = await Promise.all(sizes.map(square));
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
frames.forEach((frame, index) => {
  const entry = 6 + index * 16;
  directory[entry] = sizes[index]; directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(frame.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
await writeFile(new URL('favicon.ico', publicDir), Buffer.concat([directory, ...frames]));
console.log('Restored SVG, PNG, ICO and Apple touch icons from the existing AX artwork.');
