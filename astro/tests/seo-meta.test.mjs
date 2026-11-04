import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageTitle, metaDescription } from '../src/utils/seo.mjs';

test('brand suffix is added only when the title stays within 60 characters', () => {
  assert.equal(pageTitle('Privacy Policy'), 'Privacy Policy | Autodiagnostix');
  assert.equal(pageTitle('Buy Scissor Lifts in Pakistan | Liberty & UNITE'), 'Buy Scissor Lifts in Pakistan | Liberty & UNITE');
  assert.equal(pageTitle('Terms of Service | Autodiagnostix'), 'Terms of Service | Autodiagnostix');
  assert.equal(pageTitle('About Autodiagnostix | Pakistan\'s Authorized Dealer'), 'About Autodiagnostix | Pakistan\'s Authorized Dealer');
  assert.equal(pageTitle('Launch, Smartsafe, UNITE & GTI.tools Dealer in Pakistan', { isHome: true }), 'Launch, Smartsafe, UNITE & GTI.tools Dealer in Pakistan | Autodiagnostix');
  assert.match(pageTitle(''), /^Autodiagnostix/);
});

test('generated meta descriptions fit search result snippets', () => {
  const long = 'The CRP 919 MAX is one of the best choices for entry-level technicians, featuring all full system functionality for comprehensive and professional diagnostic business and services. '.repeat(3);
  const out = metaDescription(long);
  assert.ok(out.length <= 159, `${out.length}`);
  assert.ok(out.endsWith('…'));
  assert.equal(metaDescription('Short.'), 'Short.');
});
