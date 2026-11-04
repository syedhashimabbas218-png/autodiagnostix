import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uploadPath, responsiveImage, parseMediaRequest, createByteLru } from '../src/lib/media.mjs';

const ORIGINS = ['https://strapi.autodiagnostix.com.pk'];

test('only CMS uploads are rewritten to /media', () => {
  assert.equal(uploadPath('https://strapi.autodiagnostix.com.pk/uploads/lift_1_abc.png', ORIGINS), 'uploads/lift_1_abc.png');
  assert.equal(uploadPath('/uploads/lift.webp', ORIGINS), 'uploads/lift.webp');
  assert.equal(uploadPath('https://evil.example/uploads/lift.png', ORIGINS), null);
  assert.equal(uploadPath('/images/local.webp', ORIGINS), null);
  assert.equal(uploadPath('https://strapi.autodiagnostix.com.pk/uploads/a.png?x=1', ORIGINS), null);
  assert.equal(uploadPath('', ORIGINS), null);
});

test('responsiveImage builds a srcset and leaves other images untouched', () => {
  const cms = responsiveImage('https://strapi.autodiagnostix.com.pk/uploads/lift.png', ORIGINS, [320, 480, 640]);
  assert.equal(cms.src, '/media/w480/uploads/lift.png.webp');
  assert.equal(cms.srcset, '/media/w320/uploads/lift.png.webp 320w, /media/w480/uploads/lift.png.webp 480w, /media/w640/uploads/lift.png.webp 640w');
  assert.deepEqual(responsiveImage('/images/local.webp', ORIGINS), { src: '/images/local.webp', srcset: undefined });
});

test('media requests are validated: allowed widths, upload paths, no traversal', () => {
  assert.deepEqual(parseMediaRequest('w480', 'uploads/lift.png.webp'), { width: 480, path: 'uploads/lift.png' });
  for (const [width, rest] of [
    ['w481', 'uploads/lift.png.webp'],
    ['480', 'uploads/lift.png.webp'],
    ['w480', 'uploads/lift.png'],
    ['w480', 'uploads/../secrets.png.webp'],
    ['w480', 'uploads/sub/dir.png.webp'],
    ['w480', 'admin/lift.png.webp'],
    ['w480', 'uploads/lift.svg.webp'],
  ]) assert.equal(parseMediaRequest(width, rest), null, `${width}/${rest}`);
});

test('byte LRU evicts least recently used entries beyond its budget', () => {
  const lru = createByteLru(10);
  lru.set('a', new Uint8Array(4));
  lru.set('b', new Uint8Array(4));
  lru.get('a');
  lru.set('c', new Uint8Array(4));
  assert.ok(lru.get('a') && lru.get('c') && !lru.get('b'));
  assert.equal(lru.bytes, 8);
  lru.set('huge', new Uint8Array(11));
  assert.equal(lru.get('huge'), undefined, 'oversized entries are not cached');
});
